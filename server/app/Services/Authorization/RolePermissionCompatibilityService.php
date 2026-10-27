<?php

namespace App\Services\Authorization;

use App\Models\Permission;
use App\Models\Role;
use App\Models\RoleDetail;
use App\Services\IdentityV2\IdentityV2Definitions;
use Illuminate\Support\Facades\Schema;

class RolePermissionCompatibilityService
{
    private const CRUD_PERMISSION_ACTIONS = ['VIEW', 'CREATE', 'UPDATE', 'DELETE'];

    private const PERMISSION_ACTION_TO_LEGACY = [
        'VIEW' => 'VIEW',
        'CREATE' => 'ADD',
        'UPDATE' => 'UPDATE',
        'DELETE' => 'DELETE',
    ];

    public function syncV2PermissionsFromLegacy(Role $role): void
    {
        if (!$this->hasRequiredTables() || !Permission::query()->exists()) {
            return;
        }

        $legacyGrants = RoleDetail::query()
            ->where('role_id', $role->id)
            ->with('function')
            ->get(['role_id', 'function_id', 'action'])
            ->mapWithKeys(function (RoleDetail $detail) use ($role): array {
                $functionName = $detail->function?->function_name;
                if ($functionName === null) {
                    return [];
                }

                $mappedAction = IdentityV2Definitions::mapLegacyRoleAction(
                    $role,
                    $functionName,
                    $detail->action
                );
                if ($mappedAction === null || !in_array($mappedAction, self::CRUD_PERMISSION_ACTIONS, true)) {
                    return [];
                }

                return [((int) $detail->function_id) . ':' . $mappedAction => true];
            });

        $permissionIds = Permission::query()
            ->whereIn('action_code', self::CRUD_PERMISSION_ACTIONS)
            ->where('status', true)
            ->whereHas('function', fn ($query) => $query->where('status', true))
            ->get(['id', 'function_id', 'action_code'])
            ->filter(fn (Permission $permission) => isset(
                $legacyGrants[((int) $permission->function_id) . ':' . $permission->action_code]
            ))
            ->pluck('id')
            ->map(fn ($id) => (int) $id)
            ->all();

        $crudPermissionIds = Permission::query()
            ->whereIn('action_code', self::CRUD_PERMISSION_ACTIONS)
            ->pluck('id')
            ->map(fn ($id) => (int) $id)
            ->all();

        if ($crudPermissionIds !== []) {
            $role->permissions()->detach($crudPermissionIds);
        }

        if ($permissionIds !== []) {
            $role->permissions()->syncWithoutDetaching($permissionIds);
        }

        $disallowedPermissionIds = Permission::query()
            ->with('function')
            ->get()
            ->filter(function (Permission $permission) use ($role): bool {
                $functionName = $permission->function?->function_name;

                return $functionName !== null
                    && !IdentityV2Definitions::roleCanReceiveFunctionAction(
                        $role,
                        $functionName,
                        $permission->action_code
                    );
            })
            ->pluck('id')
            ->map(fn ($id) => (int) $id)
            ->all();

        if ($disallowedPermissionIds !== []) {
            $role->permissions()->detach($disallowedPermissionIds);
        }
    }

    public function syncLegacyPermissionsFromV2(Role $role, array $permissionIds): void
    {
        if (!$this->hasRequiredTables()) {
            return;
        }

        $permissionRows = Permission::query()
            ->whereIn('id', $permissionIds)
            ->whereIn('action_code', array_keys(self::PERMISSION_ACTION_TO_LEGACY))
            ->get(['function_id', 'action_code']);

        RoleDetail::query()
            ->where('role_id', $role->id)
            ->whereIn('action', ['VIEW', 'ADD', 'CREATE', 'UPDATE', 'DELETE'])
            ->delete();

        $timestamp = now();
        $legacyRows = $permissionRows
            ->map(fn (Permission $permission) => [
                'role_id' => $role->id,
                'function_id' => $permission->function_id,
                'action' => self::PERMISSION_ACTION_TO_LEGACY[$permission->action_code],
                'created_at' => $timestamp,
                'updated_at' => $timestamp,
            ])
            ->unique(fn (array $row) => $row['function_id'] . ':' . $row['action'])
            ->values()
            ->all();

        if ($legacyRows !== []) {
            RoleDetail::query()->insert($legacyRows);
        }
    }

    private function hasRequiredTables(): bool
    {
        return Schema::hasTable('permissions')
            && Schema::hasTable('role_permissions')
            && Schema::hasTable('role_details');
    }
}
