<?php

namespace App\Services;

use App\Exceptions\BusinessException;
use App\Exceptions\NotFoundException;
use App\Models\CourseGroup;
use App\Models\CourseGroupStudent;
use App\Models\User;
use App\Policies\CourseGroupPolicy;
use Illuminate\Http\UploadedFile;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;
use PhpOffice\PhpSpreadsheet\Shared\Date as ExcelDate;

class CourseGroupRosterService
{
    public function __construct(
        private CourseGroupPolicy $courseGroupPolicy,
        private UserProfileService $userProfileService,
        private CourseGroupMembershipService $membershipService
    ) {
    }

    public function importStudentsFromFile(
        CourseGroup $courseGroup,
        UploadedFile $file,
        User $actor
    ): array {
        $sheets = Excel::toArray(null, $file);
        if (empty($sheets) || empty($sheets[0])) {
            throw new NotFoundException('Import file is empty');
        }

        $rows = $sheets[0];
        $firstRow = $rows[0] ?? null;
        if (
            $firstRow &&
            count($firstRow) >= 2 &&
            in_array(trim((string) $firstRow[1]), ['MSSV', 'mssv', 'Mã sinh viên'])
        ) {
            array_shift($rows);
        }

        return $this->importStudentsToGroup($courseGroup, $rows, $actor);
    }

    public function importStudentsToGroup(
        CourseGroup $courseGroup,
        array $rows,
        User $actor
    ): array {
        $courseGroupId = (int) $courseGroup->id;
        $actorId = (int) $actor->id;

        return DB::transaction(function () use ($courseGroupId, $actorId, $rows): array {
            $studentCodes = collect($rows)
                ->filter(fn ($row) => count($row) >= 2)
                ->map(fn ($row) => trim((string) ($row[1] ?? '')))
                ->reject(fn ($code) => $code === '' || in_array($code, [
                    'Tên đăng nhập', 'MSSV', 'STT', 'Username', 'Student ID', 'ID',
                ], true))
                ->unique()
                ->values();
            $studentIdsByUsername = $studentCodes->isEmpty()
                ? []
                : User::query()
                    ->whereIn('username', $studentCodes)
                    ->pluck('id', 'username')
                    ->all();

            $userIds = array_values(array_unique(array_merge(
                [$actorId],
                array_map('intval', array_values($studentIdsByUsername))
            )));
            sort($userIds);

            $lockedUsers = [];
            foreach ($userIds as $userId) {
                $lockedUsers[$userId] = User::query()
                    ->with('role')
                    ->lockForUpdate()
                    ->findOrFail($userId);
            }

            $actor = $lockedUsers[$actorId];
            $studentsByUsername = [];
            foreach ($studentIdsByUsername as $username => $studentId) {
                $student = $lockedUsers[(int) $studentId] ?? null;
                if ($student && $student->username === $username) {
                    $studentsByUsername[$username] = $student;
                }
            }

            $courseGroup = CourseGroup::query()->lockForUpdate()->findOrFail($courseGroupId);
            $this->assertCanManage($courseGroup, $actor, 'update');

            $missing = [];
            $addedUsers = [];

            foreach ($rows as $rowIndex => $row) {
                if (count($row) < 2) {
                    continue;
                }

                $studentCode = isset($row[1]) ? trim((string) $row[1]) : null;
                if (empty($studentCode)) {
                    continue;
                }

                $headerTitles = ['Tên đăng nhập', 'MSSV', 'STT', 'Username', 'Student ID', 'ID'];
                if (in_array($studentCode, $headerTitles, true)) {
                    continue;
                }

                $user = $studentsByUsername[$studentCode] ?? null;
                if (!$user) {
                    $missing[] = [
                        'row' => $rowIndex + 2,
                        'username' => $studentCode,
                        'full_name' => isset($row[2]) ? trim((string) $row[2]) : null,
                        'email' => isset($row[3]) ? trim((string) $row[3]) : null,
                        'phone' => isset($row[4]) ? trim((string) $row[4]) : null,
                        'date_of_birth' => $this->normalizeImportedBirthDate($row[5] ?? null),
                    ];
                    continue;
                }

                // Existing memberships and duplicate rows in the spreadsheet are idempotent.
                $alreadyInGroup = CourseGroupStudent::query()
                    ->where('student_id', $user->id)
                    ->where('course_group_id', $courseGroup->id)
                    ->exists();
                if ($alreadyInGroup) {
                    continue;
                }

                $this->membershipService->addStudentToGroup(
                    $user->username,
                    $courseGroup,
                    $actor
                );
                $addedUsers[] = $user;
            }

            if (empty($addedUsers) && !empty($missing)) {
                throw new NotFoundException('Không có sinh viên nào được thêm vì chưa có tài khoản trong hệ thống.', $missing);
            }

            $this->loadPersonalProfiles($addedUsers);
            $added = collect($addedUsers)
                ->map(fn (User $user) => [
                    'id' => $user->id,
                    'username' => $user->username,
                    'full_name' => $this->userProfileService->personalValue($user, 'full_name'),
                ])
                ->all();

            return [
                'added' => $added,
                'missing' => $missing,
                'count' => count($added),
            ];
        });
    }

    private function assertCanManage(
        CourseGroup $courseGroup,
        User $actor,
        string $action
    ): void {
        if (!$this->courseGroupPolicy->manage($actor, $courseGroup, $action)) {
            throw new BusinessException('Không có quyền quản lý nhóm học phần này', 403);
        }
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

    private function loadPersonalProfiles(iterable $users): void
    {
        $users = collect($users)
            ->filter(fn ($user) => $user instanceof User)
            ->unique('id')
            ->values();

        if ($users->isEmpty()) {
            return;
        }

        $this->userProfileService->loadPersonalProfiles(
            new EloquentCollection($users->all())
        );
    }
}
