<?php

use App\Models\Role;
use App\Services\IdentityV2\IdentityV2Definitions;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        foreach (['roles', 'functions', 'permissions', 'role_permissions'] as $table) {
            if (!Schema::hasTable($table)) {
                return;
            }
        }

        $teacherRole = Role::query()->get()->first(
            fn (Role $role): bool => IdentityV2Definitions::canonicalRoleCode($role) === 'TEACHER'
                && !$role->is_deleted
        );
        if (!$teacherRole) {
            return;
        }

        DB::transaction(function () use ($teacherRole): void {
            $teacherDefaults = IdentityV2Definitions::ROLE_PERMISSION_DEFAULTS['TEACHER'] ?? [];

            foreach ($teacherDefaults as $functionName => $actionCodes) {
                if (!in_array('PUBLISH', $actionCodes, true)) {
                    continue;
                }

                $function = DB::table('functions')
                    ->where('function_name', $functionName)
                    ->first();
                if (!$function) {
                    continue;
                }

                $permissionId = DB::table('permissions')
                    ->where('function_id', $function->id)
                    ->where('action_code', 'PUBLISH')
                    ->where('status', true)
                    ->value('id');

                if (!$permissionId) {
                    [$nameVi, $nameEn] = IdentityV2Definitions::ACTION_LABELS['PUBLISH'];
                    $functionCode = trim((string) ($function->code ?? '')) ?: $functionName;

                    DB::table('permissions')->insertOrIgnore([
                        'function_id' => $function->id,
                        'code' => $functionCode . '.publish',
                        'action_code' => 'PUBLISH',
                        'name_vi' => $nameVi,
                        'name_en' => $nameEn,
                        'status' => true,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);

                    $permissionId = DB::table('permissions')
                        ->where('function_id', $function->id)
                        ->where('action_code', 'PUBLISH')
                        ->where('status', true)
                        ->value('id');
                }

                if ($permissionId !== null) {
                    DB::table('role_permissions')->insertOrIgnore([
                        'role_id' => $teacherRole->id,
                        'permission_id' => $permissionId,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }
        });
    }

    public function down(): void
    {
        // Keep authorization grants intact if application code is rolled back.
    }
};
