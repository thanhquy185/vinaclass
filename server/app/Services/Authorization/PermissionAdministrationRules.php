<?php

namespace App\Services\Authorization;

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use App\Services\IdentityV2\IdentityV2Definitions;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Validation\ValidationException;

class PermissionAdministrationRules
{
    public function roleCode(?Role $role): ?string
    {
        return $role ? ($role->canonicalCode() ?? '') : null;
    }

    public function isAdministratorRole(?Role $role): bool
    {
        return in_array(
            strtoupper(trim((string) $this->roleCode($role))),
            ['ADMIN', 'ADMINISTRATOR'],
            true
        );
    }

    public function assertCanHaveOverrides(User $user): void
    {
        if ($user->is_deleted) {
            abort(404);
        }

        $role = $user->role;
        if (!$role || $role->is_deleted) {
            throw ValidationException::withMessages([
                'overrides' => ['Tài khoản cần có vai trò đang hoạt động trước khi quản lý quyền ngoại lệ.'],
            ]);
        }

        if ($this->isAdministratorRole($role)) {
            throw ValidationException::withMessages([
                'overrides' => ['Tài khoản ADMIN có toàn quyền hệ thống và không dùng quyền ngoại lệ.'],
            ]);
        }
    }

    public function activePermissions(): Builder
    {
        return Permission::query()
            ->where('permissions.status', true)
            ->whereHas('function', fn ($query) => $query->where('status', true));
    }

    public function assertActivePermissionIds(array $permissionIds, string $field = 'permission_ids'): void
    {
        $activePermissionIds = $this->activePermissions()
            ->whereIn('permissions.id', $permissionIds)
            ->pluck('permissions.id')
            ->map(fn ($id) => (int) $id)
            ->all();

        if (count($activePermissionIds) !== count($permissionIds)) {
            throw ValidationException::withMessages([
                $field => ['Danh sách có quyền không tồn tại hoặc đã bị tắt.'],
            ]);
        }
    }

    public function assertRolePermissionPolicy(Role $role, array $permissionIds): void
    {
        $disallowedPermission = Permission::query()
            ->with('function')
            ->whereIn('id', $permissionIds)
            ->get()
            ->first(fn (Permission $permission): bool => $permission->function !== null
                && !IdentityV2Definitions::roleCanReceiveFunctionAction(
                    $role,
                    $permission->function->function_name,
                    $permission->action_code
                ));

        if ($disallowedPermission !== null) {
            throw ValidationException::withMessages([
                'permission_ids' => ['Vai trò này không thể nhận một hoặc nhiều quyền đã chọn.'],
            ]);
        }
    }

    public function filterPermissionIdsForRole(Role $role, array $permissionIds): array
    {
        if ($permissionIds === []) {
            return [];
        }

        return Permission::query()
            ->with('function')
            ->whereIn('id', $permissionIds)
            ->get()
            ->filter(fn (Permission $permission): bool => $permission->function !== null
                && IdentityV2Definitions::roleCanReceiveFunctionAction(
                    $role,
                    $permission->function->function_name,
                    $permission->action_code
                ))
            ->pluck('id')
            ->map(fn ($id) => (int) $id)
            ->all();
    }

    public function assertUserOverridePolicy(User $user, array $overrides): void
    {
        $permissionIds = array_map(
            'intval',
            array_column($overrides, 'permission_id')
        );
        $role = $user->role;

        if (!$role || $permissionIds === []) {
            return;
        }

        try {
            $this->assertRolePermissionPolicy($role, $permissionIds);
        } catch (ValidationException) {
            throw ValidationException::withMessages([
                'overrides' => ['Không thể lưu một hoặc nhiều quyền ngoại lệ cho vai trò của tài khoản này.'],
            ]);
        }
    }
}
