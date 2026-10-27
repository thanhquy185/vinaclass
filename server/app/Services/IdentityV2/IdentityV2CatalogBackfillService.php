<?php

namespace App\Services\IdentityV2;

use App\Models\FunctionModel;
use App\Models\Permission;
use App\Models\Role;
use App\Models\RoleDetail;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use RuntimeException;

class IdentityV2CatalogBackfillService
{
    public function prepareRoles(): array
    {
        $roles = Role::query()->orderBy('id')->get();
        $rolesByCode = IdentityV2Definitions::activeSystemRoleTargets($roles);
        $inactiveRoleCodeConflicts = IdentityV2Definitions::inactiveSystemRoleCodeConflicts(
            $roles,
            $rolesByCode
        );

        if ($inactiveRoleCodeConflicts !== []) {
            [$code, $inactiveRoleId] = $inactiveRoleCodeConflicts[0];
            $operation = isset($rolesByCode[$code]) ? 'canonicalize the active' : 'create the active';
            throw new RuntimeException(
                "Cannot {$operation} {$code} role because inactive role {$inactiveRoleId} already owns that role code."
            );
        }

        foreach ($rolesByCode as $code => $role) {
            if ($role->code !== $code) {
                $role->code = $code;
                $role->save();
            }
        }

        foreach (IdentityV2Definitions::ROLE_CODES as $code) {
            if (isset($rolesByCode[$code])) {
                continue;
            }

            $rolesByCode[$code] = Role::query()->create([
                'role_name' => Str::lower($code),
                'code' => $code,
            ]);
        }

        return $rolesByCode;
    }

    public function prepareFunctions(): array
    {
        $functionsById = [];
        $usedCodes = [];

        foreach (IdentityV2Definitions::NAVIGATION_GROUPS as $functionName => $group) {
            FunctionModel::query()->firstOrCreate(
                ['function_name' => $functionName],
                ['icon_url' => 'section']
            );
        }

        foreach (array_keys(IdentityV2Definitions::FUNCTION_ACTIONS) as $functionName) {
            FunctionModel::query()->firstOrCreate(
                ['function_name' => $functionName],
                ['icon_url' => 'example.icon']
            );
        }

        foreach (FunctionModel::query()->orderBy('id')->get() as $function) {
            $code = trim((string) $function->code);
            if ($code === '') {
                $code = Str::ascii(Str::lower((string) $function->function_name));
                $code = preg_replace('/[^a-z0-9]+/', '_', $code) ?: '';
                $code = trim($code, '_');
            }

            $code = $this->claimFunctionCode($code, (int) $function->id, $usedCodes);

            [$nameVi, $nameEn] = IdentityV2Definitions::FUNCTION_LABELS[$function->function_name]
                ?? [$function->function_name, Str::headline(str_replace('_', ' ', $function->function_name))];

            $function->code = $code;
            $function->name_vi = $function->name_vi ?: $nameVi;
            $function->name_en = $function->name_en ?: $nameEn;
            if ($function->is_deleted) {
                $function->status = false;
            }
            $function->save();

            $functionsById[$function->id] = $function;
        }

        $functionsByName = collect($functionsById)->keyBy('function_name');
        foreach (array_keys(IdentityV2Definitions::FUNCTION_ACTIONS) as $functionName) {
            $function = $functionsByName->get($functionName);
            if (!$function) {
                continue;
            }

            // Navigation is a catalog concern: clear stale parent/order data before
            // applying the current route map so old menu groupings cannot survive.
            $function->route_key = null;
            $function->icon_key = null;
            $function->sort_order = 0;
            $function->parent_function_id = null;
            $function->save();
            $functionsById[$function->id] = $function;
        }

        $deprecatedGroups = FunctionModel::query()
            ->whereIn('function_name', IdentityV2Definitions::DEPRECATED_NAVIGATION_GROUPS)
            ->get();
        foreach ($deprecatedGroups as $function) {
            $function->route_key = null;
            $function->icon_key = null;
            $function->sort_order = 0;
            $function->parent_function_id = null;
            $function->status = false;
            $function->save();
            $functionsById[$function->id] = $function;
        }

        $deprecatedFunctions = FunctionModel::query()
            ->whereIn('function_name', IdentityV2Definitions::DEPRECATED_NAVIGATION_FUNCTIONS)
            ->get();
        foreach ($deprecatedFunctions as $function) {
            $function->route_key = null;
            $function->icon_key = null;
            $function->sort_order = 0;
            $function->parent_function_id = null;
            $function->status = false;
            $function->save();
            $functionsById[$function->id] = $function;
        }

        $groupsByName = FunctionModel::query()
            ->whereIn('function_name', array_keys(IdentityV2Definitions::NAVIGATION_GROUPS))
            ->get()
            ->keyBy('function_name');

        foreach (IdentityV2Definitions::NAVIGATION_GROUPS as $functionName => [$nameVi, $nameEn, $sortOrder]) {
            $function = $groupsByName->get($functionName);
            if (!$function) {
                continue;
            }

            $function->route_key = null;
            $function->icon_key = null;
            $function->sort_order = $sortOrder;
            $function->parent_function_id = null;
            $function->status = !$function->is_deleted;
            $function->name_vi = $nameVi;
            $function->name_en = $nameEn;
            $function->save();
            $functionsById[$function->id] = $function;
        }

        foreach (IdentityV2Definitions::FUNCTION_NAVIGATION as $functionName => [$routeKey, $iconKey, $sortOrder, $groupName]) {
            $function = FunctionModel::query()->where('function_name', $functionName)->first();
            $group = $groupsByName->get($groupName);
            if (!$function || !$group) {
                continue;
            }

            $function->route_key = $routeKey;
            $function->icon_key = $iconKey;
            $function->sort_order = $sortOrder;
            $function->parent_function_id = $group->id;
            $function->status = !$function->is_deleted;
            $function->save();
            $functionsById[$function->id] = $function;
        }

        return $functionsById;
    }

