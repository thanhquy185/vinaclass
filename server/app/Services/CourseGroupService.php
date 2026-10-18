<?php

namespace App\Services;

// use App\Models\ChiTietNhom;
// use App\Models\NhomHocPhan;
use App\Models\User;
use App\Exceptions\BusinessException;
use App\Exceptions\NotFoundException;
use App\Models\CourseGroup;
use App\Models\CourseGroupStudent;
use Illuminate\Validation\ValidationException;
use PhpOffice\PhpSpreadsheet\Shared\Date as ExcelDate;

class CourseGroupService
{
    public function getAll()
    {
        return CourseGroup::all();
    }

    public function getOne(CourseGroup $courseGroup)
    {
        return $courseGroup;
    }

    public function add(array $data)
    {
        // nếu chưa có join_code thì tạo mới
        if (empty($data['join_code'])) {
            $data['join_code'] = $this->generateUniqueInviteCode();
        }

        return CourseGroup::create($data);
    }

    public function update(array $data, CourseGroup $courseGroup)
    {
        $courseGroup->update($data);
        return $courseGroup;
    }

    public function delete(CourseGroup $courseGroup)
    {
        $courseGroup->update(['is_deleted' => true]);
        return true;
    }

    public function hide(CourseGroup $courseGroup)
    {
        $courseGroup->update(['is_hidden' => true]);
        return $courseGroup;
    }

    public function getWithTeacherAndSubject(CourseGroup $courseGroup)
    {
        $courseGroup->load(['teacher', 'subject']);
        return $courseGroup;
    }

    public function getWithExams(CourseGroup $courseGroup)
    {
        $courseGroup->load(['exams']);
        return $courseGroup;
    }

    public function joinGroup(array $data)
    {
        $joinCode = $data["join_code"];
        $studentId = $data["student_id"];

        // Tìm nhóm học phần theo mã mời
        $courseGroup = CourseGroup::where("join_code", $joinCode)->first();

        if (!$courseGroup) {
            throw ValidationException::withMessages([
                'code' => ['Invitation code does not exist'],
            ]);
        }

        // Kiểm tra sinh viên đã ở trong nhóm chưa
        $exists = CourseGroupStudent::where("student_id", $studentId)
            ->where("course_group_id", $courseGroup->id)
            ->exists();

        if ($exists) {
            throw ValidationException::withMessages([
                'student' => ['Student has already joined this group'],
            ]);
        }

        // Tạo chi tiết nhóm
        $courseGroupStudent = [
            "student_id" => $studentId,
            "course_group_id" => $courseGroup->id
        ];

        return CourseGroupStudent::create($courseGroupStudent);
    }

    public function getOfStudent(User $user)
    {
        $user->load([
            'courseGroups.teacher',
            'courseGroups.subject'
        ]);
        return $user;
    }

    public function getStudentList(CourseGroup $courseGroup, ?string $keyword = null): array
    {
        $query = $courseGroup->students()
            ->where('users.is_student', true)
            ->where('users.is_deleted', false)
            ->orderBy('users.full_name');

        if (!empty($keyword)) {
            $keyword = trim($keyword);
            $query->where(function ($q) use ($keyword) {
                $q->where('users.full_name', 'like', "%{$keyword}%")
                    ->orWhere('users.username', 'like', "%{$keyword}%")
                    ->orWhere('users.email', 'like', "%{$keyword}%");
            });
        }

        $students = $query->get()->makeHidden('pivot');

        if (empty($keyword) && $students->isEmpty()) {
            throw new NotFoundException('Course group has no students yet, please add new students.');
        }

        return [
            'course_group_id' => $courseGroup->id,
            'total_students' => $students->count(),
            'keyword' => $keyword,
            'students' => $students,
        ];
    }

    public function getStudentsExport(CourseGroup $courseGroup, ?string $keyword = null): array
    {
        $list = $this->getStudentList($courseGroup, $keyword);
        $students = collect($list['students']);

        $rows = $students->values()->map(function ($student, $index) {
            $date_of_birth = $student->date_of_birth ? $student->date_of_birth->format('d-m-Y') : '';

            return [
                $index + 1,
                $student->username,
                $student->full_name,
                $student->email,
                $student->phone,
                $date_of_birth,
            ];
        })->toArray();

        return [
            'fileNameAttributes' => [
                'academic_year' => $courseGroup->academic_year,
                'semester' => $courseGroup->semester,
                'course_group_name' => $courseGroup->group_name,
                'course_group_id' => $courseGroup->id,
            ],
            'headerTitles' => [
                'STT',
                'Tên đăng nhập',
                'Tên sinh viên',
                'Email',
                'SĐT',
                'Ngày sinh',
            ],
            'data' => $rows,
        ];
    }

