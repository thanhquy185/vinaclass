<?php

namespace App\Services;

use App\Models\TeacherSubject;
use App\Models\User;
use App\Policies\TeacherSubjectPolicy;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;

class TeacherSubjectQueryService
{
    public function __construct(
        private TeacherSubjectPolicy $teacherSubjectPolicy,
        private UserProfileService $userProfileService
    ) {
    }

    public function getAll(User $actor): EloquentCollection
    {
        abort_unless($this->teacherSubjectPolicy->viewOverview($actor), 403);

        $query = $this->eligibleAssignmentsQuery();
        if ($actor->hasRoleCode('TEACHER')) {
            $query->where('teacher_id', $actor->id);
        }

        $assignments = $query
            ->with($this->overviewRelations())
            ->orderByDesc('teacher_id')
            ->orderByDesc('subject_id')
            ->get();

        $this->loadTeacherProfiles($assignments->pluck('teacher')->all());

        return $assignments;
    }

    public function getOverview(User $actor, array $filters): array
    {
        abort_unless($this->teacherSubjectPolicy->viewOverview($actor), 403);

        $baseQuery = $this->eligibleAssignmentsQuery();
        if ($actor->hasRoleCode('TEACHER')) {
            $baseQuery->where('teacher_id', $actor->id);
        }

        $stats = [
            'assignment_count' => (clone $baseQuery)->count(),
            'teacher_count' => (clone $baseQuery)->distinct()->count('teacher_id'),
            'subject_count' => (clone $baseQuery)->distinct()->count('subject_id'),
        ];

        $search = trim((string) ($filters['search'] ?? ''));
        $searchBy = $filters['search_by'] ?? 'teacher';
        $filteredQuery = clone $baseQuery;

        if ($search !== '') {
            $pattern = '%' . $search . '%';

            if ($searchBy === 'subject') {
                $filteredQuery->whereHas('subject', fn (Builder $subjects) => $subjects
                    ->where('subject_code', 'like', $pattern)
                    ->orWhere('subject_name', 'like', $pattern));
            } else {
                $filteredQuery->whereHas('teacher', fn (Builder $teachers) => $teachers
                    ->where('username', 'like', $pattern)
                    ->orWhere('email', 'like', $pattern)
                    ->orWhereHas('profile', fn (Builder $profile) => $profile
                        ->where('full_name', 'like', $pattern))
                    ->orWhereHas('teacherProfile', fn (Builder $profile) => $profile
                        ->where('teacher_code', 'like', $pattern)));
            }
        }

        $teacherPage = $filteredQuery
            ->select('teacher_id')
            ->groupBy('teacher_id')
            ->orderByDesc('teacher_id')
            ->paginate(
                (int) ($filters['per_page'] ?? 10),
                ['teacher_id'],
                'page',
                (int) ($filters['page'] ?? 1)
            );

        $teacherIds = $teacherPage->getCollection()
            ->pluck('teacher_id')
            ->map(fn ($id): int => (int) $id)
            ->all();

        $assignmentQuery = $this->eligibleAssignmentsQuery()
            ->whereIn('teacher_id', $teacherIds);

        if ($search !== '' && $searchBy === 'subject') {
            $pattern = '%' . $search . '%';
            $assignmentQuery->whereHas('subject', fn (Builder $subjects) => $subjects
                ->where('subject_code', 'like', $pattern)
                ->orWhere('subject_name', 'like', $pattern));
        }

        $assignments = $teacherIds === []
            ? new EloquentCollection()
            : $assignmentQuery
                ->with($this->overviewRelations())
                ->orderByDesc('teacher_id')
                ->orderByDesc('subject_id')
                ->get();

        $this->loadTeacherProfiles($assignments->pluck('teacher')->all());

        $groups = $assignments
            ->groupBy('teacher_id')
            ->map(function ($teacherAssignments): array {
                /** @var TeacherSubject $firstAssignment */
                $firstAssignment = $teacherAssignments->first();

                return [
                    'teacher' => $firstAssignment->teacher,
                    'subjects' => $teacherAssignments
                        ->pluck('subject')
                        ->filter()
                        ->values(),
                ];
            })
            ->values();

        return [
            'groups' => $groups,
            'stats' => $stats,
            'pagination' => [
                'current_page' => $teacherPage->currentPage(),
                'page_size' => $teacherPage->perPage(),
                'total' => $teacherPage->total(),
                'last_page' => $teacherPage->lastPage(),
            ],
        ];
    }

    public function getOfTeacher(User $teacher, User $actor): EloquentCollection
    {
        abort_unless(
            $this->teacherSubjectPolicy->viewTeacher($actor, $teacher),
            403
        );

        return $teacher->assignedSubjects()
            ->where('subjects.is_deleted', false)
            ->get();
    }

    private function loadTeacherProfiles(iterable $teachers): void
    {
        $teachers = collect($teachers)
            ->filter(fn ($teacher) => $teacher instanceof User)
            ->unique('id')
            ->values();

        if ($teachers->isEmpty()) {
            return;
        }

        $this->userProfileService->loadPersonalProfiles(
            new EloquentCollection($teachers->all())
        );
    }

    private function eligibleAssignmentsQuery(): Builder
    {
        return TeacherSubject::query()
            ->whereHas('teacher', function (Builder $teachers): void {
                $teachers->where('is_locked', false)
                    ->where('is_deleted', false)
                    ->whereHas('role', function (Builder $roles): void {
                        $roles->where('is_deleted', false)
                            ->where(function (Builder $roleCodes): void {
                                $roleCodes->where('code', 'TEACHER')
                                    ->orWhereRaw('LOWER(role_name) IN (?, ?, ?, ?, ?, ?, ?)', [
                                        'teacher',
                                        'giang vien',
                                        'giang_vien',
                                        'giao vien',
                                        'giao_vien',
                                        'giảng viên',
                                        'giáo viên',
                                    ]);
                            });
                    });
            })
            ->whereHas('subject', fn (Builder $subjects) => $subjects
                ->where('is_deleted', false));
    }

    private function overviewRelations(): array
    {
        return [
            'subject:id,subject_code,subject_name',
            'teacher:id,username,email,role_id',
            'teacher.role',
            'teacher.profile:id,user_id,full_name,phone,date_of_birth,is_female,avatar_url',
            'teacher.teacherProfile:id,user_id,teacher_code',
        ];
    }
}
