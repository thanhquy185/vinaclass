<?php

namespace App\Services\Authorization;

use App\Models\FunctionModel;
use App\Models\Role;
use App\Models\User;
use App\Policies\PermissionAdministrationPolicy;

class PermissionMatrixQueryService
{
    public function __construct(
        private PermissionFunctionCatalogQueryService $catalogQuery,
        private PermissionAdministrationPolicy $policy,
        private PermissionAdministrationRules $rules
    ) {
    }

    public function getRoleMatrix(Role $role, User $actor): array
    {
        abort_unless($this->policy->manage($actor), 403);
        abort_if($role->is_deleted, 404);

        $grantedIds = $this->rules->isAdministratorRole($role)
            ? $this->rules->activePermissions()->pluck('permissions.id')->map(fn ($id) => (int) $id)->all()
            : $role->permissions()
                ->where('permissions.status', true)
                ->whereHas('function', fn ($query) => $query->where('status', true))
                ->pluck('permissions.id')
                ->map(fn ($id) => (int) $id)
                ->all();
        $grantedIds = $this->rules->filterPermissionIdsForRole($role, $grantedIds);

        return [
            'role' => [
                'id' => $role->id,
                'code' => $role->code,
                'name' => $role->role_name,
            ],
            'functions' => $this->catalogQuery->activeFunctions()
                ->map(fn (FunctionModel $function) => $this->catalogQuery->serializeFunction(
                    $function,
                    $grantedIds,
                    role: $role
                ))
                ->values(),
        ];
    }

    public function getUserOverrideMatrix(User $user, User $actor): array
    {
        abort_unless($this->policy->manage($actor), 403);
        $this->rules->assertCanHaveOverrides($user);

        $role = $user->role;
        $roleCode = $this->rules->roleCode($role);
        $rolePermissionIds = $role
            ? $role->permissions()
                ->where('permissions.status', true)
                ->whereHas('function', fn ($query) => $query->where('status', true))
                ->pluck('permissions.id')
                ->map(fn ($id) => (int) $id)
                ->all()
            : [];
        $overrides = $user->permissionDetails()
            ->pluck('effect', 'permission_id')
            ->mapWithKeys(fn ($effect, $permissionId) => [(int) $permissionId => $effect])
            ->all();
        if ($role) {
            $allowedOverrideIds = array_fill_keys(
                $this->rules->filterPermissionIdsForRole(
                    $role,
                    array_map('intval', array_keys($overrides))
                ),
                true
            );
            $overrides = array_intersect_key($overrides, $allowedOverrideIds);
            $rolePermissionIds = $this->rules->filterPermissionIdsForRole($role, $rolePermissionIds);
        }

        return [
            'user' => [
                'id' => $user->id,
                'roleCode' => $roleCode,
            ],
            'functions' => $this->catalogQuery->activeFunctions()
                ->map(fn (FunctionModel $function) => $this->catalogQuery->serializeFunction(
                    $function,
                    $rolePermissionIds,
                    $overrides,
                    $role
                ))
                ->values(),
        ];
    }

}
