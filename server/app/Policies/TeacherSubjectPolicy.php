<?php

namespace App\Policies;

use App\Models\User;
use App\Services\Authorization\PermissionAuthorizer;
use App\Services\RoleService;

class TeacherSubjectPolicy
{
    public function __construct(
        private PermissionAuthorizer $authorizer,
        private RoleService $roleService
    ) {
    }

    public function viewAll(User $actor): bool
    {
        return $this->isActive($actor)
            && ($actor->hasRoleCode('ADMIN')
                || ($actor->isCustomRole() && $this->allowsAction($actor, 'view')));
    }

    public function viewOverview(User $actor): bool
    {
        if (!$this->isActive($actor)) {
            return false;
        }

        if ($actor->hasRoleCode('ADMIN')) {
            return true;
        }

        if ($actor->hasRoleCode('TEACHER')) {
            return $this->viewTeacher($actor, $actor);
        }

        return !$actor->hasRoleCode('STUDENT')
            && $this->allowsAction($actor, 'view');
    }

    public function viewTeacher(User $actor, User $teacher): bool
    {
        if (
            !$this->isActive($actor)
            || !$this->isActive($teacher)
            || !$teacher->hasRoleCode('TEACHER')
        ) {
            return false;
        }

        if ($actor->hasRoleCode('ADMIN')) {
            return true;
        }

        if ($actor->isCustomRole()) {
            return $this->allowsAction($actor, 'view');
        }

        return $actor->hasRoleCode('TEACHER')
            && (int) $actor->id === (int) $teacher->id
            && $this->allowsAction($actor, 'view');
    }

    public function manage(User $actor, string $action): bool
    {
        return $this->isActive($actor)
            && !$actor->hasRoleCode('TEACHER', 'STUDENT')
            && $this->allowsAction($actor, $action);
    }

    private function isActive(User $user): bool
    {
        return !$user->is_locked && !$user->is_deleted;
    }

    private function allowsAction(User $user, string $action): bool
    {
        if ($user->hasRoleCode('ADMIN')) {
            return true;
        }

        if (config('authorization.driver', 'legacy') === 'v2') {
            return $this->authorizer->allowsFunctionAction($user, 'phan_cong', $action);
        }

        if (strtolower($action) === 'assign') {
            return $user->role_id && (
                $this->roleService->hasRole((int) $user->role_id, 'create_phan_cong')
                || $this->roleService->hasRole((int) $user->role_id, 'update_phan_cong')
            );
        }

        return $user->role_id
            && $this->roleService->hasRole((int) $user->role_id, $action . '_phan_cong');
    }
}
