<?php

use App\Models\FunctionModel;
use App\Models\Role;
use App\Services\IdentityV2\IdentityV2CatalogBackfillService;
use App\Services\IdentityV2\IdentityV2Definitions;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    private const LEGACY_ACTIONS = [
        'VIEW' => 'VIEW',
        'CREATE' => 'ADD',
        'UPDATE' => 'UPDATE',
        'DELETE' => 'DELETE',
        'ASSIGN' => 'ASSIGN',
    ];

    public function up(): void
    {
        foreach ([
            'roles',
            'functions',
            'role_details',
            'permissions',
            'role_permissions',
            'permission_details',
            'users',
        ] as $table) {
            if (!Schema::hasTable($table)) {
                return;
            }
        }

        if (!Schema::hasColumn('roles', 'code') || !Schema::hasColumn('functions', 'status')) {
            return;
        }

        DB::transaction(function (): void {
            /** @var IdentityV2CatalogBackfillService $catalogBackfill */
            $catalogBackfill = app(IdentityV2CatalogBackfillService::class);
            $rolesByCode = $catalogBackfill->prepareRoles();
            $functionsById = $catalogBackfill->prepareFunctions();
            $functionsByName = collect($functionsById)->keyBy('function_name');

            $requiredGrants = IdentityV2Definitions::ROLE_PERMISSION_DEFAULTS;
            $requiredActionLookup = [];
            foreach ($requiredGrants as $roleGrants) {
                foreach ($roleGrants as $functionName => $actionCodes) {
                    foreach ($actionCodes as $actionCode) {
                        $requiredActionLookup[$functionName . ':' . $actionCode] = true;
                    }
                }
            }

            $this->preparePermissions($functionsByName, $requiredActionLookup);
            $this->syncRolePermissions($rolesByCode, $functionsByName, $requiredGrants);
            $this->syncLegacyRoleDetails($rolesByCode, $functionsByName);
            $this->removeDisallowedSystemRoleOverrides($rolesByCode);
        });
    }

    public function down(): void
    {
        // Preserve authorization data when rolling back application code.
    }

    private function preparePermissions($functionsByName, array $requiredActionLookup): void
    {
        foreach (IdentityV2Definitions::FUNCTION_ACTIONS as $functionName => $actionCodes) {
            /** @var FunctionModel|null $function */
            $function = $functionsByName->get($functionName);
            if (!$function) {
                continue;
            }

            foreach ($actionCodes as $actionCode) {
                [$nameVi, $nameEn] = IdentityV2Definitions::ACTION_LABELS[$actionCode]
                    ?? [$actionCode, $actionCode];
                $existing = DB::table('permissions')
                    ->where('function_id', $function->id)
                    ->where('action_code', $actionCode)
                    ->first();
                $isRequired = isset($requiredActionLookup[$functionName . ':' . $actionCode]);

                $values = [
                    'code' => $existing && trim((string) $existing->code) !== ''
                        ? $existing->code
                        : $function->code . '.' . strtolower($actionCode),
                    'name_vi' => $nameVi,
                    'name_en' => $nameEn,
                    'status' => $existing
                        ? ((bool) $existing->status || $isRequired)
                        : true,
                    'updated_at' => now(),
                ];

                if ($existing) {
                    DB::table('permissions')->where('id', $existing->id)->update($values);
                } else {
                    DB::table('permissions')->insert($values + [
                        'function_id' => $function->id,
                        'action_code' => $actionCode,
                        'created_at' => now(),
                    ]);
                }
            }
        }
    }

    private function syncRolePermissions($rolesByCode, $functionsByName, array $requiredGrants): void
    {
        $adminRole = $rolesByCode['ADMIN'] ?? null;
        if (!$adminRole) {
            throw new RuntimeException('Cannot reconcile permissions because the active ADMIN role is missing.');
        }

        $activePermissionIds = DB::table('permissions')
            ->join('functions', 'functions.id', '=', 'permissions.function_id')
            ->where('permissions.status', true)
            ->where('functions.status', true)
            ->pluck('permissions.id')
            ->map(fn ($id) => (int) $id)
            ->all();
        $this->replaceRolePermissions((int) $adminRole->id, $activePermissionIds);

        foreach (['TEACHER', 'STUDENT'] as $roleCode) {
            $role = $rolesByCode[$roleCode] ?? null;
            if (!$role) {
                throw new RuntimeException("Cannot reconcile permissions because the active {$roleCode} role is missing.");
            }

            $permissionIds = [];
            foreach ($requiredGrants[$roleCode] ?? [] as $functionName => $actionCodes) {
                $function = $functionsByName->get($functionName);
                if (!$function) {
                    continue;
                }

                foreach ($actionCodes as $actionCode) {
                    $permissionId = DB::table('permissions')
                        ->where('function_id', $function->id)
                        ->where('action_code', $actionCode)
                        ->where('status', true)
                        ->value('id');
                    if ($permissionId !== null) {
                        $permissionIds[] = (int) $permissionId;
                    }
                }
            }

            $this->replaceRolePermissions((int) $role->id, array_values(array_unique($permissionIds)));
        }
    }

    private function replaceRolePermissions(int $roleId, array $permissionIds): void
    {
        DB::table('role_permissions')->where('role_id', $roleId)->delete();

        $timestamp = now();
        foreach (array_chunk($permissionIds, 500) as $chunk) {
            DB::table('role_permissions')->insert(array_map(
                fn (int $permissionId): array => [
                    'role_id' => $roleId,
                    'permission_id' => $permissionId,
                    'created_at' => $timestamp,
                    'updated_at' => $timestamp,
                ],
                $chunk
            ));
        }
    }

    private function syncLegacyRoleDetails($rolesByCode, $functionsByName): void
    {
        foreach (['ADMIN', 'TEACHER', 'STUDENT'] as $roleCode) {
            $role = $rolesByCode[$roleCode] ?? null;
            if (!$role) {
                continue;
            }

            DB::table('role_details')->where('role_id', $role->id)->delete();
            $grantRows = [];

            if ($roleCode === 'ADMIN') {
                $functionGrants = FunctionModel::query()->orderBy('id')->get()
                    ->mapWithKeys(fn (FunctionModel $function): array => [
                        $function->function_name => ['VIEW', 'CREATE', 'UPDATE', 'DELETE'],
                    ])
                    ->all();
            } else {
                $functionGrants = IdentityV2Definitions::ROLE_PERMISSION_DEFAULTS[$roleCode] ?? [];
            }

            foreach ($functionGrants as $functionName => $actionCodes) {
                $function = $functionsByName->get($functionName);
                if (!$function) {
                    continue;
                }

                foreach ($actionCodes as $actionCode) {
                    $legacyAction = self::LEGACY_ACTIONS[$actionCode] ?? null;
                    if ($legacyAction === null) {
                        // PUBLISH is represented by v2 permissions. Legacy role
                        // checks continue to map it to the existing CREATE/UPDATE grants.
                        continue;
                    }

                    $grantRows[] = [
                        'role_id' => $role->id,
                        'function_id' => $function->id,
                        'action' => $legacyAction,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                }
            }

            if ($grantRows !== []) {
                DB::table('role_details')->insert($grantRows);
            }
        }
    }

    private function removeDisallowedSystemRoleOverrides($rolesByCode): void
    {
        $roleIds = collect($rolesByCode)
            ->only(['ADMIN', 'TEACHER', 'STUDENT'])
            ->mapWithKeys(fn (Role $role, string $code): array => [(int) $role->id => $role]);
        if ($roleIds->isEmpty()) {
            return;
        }

        $overrides = DB::table('permission_details')
            ->join('users', 'users.id', '=', 'permission_details.user_id')
            ->join('permissions', 'permissions.id', '=', 'permission_details.permission_id')
            ->join('functions', 'functions.id', '=', 'permissions.function_id')
            ->whereIn('users.role_id', $roleIds->keys()->all())
            ->get([
                'permission_details.id',
                'users.role_id',
                'functions.function_name',
                'permissions.action_code',
            ]);

        $disallowedIds = $overrides
            ->filter(function (object $override) use ($roleIds): bool {
                $role = $roleIds->get((int) $override->role_id);

                return $role !== null
                    && !IdentityV2Definitions::roleCanReceiveFunctionAction(
                        $role,
                        $override->function_name,
                        $override->action_code
                    );
            })
            ->pluck('id')
            ->map(fn ($id) => (int) $id)
            ->all();

        foreach (array_chunk($disallowedIds, 500) as $chunk) {
            DB::table('permission_details')->whereIn('id', $chunk)->delete();
        }
    }
};
