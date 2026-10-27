<?php

namespace App\Policies;

use App\Models\CourseGroup;
use App\Models\Exam;
use App\Models\User;
use App\Services\Authorization\PermissionAuthorizer;
use App\Services\RoleService;

class ExamPolicy
{
    public function __construct(
        private PermissionAuthorizer $authorizer,
        private RoleService $roleService,
        private CourseGroupPolicy $courseGroupPolicy
    ) {
    }

    public function viewCatalog(User $user): bool
    {
        if ($user->is_locked || $user->is_deleted) {
            return false;
        }

        return $this->allows($user, 'view');
    }

    public function create(User $user): bool
    {
        if ($user->is_locked || $user->is_deleted || $user->hasRoleCode('STUDENT')) {
            return false;
        }

        return $this->allows($user, 'create');
    }

    public function assignCourseGroups(User $user): bool
    {
        if ($user->is_locked || $user->is_deleted || $user->hasRoleCode('STUDENT')) {
            return false;
        }

        if ($user->hasRoleCode('ADMIN') || config('authorization.driver', 'legacy') !== 'v2') {
            return true;
        }

        return $this->authorizer->allowsFunctionAction($user, 'de_thi', 'assign');
    }

    public function view(User $user, Exam $exam): bool
    {
        if ($exam->is_deleted || $user->is_locked || $user->is_deleted) {
            return false;
        }

        if (!$this->allows($user, 'view')) {
            return false;
        }

        if ($user->hasRoleCode('ADMIN')) {
            return true;
        }

        if ($user->isCustomRole()) {
            return true;
        }

        if ($user->hasRoleCode('TEACHER')) {
            return (int) $exam->creator_id === (int) $user->id
                || $exam->courseGroups()
                    ->where('course_groups.teacher_id', $user->id)
                    ->where('course_groups.is_deleted', false)
                    ->exists();
        }

        return $user->hasRoleCode('STUDENT');
    }

    public function manage(User $user, Exam $exam, string $action): bool
    {
        if ($exam->is_deleted || $user->is_locked || $user->is_deleted) {
            return false;
        }

        if ($user->hasRoleCode('ADMIN')) {
            return true;
        }

        if ($user->isCustomRole()) {
            return $this->allows($user, $action);
        }

        if (
            !$user->hasRoleCode('TEACHER')
            || (int) $exam->creator_id !== (int) $user->id
        ) {
            return false;
        }

        $hasAssignedSubject = $user->assignedSubjects()
            ->whereKey($exam->subject_id)
            ->where('subjects.is_deleted', false)
            ->exists();

        return $hasAssignedSubject && $this->allows($user, $action);
    }

    public function viewStudentExams(User $actor, User $student): bool
    {
        if (
            $actor->is_locked
            || $actor->is_deleted
            || $student->is_locked
            || $student->is_deleted
            || !$student->hasRoleCode('STUDENT')
            || ((int) $actor->id !== (int) $student->id && !$actor->hasRoleCode('ADMIN'))
        ) {
            return false;
        }

        return $this->canViewFunction($actor);
    }

    public function viewStudentProgress(User $actor, CourseGroup $courseGroup, User $student): bool
    {
        if (
            $courseGroup->is_deleted
            || $actor->is_locked
            || $actor->is_deleted
            || $student->is_locked
            || $student->is_deleted
            || !$student->hasRoleCode('STUDENT')
            || !$courseGroup->students()->whereKey($student->id)->exists()
            || !$this->canViewFunction($actor)
        ) {
            return false;
        }

        return $actor->hasRoleCode('ADMIN')
            || ($actor->hasRoleCode('STUDENT') && (int) $actor->id === (int) $student->id)
            || ($actor->hasRoleCode('TEACHER') && (int) $courseGroup->teacher_id === (int) $actor->id)
            || ($actor->isCustomRole()
                && $this->courseGroupPolicy->view($actor, $courseGroup));
    }

    public function viewGroupResults(User $actor, CourseGroup $courseGroup, Exam $exam): bool
    {
        if (
            $courseGroup->is_deleted
            || $exam->is_deleted
            || $actor->is_locked
            || $actor->is_deleted
            || !$courseGroup->exams()->whereKey($exam->id)->exists()
        ) {
            return false;
        }

        if (!$this->allows($actor, 'view')) {
            return false;
        }

        return $actor->hasRoleCode('ADMIN')
            || ($actor->hasRoleCode('TEACHER')
                && (int) $courseGroup->teacher_id === (int) $actor->id)
            || ($actor->isCustomRole()
                && $this->courseGroupPolicy->view($actor, $courseGroup));
    }

    private function canViewFunction(User $user): bool
    {
        return $this->allows($user, 'view');
    }

    private function allows(User $user, string $action): bool
    {
        return $this->allowsFunctionAction($user, 'de_thi', $action);
    }

    private function allowsFunctionAction(User $user, string $function, string $action): bool
    {
        if ($user->hasRoleCode('ADMIN')) {
            return true;
        }

        if (config('authorization.driver', 'legacy') === 'v2') {
            return $this->authorizer->allowsFunctionAction($user, $function, $action);
        }

        if ($user->role_id !== null) {
            return $this->roleService->hasRole((int) $user->role_id, $action . '_' . $function);
        }

        return $function === 'de_thi'
            && $user->hasRoleCode('STUDENT')
            && $action === 'view';
    }
}
