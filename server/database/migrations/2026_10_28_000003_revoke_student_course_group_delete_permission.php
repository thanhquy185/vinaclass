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
        $requiredTables = [
            'roles',
            'functions',
            'role_details',
            'permissions',
            'role_permissions',
            'permission_details',
            'users',
        ];
        foreach ($requiredTables as $table) {
            if (!Schema::hasTable($table)) {
                return;
            }
        }

        DB::transaction(function (): void {
            $studentRoleIds = Role::query()
                ->where('is_deleted', false)
                ->orderBy('id')
                ->get()
                ->filter(
                    fn (Role $role): bool =>
                        IdentityV2Definitions::canonicalRoleCode($role) === 'STUDENT'
                )
                ->modelKeys();

            if ($studentRoleIds === []) {
                return;
            }

            $functionId = DB::table('functions')
                ->where('function_name', 'hoc_phan')
                ->value('id');
            if ($functionId === null) {
                return;
            }

            $permissionIds = DB::table('permissions')
                ->where('function_id', $functionId)
                ->where('action_code', 'DELETE')
                ->pluck('id')
                ->all();

            DB::table('role_details')
                ->whereIn('role_id', $studentRoleIds)
                ->where('function_id', $functionId)
                ->whereRaw('UPPER(action) = ?', ['DELETE'])
                ->delete();

            if ($permissionIds === []) {
                return;
            }

            DB::table('role_permissions')
                ->whereIn('role_id', $studentRoleIds)
                ->whereIn('permission_id', $permissionIds)
                ->delete();

            DB::table('permission_details')
                ->whereIn(
                    'user_id',
                    DB::table('users')->select('id')->whereIn('role_id', $studentRoleIds)
                )
                ->whereIn('permission_id', $permissionIds)
                ->delete();
        });
    }

    public function down(): void
    {
        // Do not restore a permission that violates the STUDENT role policy.
    }
};
