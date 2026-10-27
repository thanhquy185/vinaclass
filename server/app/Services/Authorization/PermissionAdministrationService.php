<?php

namespace App\Services\Authorization;

use App\Models\Role;
use App\Models\User;

/**
 * Preserves the administration write contract while delegating each use case.
 */
class PermissionAdministrationService
{
    public function __construct(
        private RolePermissionSyncService $rolePermissionSync,
        private UserPermissionOverrideSyncService $userPermissionOverrideSync
    ) {
    }

    public function syncRolePermissions(Role $role, array $permissionIds, User $actor): Role
    {
        return $this->rolePermissionSync->sync($role, $permissionIds, $actor);
    }

    public function syncUserOverrides(User $user, array $overrides, User $actor): User
    {
        return $this->userPermissionOverrideSync->sync($user, $overrides, $actor);
    }
}
