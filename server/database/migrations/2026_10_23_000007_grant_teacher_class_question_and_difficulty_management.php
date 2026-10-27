<?php

use App\Models\Role;
use App\Services\IdentityV2\IdentityV2Definitions;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    private const ROLE_GRANTS = [
        'hoc_phan' => ['VIEW', 'CREATE', 'UPDATE', 'DELETE'],
        'cau_hoi' => ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'PUBLISH'],
        'do_kho' => ['VIEW', 'CREATE', 'UPDATE', 'DELETE'],
    ];

    private const LEGACY_ROLE_GRANTS = [
        'hoc_phan' => ['VIEW', 'ADD', 'UPDATE', 'DELETE'],
        'cau_hoi' => ['VIEW', 'ADD', 'UPDATE', 'DELETE'],
        'do_kho' => ['VIEW', 'ADD', 'UPDATE', 'DELETE'],
    ];

    public function up(): void
    {
        if (!Schema::hasTable('roles')
            || !Schema::hasTable('functions')
            || !Schema::hasTable('permissions')
            || !Schema::hasTable('role_permissions')) {
            return;
        }

        $teacherRole = Role::query()->get()->first(
            fn (Role $role): bool => IdentityV2Definitions::canonicalRoleCode($role) === 'TEACHER'
                && !$role->is_deleted
        );

        if (!$teacherRole) {
            return;
        }

        foreach (self::ROLE_GRANTS as $functionName => $actionCodes) {
            $function = DB::table('functions')
                ->where('function_name', $functionName)
                ->first();

            if (!$function) {
                continue;
            }

            foreach ($actionCodes as $actionCode) {
                $permissionId = DB::table('permissions')
                    ->where('function_id', $function->id)
                    ->where('action_code', $actionCode)
                    ->value('id');

                if (!$permissionId) {
                    [$nameVi, $nameEn] = IdentityV2Definitions::ACTION_LABELS[$actionCode];
                    $functionCode = $function->code ?: $functionName;

                    DB::table('permissions')->insertOrIgnore([
                        'function_id' => $function->id,
                        'code' => $functionCode . '.' . Str::lower($actionCode),
                        'action_code' => $actionCode,
                        'name_vi' => $nameVi,
                        'name_en' => $nameEn,
                        'status' => true,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);

                    $permissionId = DB::table('permissions')
                        ->where('function_id', $function->id)
                        ->where('action_code', $actionCode)
                        ->value('id');
                }

                if ($permissionId) {
                    DB::table('role_permissions')->insertOrIgnore([
                        'role_id' => $teacherRole->id,
                        'permission_id' => $permissionId,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }
        }

        if (Schema::hasTable('role_details')) {
            foreach (self::LEGACY_ROLE_GRANTS as $functionName => $actions) {
                $functionId = DB::table('functions')
                    ->where('function_name', $functionName)
                    ->value('id');

                if (!$functionId) {
                    continue;
                }

                foreach ($actions as $action) {
                    DB::table('role_details')->insertOrIgnore([
                        'role_id' => $teacherRole->id,
                        'function_id' => $functionId,
                        'action' => $action,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }
        }
    }

    public function down(): void
    {
        // Role grants are authorization data and may have been edited after this
        // migration. Keep them intact during rollback rather than revoking access.
    }
};
