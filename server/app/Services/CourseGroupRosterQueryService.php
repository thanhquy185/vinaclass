<?php

namespace App\Services;

use App\Exceptions\BusinessException;
use App\Models\CourseGroup;
use App\Models\User;
use App\Policies\CourseGroupPolicy;
use DateTimeInterface;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;

class CourseGroupRosterQueryService
{
    public function __construct(
        private CourseGroupPolicy $courseGroupPolicy,
        private UserProfileService $userProfileService
    ) {
    }

    public function getStudentList(
        CourseGroup $courseGroup,
        ?string $keyword,
        User $actor
    ): array {
        $this->assertCanView($courseGroup, $actor);

        $hasUserProfiles = $this->userProfileService->hasPersonalProfileTable();
        $hasLegacyFullName = $this->userProfileService->hasLegacyPersonalColumn('full_name');
        $query = $courseGroup->students()
            ->where('users.is_deleted', false);

        $nameExpressions = [];
        if ($hasUserProfiles) {
            $nameExpressions[] = "(SELECT NULLIF(user_profiles.full_name, '') " .
                'FROM user_profiles WHERE user_profiles.user_id = users.id)';
        }
        if ($hasLegacyFullName) {
            $nameExpressions[] = 'users.full_name';
        }
        $nameExpression = count($nameExpressions) > 1
            ? 'COALESCE(' . implode(', ', $nameExpressions) . ')'
            : ($nameExpressions[0] ?? null);
        $query->orderByRaw($nameExpression ?? 'users.username');

        if (!empty($keyword)) {
            $keyword = trim($keyword);
            $query->where(function ($query) use ($keyword, $nameExpression): void {
                if ($nameExpression !== null) {
                    $query->whereRaw("{$nameExpression} LIKE ?", ["%{$keyword}%"]);
                    $query->orWhere('users.username', 'like', "%{$keyword}%");
                } else {
                    $query->where('users.username', 'like', "%{$keyword}%");
                }

                $query->orWhere('users.email', 'like', "%{$keyword}%");
            });
        }

        $students = $query->with('role')->get()
            ->filter(fn (User $student) => $student->hasRoleCode('STUDENT'))
            ->values()
            ->makeHidden('pivot');

        $this->loadPersonalProfiles($students->all());

        return [
            'course_group_id' => $courseGroup->id,
            'total_students' => $students->count(),
            'keyword' => $keyword,
            'students' => $students,
        ];
    }

    public function getStudentsExport(
        CourseGroup $courseGroup,
        ?string $keyword,
        User $actor
    ): array {
        $list = $this->getStudentList($courseGroup, $keyword, $actor);
        $students = collect($list['students']);

        $rows = $students->values()->map(function ($student, $index) {
            return [
                $index + 1,
                $student->username,
                $this->userProfileService->personalValue($student, 'full_name'),
                $student->email,
                $this->userProfileService->personalValue($student, 'phone'),
                $this->formatBirthDate(
                    $this->userProfileService->personalValue($student, 'date_of_birth')
                ),
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

    private function assertCanView(CourseGroup $courseGroup, User $actor): void
    {
        if (!$this->courseGroupPolicy->manage($actor, $courseGroup, 'view')) {
            throw new BusinessException('Không có quyền quản lý nhóm học phần này', 403);
        }
    }

    private function formatBirthDate(mixed $value): string
    {
        if (!$value) {
            return '';
        }

        if ($value instanceof DateTimeInterface) {
            return $value->format('d-m-Y');
        }

        $timestamp = strtotime((string) $value);

        return $timestamp === false ? '' : date('d-m-Y', $timestamp);
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
