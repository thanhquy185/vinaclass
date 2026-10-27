<?php

namespace App\Policies;

use App\Models\CourseGroup;
use App\Models\User;
use App\Services\Authorization\PermissionAuthorizer;
use App\Services\RoleService;

class CourseGroupPolicy
{
    public function __construct(
        private PermissionAuthorizer $authorizer,
        private RoleService $roleService
    ) {
    }

    public function create(User $user): bool
    {
        if ($user->is_locked || $user->is_deleted) {
            return false;
        }

        return $this->allows($user, 'create');
    }

    public function viewAny(User $user): bool
    {
        if ($user->is_locked || $user->is_deleted) {
            return false;
        }

        return $this->allows($user, 'view');
    }

    public function join(User $user): bool
    {
        if ($user->is_locked || $user->is_deleted || !$user->hasRoleCode('STUDENT')) {
            return false;
        }

        return $this->allows($user, 'view');
    }

    public function view(User $user, CourseGroup $courseGroup): bool
    {
        if ($courseGroup->is_deleted || $user->is_locked || $user->is_deleted) {
            return false;
        }

        if (!$this->allows($user, 'view')) {
            return false;
        }

        if ($user->hasRoleCode('ADMIN')) {
            return true;
        }

        if ($user->hasRoleCode('TEACHER')) {
            return (int) $courseGroup->teacher_id === (int) $user->id;
        }

        if ($user->hasRoleCode('STUDENT')) {
            return $user->courseGroups()->whereKey($courseGroup->id)->exists();
        }

        return $this->isCustomRole($user);
    }

    public function viewStudentGroups(User $actor, User $student): bool
    {
        return $this->canViewOwnedGroups($actor, $student, 'STUDENT');
    }

    public function viewTeacherGroups(User $actor, User $teacher): bool
    {
        return $this->canViewOwnedGroups($actor, $teacher, 'TEACHER');
    }

    public function manage(User $user, CourseGroup $courseGroup, string $action = 'update'): bool
    {
        if ($courseGroup->is_deleted || $user->is_locked || $user->is_deleted) {
            return false;
        }

        return $this->allows($user, $action)
            && ($user->hasRoleCode('ADMIN')
                || $this->isCustomRole($user)
                || ($user->hasRoleCode('TEACHER')
                    && (int) $courseGroup->teacher_id === (int) $user->id));
    }

    public function update(User $user, CourseGroup $courseGroup): bool
    {
        return $this->manage($user, $courseGroup, 'update');
    }

    private function canViewOwnedGroups(User $actor, User $target, string $targetRole): bool
    {
        if (
            $actor->is_locked
            || $actor->is_deleted
            || $target->is_locked
            || $target->is_deleted
            || !$target->hasRoleCode($targetRole)
            || ((int) $actor->id !== (int) $target->id
                && !$actor->hasRoleCode('ADMIN')
                && !$this->isCustomRole($actor))
        ) {
            return false;
        }

        return $this->allows($actor, 'view');
    }

    private function allows(User $user, string $action): bool
    {
        if ($user->hasRoleCode('ADMIN')) {
            return true;
        }

        if (config('authorization.driver', 'legacy') === 'v2') {
            return $this->authorizer->allowsFunctionAction($user, 'hoc_phan', $action);
        }

        if ($user->role_id !== null) {
            return $this->roleService->hasRole((int) $user->role_id, $action . '_hoc_phan');
        }

        return $user->hasRoleCode('STUDENT') && $action === 'view';
    }

    private function isCustomRole(User $user): bool
    {
        return $user->isCustomRole();
    }
}
