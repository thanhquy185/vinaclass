<?php

namespace App\Services\Authorization;

use App\Models\Permission;
use App\Models\PermissionDetail;
use App\Models\User;
use App\Services\IdentityV2\IdentityV2Definitions;

class PermissionAuthorizer
{
    public function allowedCodes(User $user): array
    {
        $role = $user->role;
        if (!$role || $role->is_deleted) {
            return [];
        }

        $activePermissions = Permission::query()
            ->where('status', true)
            ->whereHas('function', fn ($query) => $query->where('status', true))
            ->with('function')
            ->get(['id', 'code', 'function_id', 'action_code']);

        if ($role->canonicalCode() === 'ADMIN') {
            return $activePermissions->pluck('code')->all();
        }

        $activePermissions = $activePermissions
            ->filter(fn (Permission $permission): bool => $permission->function !== null
                && IdentityV2Definitions::roleCanReceiveFunctionAction(
                    $role,
                    $permission->function->function_name,
                    $permission->action_code
                ))
            ->values();

        $activePermissionIds = $activePermissions->pluck('id')->map(fn ($id) => (int) $id)->all();
        $allowedPermissionIds = $role->permissions()
            ->whereIn('permissions.id', $activePermissionIds)
            ->pluck('permissions.id')
            ->map(fn ($id) => (int) $id)
            ->all();
        $allowedLookup = array_fill_keys($allowedPermissionIds, true);

        $user->permissionDetails()
            ->whereIn('permission_id', $activePermissionIds)
            ->get(['permission_id', 'effect'])
            ->each(function (PermissionDetail $override) use (&$allowedLookup): void {
                $permissionId = (int) $override->permission_id;
                if ($override->effect === 'GRANT') {
                    $allowedLookup[$permissionId] = true;
                } elseif ($override->effect === 'DENY') {
                    unset($allowedLookup[$permissionId]);
                }
            });

        return $activePermissions
            ->filter(fn (Permission $permission) => isset($allowedLookup[(int) $permission->id]))
            ->pluck('code')
            ->values()
            ->all();
    }

    public function allows(User $user, string $permissionCode): bool
    {
        $permission = Permission::query()
            ->with('function')
            ->where('code', $permissionCode)
            ->where('status', true)
            ->whereHas('function', fn ($query) => $query->where('status', true))
            ->first();

        return $permission !== null && $this->allowsPermission($user, $permission);
    }

    public function allowsFunctionAction(User $user, string $functionName, string $actionCode): bool
    {
        $permission = $this->findFunctionAction($functionName, $actionCode);

        return $permission !== null && $this->allowsPermission($user, $permission);
    }

    public function explicitlyDeniesFunctionAction(
        User $user,
        string $functionName,
        string $actionCode
    ): bool {
        $permission = $this->findFunctionAction($functionName, $actionCode);

        return $permission !== null && $user->permissionDetails()
            ->where('permission_id', $permission->id)
            ->where('effect', 'DENY')
            ->exists();
    }

    private function allowsPermission(User $user, Permission $permission): bool
    {
        if (!$permission->status || !$permission->function?->status) {
            return false;
        }

        $role = $user->role;
        if (!$role || $role->is_deleted) {
            return false;
        }

        if (!IdentityV2Definitions::roleCanReceiveFunctionAction(
            $role,
            $permission->function?->function_name ?? '',
            $permission->action_code
        )) {
            return false;
        }

        if ($role->canonicalCode() === 'ADMIN') {
            return true;
        }

        $override = PermissionDetail::query()
            ->where('user_id', $user->id)
            ->where('permission_id', $permission->id)
            ->value('effect');

        if ($override === 'DENY') {
            return false;
        }

        if ($override === 'GRANT') {
            return true;
        }

        return $role->permissions()
            ->where('permissions.id', $permission->id)
            ->where('permissions.status', true)
            ->exists();
    }

    public function explicitlyDenies(User $user, string $permissionCode): bool
    {
        $permissionId = Permission::query()
            ->where('code', $permissionCode)
            ->where('status', true)
            ->whereHas('function', fn ($query) => $query->where('status', true))
            ->value('id');

        return $permissionId !== null
            && $user->permissionDetails()
                ->where('permission_id', $permissionId)
                ->where('effect', 'DENY')
                ->exists();
    }

    private function findFunctionAction(string $functionName, string $actionCode): ?Permission
    {
        return Permission::query()
            ->with('function')
            ->where('action_code', strtoupper($actionCode))
            ->where('status', true)
            ->whereHas('function', fn ($query) => $query
                ->where('function_name', $functionName)
                ->where('status', true))
            ->first();
    }
}