    public function importStudentsToGroup(CourseGroup $courseGroup, array $rows): array
    {
        $missing = [];
        $added = [];

        foreach ($rows as $rowIndex => $row) {
            if (count($row) < 2) {
                continue;
            }

            $studentCode = isset($row[1]) ? trim((string)$row[1]) : null;

            if (empty($studentCode)) {
                continue;
            }

            $headerTitles = ['Tên đăng nhập', 'MSSV', 'STT', 'Username', 'Student ID', 'ID'];
            if (in_array($studentCode, $headerTitles, true)) {
                continue;
            }

            $user = User::query()->where('username', $studentCode)->first();
            if (!$user) {
                $missing[] = [
                    'row' => $rowIndex + 2,
                    'username' => $studentCode,
                    'full_name' => isset($row[2]) ? trim((string)$row[2]) : null,
                    'email' => isset($row[3]) ? trim((string)$row[3]) : null,
                    'phone' => isset($row[4]) ? trim((string)$row[4]) : null,
                    'date_of_birth' => $this->normalizeImportedBirthDate($row[5] ?? null),
                ];
                continue;
            }

            try {
                $this->addStudentToGroup($user->username, $courseGroup);
                $added[] = ['id' => $user->id, 'username' => $user->username, 'full_name' => $user->full_name];
            } catch (BusinessException $e) {
                if (str_contains($e->getMessage(), 'already in the group')) {
                    continue;
                }
                throw $e;
            }
        }

        if (empty($added) && !empty($missing)) {
            throw new NotFoundException('No students were added to the group because none of them have a system account:', $missing);
        }

        return [
            'added' => $added,
            'missing' => $missing,
            'count' => count($added),
        ];
    }

    public function addStudentToGroup(string $username, CourseGroup $courseGroup)
    {
        $user = User::query()->where('username', $username)->first();

        if (!$user) {
            throw new NotFoundException('User does not exist');
        }

        if (!$user->is_student) {
            throw new BusinessException('User is not a student');
        }

        if ($user->is_deleted) {
            throw new BusinessException('User has been deleted');
        }

        $exists = CourseGroupStudent::where('student_id', $user->id)
            ->where('course_group_id', $courseGroup->id)
            ->exists();

        if ($exists) {
            throw new BusinessException('Student is already in this course group');
        }

        return CourseGroupStudent::create([
            'student_id' => $user->id,
            'course_group_id' => $courseGroup->id,
        ]);
    }

    public function resetInviteCode(CourseGroup $courseGroup)
    {
        $courseGroup->update(['join_code' => $this->generateUniqueInviteCode()]);
        return $courseGroup;
    }

    private function generateUniqueInviteCode(int $length = 8): string
    {
        $characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        $maxIndex = strlen($characters) - 1;

        do {
            $code = '';
            for ($i = 0; $i < $length; $i++) {
                $code .= $characters[random_int(0, $maxIndex)];
            }
        } while (CourseGroup::query()->where('join_code', $code)->exists());

        return $code;
    }

    public function getAssignedTeachingByTeacherId(int $lecturerId, bool $includeHidden = false): array
    {
        $query = CourseGroup::query()
            ->with(['subject', 'exams'])
            ->where('teacher_id', $lecturerId)
            ->where('is_deleted', false)
            ->orderByDesc('id');

        if (!$includeHidden) {
            $query->where('is_hidden', false);
        }

        $courseGroups = $query->get();

        $subjects = $courseGroups
            ->pluck('subject')
            ->filter()
            ->unique('id')
            ->values();

        return [
            'course_groups' => $courseGroups,
            'subjects' => $subjects,
            'summary' => [
                'total_course_groups' => $courseGroups->count(),
                'total_subjects' => $subjects->count(),
            ],
        ];
    }

    public function removeStudentFromGroup(int $studentId, CourseGroup $courseGroup): bool
    {
        $deleted = CourseGroupStudent::where('student_id', $studentId)
            ->where('course_group_id', $courseGroup->id)
            ->delete();

        if ($deleted === 0) {
            throw new NotFoundException('Student does not exist in this course group');
        }

        return true;
    }

    private function normalizeImportedBirthDate($value): ?string
    {
        if ($value === null) {
            return null;
        }

        if (is_string($value)) {
            $value = trim($value);
            if ($value === '') {
                return null;
            }
        }

        if (is_numeric($value)) {
            try {
                return ExcelDate::excelToDateTimeObject((float) $value)->format('d-m-Y');
            } catch (\Throwable $e) {
                return (string) $value;
            }
        }

        $raw = (string) $value;
        $parsed = \DateTime::createFromFormat('d-m-Y', $raw);
        if ($parsed !== false) {
            return $parsed->format('d-m-Y');
        }

        $timestamp = strtotime($raw);
        if ($timestamp !== false) {
            return date('d-m-Y', $timestamp);
        }

        return $raw;
    }

    public function getWithNotifications(CourseGroup $courseGroup)
    {
        $courseGroup->load('notifications.sender');
        return $courseGroup;
    }

    public function getForStudentDetail(CourseGroup $courseGroup)
    {
        $courseGroup->load(['notifications.sender', 'exams', 'students', 'teacher']);
        return $courseGroup;
    }

    public function getOfTeacher(User $user)
    {
        $courseGroups = $user->managedCourseGroups;
        return $courseGroups;
    }
}
