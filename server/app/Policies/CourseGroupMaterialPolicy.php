<?php

namespace App\Policies;

use App\Models\CourseGroup;
use App\Models\CourseGroupMaterial;
use App\Models\User;
use App\Services\Authorization\PermissionAuthorizer;
use App\Services\RoleService;

class CourseGroupMaterialPolicy
{
    public function __construct(
        private PermissionAuthorizer $authorizer,
        private RoleService $roleService,
        private CourseGroupPolicy $courseGroupPolicy
    ) {
    }

    public function viewAny(User $user, CourseGroup $courseGroup): bool
    {
        return $this->hasActiveAccount($user)
            && !$courseGroup->is_deleted
            && $this->allows($user, 'view')
            && $this->courseGroupPolicy->view($user, $courseGroup);
    }

    public function create(User $user, CourseGroup $courseGroup): bool
    {
        return $this->canManage($user, $courseGroup) && $this->allows($user, 'create');
    }

    public function view(User $user, CourseGroupMaterial $material): bool
    {
        $courseGroup = $material->courseGroup;

        return !$material->is_deleted
            && $courseGroup !== null
            && $this->viewAny($user, $courseGroup);
    }

    public function update(User $user, CourseGroupMaterial $material): bool
    {
        return $this->belongsToActiveClass($material)
            && $this->canManage($user, $material->courseGroup)
            && $this->allows($user, 'update');
    }

    public function delete(User $user, CourseGroupMaterial $material): bool
    {
        return $this->belongsToActiveClass($material)
            && $this->canManage($user, $material->courseGroup)
            && $this->allows($user, 'delete');
    }

    private function belongsToActiveClass(CourseGroupMaterial $material): bool
    {
        return !$material->is_deleted
            && $material->courseGroup !== null
            && !$material->courseGroup->is_deleted;
    }

    private function canManage(User $user, CourseGroup $courseGroup): bool
    {
        return $this->hasActiveAccount($user)
            && !$courseGroup->is_deleted
            && $this->courseGroupPolicy->view($user, $courseGroup);
    }

    private function hasActiveAccount(User $user): bool
    {
        return !$user->is_locked && !$user->is_deleted;
    }

    private function allows(User $user, string $action): bool
    {
        if ($user->hasRoleCode('ADMIN')) {
            return true;
        }

        if (config('authorization.driver', 'legacy') === 'v2') {
            return $this->authorizer->allowsFunctionAction($user, 'tai_lieu', $action);
        }

        if ($user->role_id !== null) {
            return $this->roleService->hasRole((int) $user->role_id, $action . '_tai_lieu');
        }

        return $user->hasRoleCode('STUDENT') && $action === 'view';
    }
}
