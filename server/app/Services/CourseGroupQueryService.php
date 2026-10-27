<?php

namespace App\Services;

use App\Exceptions\BusinessException;
use App\Models\CourseGroup;
use App\Models\User;
use App\Policies\CourseGroupPolicy;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;

class CourseGroupQueryService
{
    public function __construct(
        private CourseGroupPolicy $courseGroupPolicy,
        private UserProfileService $userProfileService
    ) {
    }

    public function getAll(?User $viewer = null)
    {
        if (!$viewer) {
            return CourseGroup::query()->whereRaw('1 = 0')->get();
        }

        if (!$this->courseGroupPolicy->viewAny($viewer)) {
            throw new BusinessException('Không có quyền xem danh sách lớp học', 403);
        }

        $query = CourseGroup::query()
            ->with(['subject', 'teacher'])
            ->where('is_deleted', false);

        if ($viewer->hasRoleCode('ADMIN')) {
            $courseGroups = $query->get();
        } elseif ($viewer->hasRoleCode('TEACHER')) {
            $courseGroups = $query->where('teacher_id', $viewer->id)->get();
        } elseif ($viewer->hasRoleCode('STUDENT')) {
            $courseGroups = $query
                ->whereHas('students', fn ($students) => $students->where('users.id', $viewer->id))
                ->get();
        } else {
            $courseGroups = $query->get();
        }

        $this->loadPersonalProfiles($courseGroups->pluck('teacher')->all());

        return $courseGroups;
    }

    public function getOne(CourseGroup $courseGroup, User $viewer): CourseGroup
    {
        $this->assertCanView($courseGroup, $viewer);

        return $courseGroup;
    }

    public function getWithTeacherAndSubject(CourseGroup $courseGroup, User $viewer): CourseGroup
    {
        $this->assertCanView($courseGroup, $viewer);
        $courseGroup->load(['teacher', 'subject']);
        $this->loadPersonalProfiles([$courseGroup->teacher]);

        return $courseGroup;
    }

    public function getWithExams(CourseGroup $courseGroup, User $viewer): CourseGroup
    {
        $this->assertCanView($courseGroup, $viewer);
        $courseGroup->load(['exams' => fn ($query) => $query->where('exams.is_deleted', false)]);

        return $courseGroup;
    }

    public function getOfStudent(User $user, User $actor): User
    {
        $this->assertCanViewStudentGroups($actor, $user);

        $user->load([
            'courseGroups' => function ($query) {
                $query->where('is_deleted', false)->with(['teacher', 'subject']);
            },
        ]);
        $this->loadPersonalProfiles([$user, ...$user->courseGroups->pluck('teacher')->all()]);
        $user->courseGroups->each(fn ($group) => $group->makeHidden('join_code'));

        return $user;
    }

    public function getAssignedTeachingByTeacherId(
        int $teacherId,
        User $actor,
        bool $includeHidden = false
    ): array {
        $teacher = User::query()->with('role')->findOrFail($teacherId);
        $this->assertCanViewTeacherGroups($actor, $teacher);

        $query = CourseGroup::query()
            ->with([
                'subject',
                'exams' => fn ($examQuery) => $examQuery->where('exams.is_deleted', false),
            ])
            ->where('teacher_id', $teacherId)
            ->where('is_deleted', false)
            ->orderByDesc('id');

        if (!$includeHidden) {
            $query->where('is_hidden', false);
        }

        $courseGroups = $query->get();
        $subjects = $courseGroups->pluck('subject')->filter()->unique('id')->values();

        return [
            'course_groups' => $courseGroups,
            'subjects' => $subjects,
            'summary' => [
                'total_course_groups' => $courseGroups->count(),
                'total_subjects' => $subjects->count(),
            ],
        ];
    }

    public function getWithNotifications(CourseGroup $courseGroup, User $viewer): CourseGroup
    {
        $this->assertCanView($courseGroup, $viewer);
        $notifications = $courseGroup->notifications()->with('sender');

        if ($viewer->hasRoleCode('STUDENT')) {
            $notifications->where('notifications.status', true);
        }

        $courseGroup->setRelation('notifications', $notifications->get());
        $this->loadPersonalProfiles($courseGroup->notifications->pluck('sender')->all());

        return $courseGroup;
    }

    public function getForStudentDetail(CourseGroup $courseGroup, User $viewer): CourseGroup
    {
        $this->assertCanView($courseGroup, $viewer);
        $notifications = $courseGroup->notifications()->with('sender');

        if ($viewer->hasRoleCode('STUDENT')) {
            $notifications->where('notifications.status', true);
        }

        $courseGroup->setRelation('notifications', $notifications->get());
        $courseGroup->load([
            'exams' => fn ($query) => $query->where('exams.is_deleted', false),
            'teacher',
        ]);
        $courseGroup->exams->each(function ($exam): void {
            $exam->start_time = $exam->pivot?->start_time ?? $exam->start_time;
            $exam->end_time = $exam->pivot?->end_time ?? $exam->end_time;
        });

        $students = $courseGroup->students()
            ->where('users.is_deleted', false)
            ->with('role')
            ->get()
            ->filter(fn (User $student) => $student->hasRoleCode('STUDENT'))
            ->values();
        $courseGroup->setRelation('students', $students);

        $this->loadPersonalProfiles([
            $courseGroup->teacher,
            ...$students->all(),
            ...$courseGroup->notifications->pluck('sender')->all(),
        ]);

        return $courseGroup;
    }

    public function getOfTeacher(User $user, User $actor)
    {
        $this->assertCanViewTeacherGroups($actor, $user);

        return $user->managedCourseGroups()
            ->with('subject')
            ->where('is_deleted', false)
            ->get();
    }

    public function assertCanView(CourseGroup $courseGroup, User $viewer): void
    {
        if (!$this->courseGroupPolicy->view($viewer, $courseGroup)) {
            throw new BusinessException('Không có quyền xem nhóm học phần này', 403);
        }
    }

    private function assertCanViewStudentGroups(User $actor, User $student): void
    {
        if (!$this->courseGroupPolicy->viewStudentGroups($actor, $student)) {
            throw new BusinessException('Không có quyền xem danh sách lớp của sinh viên này', 403);
        }
    }

    private function assertCanViewTeacherGroups(User $actor, User $teacher): void
    {
        if (!$this->courseGroupPolicy->viewTeacherGroups($actor, $teacher)) {
            throw new BusinessException('Không có quyền xem danh sách lớp của giảng viên này', 403);
        }
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