    public function preparePermissions(array $functionsById, bool $seedDefaultRoleGrants): void
    {
        $functionsByName = collect($functionsById)->keyBy('function_name');

        foreach (IdentityV2Definitions::FUNCTION_ACTIONS as $functionName => $actionCodes) {
            $function = $functionsByName->get($functionName);
            if (!$function) {
                continue;
            }

            foreach ($actionCodes as $actionCode) {
                $this->findOrCreatePermission($function, $actionCode);
            }
        }

        foreach (RoleDetail::query()->with(['function', 'role'])->orderBy('id')->get() as $legacyDetail) {
            $function = $functionsById[$legacyDetail->function_id] ?? null;
            $role = $legacyDetail->role;
            if (!$function || !$role) {
                continue;
            }

            $actionCode = IdentityV2Definitions::mapLegacyRoleAction(
                $role,
                $function->function_name,
                $legacyDetail->action
            );
            if ($actionCode === null) {
                continue;
            }

            $permission = $this->findOrCreatePermission($function, $actionCode, $legacyDetail->action);

            DB::table('role_permissions')->insertOrIgnore([
                'role_id' => $legacyDetail->role_id,
                'permission_id' => $permission->id,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        $this->removeDisallowedRolePermissions();

        if ($seedDefaultRoleGrants) {
            foreach (IdentityV2Definitions::ROLE_PERMISSION_DEFAULTS as $roleCode => $functionDefaults) {
                $role = Role::query()
                    ->where('code', $roleCode)
                    ->where('is_deleted', false)
                    ->first();
                if (!$role) {
                    continue;
                }

                foreach ($functionDefaults as $functionName => $actionCodes) {
                    $function = $functionsByName->get($functionName);
                    if (!$function) {
                        continue;
                    }

                    foreach ($actionCodes as $actionCode) {
                        $permission = $this->findOrCreatePermission($function, $actionCode);
                        DB::table('role_permissions')->insertOrIgnore([
                            'role_id' => $role->id,
                            'permission_id' => $permission->id,
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]);
                    }
                }
            }
        }

        $adminRole = Role::query()->orderBy('id')->get()->first(
            fn (Role $role): bool => IdentityV2Definitions::canonicalRoleCode($role) === 'ADMIN'
                && !$role->is_deleted
        );
        if ($adminRole) {
            $activePermissionIds = Permission::query()
                ->where('status', true)
                ->whereHas('function', fn ($query) => $query->where('status', true))
                ->pluck('id')
                ->map(fn ($id) => (int) $id)
                ->all();

            $adminRole->permissions()->sync($activePermissionIds);
        }
    }

    public function removeDisallowedUserPermissionOverrides(): void
    {
        $permissions = Permission::query()
            ->with('function')
            ->get(['id', 'function_id', 'action_code']);

        foreach (Role::query()->orderBy('id')->get() as $role) {
            $disallowedPermissionIds = $this->disallowedPermissionIds($role, $permissions);

            if ($disallowedPermissionIds === []) {
                continue;
            }

            DB::table('permission_details')
                ->whereIn('permission_id', $disallowedPermissionIds)
                ->whereIn('user_id', DB::table('users')->select('id')->where('role_id', $role->id))
                ->delete();
        }
    }

    private function claimFunctionCode(string $code, int $functionId, array &$usedCodes): string
    {
        $baseCode = trim($code) !== '' ? trim($code) : 'function';
        $candidate = substr($baseCode, 0, 64);
        $suffixNumber = 1;

        while (isset($usedCodes[$candidate])) {
            $suffix = '_' . $functionId . ($suffixNumber > 1 ? '_' . $suffixNumber : '');
            $candidate = substr($baseCode, 0, 64 - strlen($suffix)) . $suffix;
            $suffixNumber++;
        }

        $usedCodes[$candidate] = true;

        return $candidate;
    }

    private function removeDisallowedRolePermissions(): void
    {
        $permissions = Permission::query()
            ->with('function')
            ->get(['id', 'function_id', 'action_code']);

        foreach (Role::query()->orderBy('id')->get() as $role) {
            $disallowedPermissionIds = $this->disallowedPermissionIds($role, $permissions);

            if ($disallowedPermissionIds !== []) {
                DB::table('role_permissions')
                    ->where('role_id', $role->id)
                    ->whereIn('permission_id', $disallowedPermissionIds)
                    ->delete();
            }
        }
    }

    private function disallowedPermissionIds(Role $role, Collection $permissions): array
    {
        return $permissions
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
    }

    private function findOrCreatePermission(FunctionModel $function, string $actionCode, ?string $legacyAction = null): Permission
    {
        [$nameVi, $nameEn] = IdentityV2Definitions::ACTION_LABELS[$actionCode]
            ?? [$legacyAction ?: $actionCode, Str::headline(strtolower($legacyAction ?: $actionCode))];

        return Permission::query()->firstOrCreate(
            [
                'function_id' => $function->id,
                'action_code' => $actionCode,
            ],
            [
                'code' => $function->code . '.' . Str::lower($actionCode),
                'name_vi' => $nameVi,
                'name_en' => $nameEn,
                'status' => true,
            ]
        );
    }
}
