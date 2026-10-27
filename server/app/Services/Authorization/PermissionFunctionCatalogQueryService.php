<?php

namespace App\Services\Authorization;

use App\Models\FunctionModel;
use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use App\Policies\PermissionAdministrationPolicy;
use App\Services\IdentityV2\IdentityV2Definitions;
use Illuminate\Support\Collection;

class PermissionFunctionCatalogQueryService
{
    private const ACTION_SORT_ORDER = [
        'VIEW' => 10,
        'CREATE' => 20,
        'UPDATE' => 30,
        'DELETE' => 40,
        'LOCK' => 50,
        'PUBLISH' => 60,
        'ASSIGN' => 70,
        'GRADE' => 80,
    ];

    public function __construct(private PermissionAdministrationPolicy $policy)
    {
    }

    public function getCatalog(User $actor): array
    {
        abort_unless($this->policy->manage($actor), 403);

        return [
            'functions' => $this->activeFunctions()
                ->map(fn (FunctionModel $function) => $this->serializeFunction($function, []))
                ->values(),
        ];
    }

    public function activeFunctions(): Collection
    {
        return FunctionModel::query()
            ->where('status', true)
            ->with(['permissions' => function ($query): void {
                $query->where('status', true)->orderBy('id');
            }])
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get()
            ->each(function (FunctionModel $function): void {
                $function->setRelation(
                    'permissions',
                    $function->permissions->sortBy(
                        fn (Permission $permission) => self::ACTION_SORT_ORDER[$permission->action_code] ?? 999
                    )->values()
                );
            });
    }

    /**
     * @param array<int, int> $grantedIds
     * @param array<int, string> $overrides Permission ID to GRANT or DENY effect.
     */
    public function serializeFunction(
        FunctionModel $function,
        array $grantedIds,
        array $overrides = [],
        ?Role $role = null
    ): array {
        return [
            'id' => $function->id,
            'code' => $function->code,
            'nameVi' => $function->name_vi,
            'nameEn' => $function->name_en,
            'routeKey' => $function->route_key,
            'iconKey' => $function->icon_key,
            'sortOrder' => $function->sort_order,
            'parentFunctionId' => $function->parent_function_id,
            'permissions' => $function->permissions
                ->map(fn (Permission $permission) => $this->serializePermission(
                    $permission,
                    in_array((int) $permission->id, $grantedIds, true),
                    $overrides[(int) $permission->id] ?? null,
                    $role === null || IdentityV2Definitions::roleCanReceiveFunctionAction(
                        $role,
                        $function->function_name,
                        $permission->action_code
                    )
                ))
                ->values(),
        ];
    }

    private function serializePermission(
        Permission $permission,
        bool $grantedByRole,
        ?string $override,
        bool $assignable
    ): array {
        $allowed = match ($override) {
            'DENY' => false,
            'GRANT' => true,
            default => $grantedByRole,
        };

        return [
            'id' => $permission->id,
            'code' => $permission->code,
            'actionCode' => $permission->action_code,
            'nameVi' => $permission->name_vi,
            'nameEn' => $permission->name_en,
            'grantedByRole' => $grantedByRole,
            'override' => $override,
            'allowed' => $allowed,
            'assignable' => $assignable,
        ];
    }
}
