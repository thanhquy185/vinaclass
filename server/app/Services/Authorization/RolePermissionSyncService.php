<?php

namespace App\Services\Authorization;

use App\Models\Role;
use App\Models\User;
use App\Policies\PermissionAdministrationPolicy;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class RolePermissionSyncService
{
    public function __construct(
        private PermissionAdministrationPolicy $policy,
        private PermissionAdministrationRules $rules,
        private RolePermissionCompatibilityService $rolePermissionCompatibility
    ) {
    }

    public function sync(Role $role, array $permissionIds, User $actor): Role
    {
        $actorId = (int) $actor->id;
        $roleId = (int) $role->id;
        $permissionIds = array_map('intval', $permissionIds);
        if (count($permissionIds) !== count(array_unique($permissionIds))) {
            throw ValidationException::withMessages([
                'permission_ids' => ['Danh sách không được chứa quyền trùng lặp.'],
            ]);
        }

        return DB::transaction(function () use ($actorId, $roleId, $permissionIds): Role {
            $currentActor = User::query()
                ->with('role')
                ->lockForUpdate()
                ->findOrFail($actorId);
            abort_unless($this->policy->manage($currentActor), 403);

            $lockedRole = Role::query()->lockForUpdate()->findOrFail($roleId);
            abort_if($lockedRole->is_deleted, 404);
            if ($this->rules->isAdministratorRole($lockedRole)) {
                throw ValidationException::withMessages([
                    'permission_ids' => ['Không thể chỉnh sửa quyền toàn hệ thống của ADMIN.'],
                ]);
            }

            $this->rules->assertActivePermissionIds($permissionIds);
            $this->rules->assertRolePermissionPolicy($lockedRole, $permissionIds);
            $lockedRole->permissions()->sync($permissionIds);
            $this->rolePermissionCompatibility->syncLegacyPermissionsFromV2(
                $lockedRole,
                $permissionIds
            );

            return $lockedRole->refresh()->load('permissions');
        });
    }
}
