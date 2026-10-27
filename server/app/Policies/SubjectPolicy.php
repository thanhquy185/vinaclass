<?php

namespace App\Policies;

use App\Models\Subject;
use App\Models\User;
use App\Services\Authorization\PermissionAuthorizer;
use App\Services\RoleService;

class SubjectPolicy
{
    public function __construct(
        private PermissionAuthorizer $authorizer,
        private RoleService $roleService
    ) {
    }

    public function viewCatalog(User $user): bool
    {
        if ($user->is_locked || $user->is_deleted || $user->hasRoleCode('STUDENT')) {
            return false;
        }

        if ($user->hasRoleCode('ADMIN', 'TEACHER')) {
            return true;
        }

        return $this->allowsAction($user, 'mon_hoc', 'view')
            || $this->allowsAction($user, 'cau_hoi', 'view');
    }

    public function view(User $user, Subject $subject): bool
    {
        if ($subject->is_deleted || !$this->viewCatalog($user)) {
            return false;
        }

        if ($user->hasRoleCode('ADMIN')) {
            return true;
        }

        if ($user->hasRoleCode('TEACHER')) {
            return $user->assignedSubjects()
                ->whereKey($subject->id)
                ->where('subjects.is_deleted', false)
                ->exists();
        }

        return $this->allowsAction($user, 'mon_hoc', 'view')
            || $this->allowsAction($user, 'cau_hoi', 'view');
    }

    public function manage(User $user, string $action): bool
    {
        if (
            $user->is_locked
            || $user->is_deleted
            || $user->hasRoleCode('STUDENT')
        ) {
            return false;
        }

        return $user->hasRoleCode('ADMIN') || $this->allowsAction($user, 'mon_hoc', $action);
    }

    public function viewWithCourseGroups(User $user): bool
    {
        if ($user->is_locked || $user->is_deleted) {
            return false;
        }

        return $user->hasRoleCode('ADMIN')
            || ($user->isCustomRole()
                && $this->allowsAction($user, 'mon_hoc', 'view')
                && $this->allowsAction($user, 'hoc_phan', 'view'));
    }

    public function viewTeacherSubjects(User $actor, User $teacher): bool
    {
        if (
            $actor->is_locked
            || $actor->is_deleted
            || $teacher->is_locked
            || $teacher->is_deleted
            || !$teacher->hasRoleCode('TEACHER')
        ) {
            return false;
        }

        return $actor->hasRoleCode('ADMIN')
            || ($actor->isCustomRole()
                && $this->allowsAction($actor, 'phan_cong', 'view'))
            || (int) $actor->id === (int) $teacher->id;
    }

    private function allowsAction(User $user, string $function, string $action): bool
    {
        if (config('authorization.driver', 'legacy') === 'v2') {
            return $this->authorizer->allowsFunctionAction($user, $function, $action);
        }

        return $user->role_id
            && $this->roleService->hasRole((int) $user->role_id, $action . '_' . $function);
    }
}
