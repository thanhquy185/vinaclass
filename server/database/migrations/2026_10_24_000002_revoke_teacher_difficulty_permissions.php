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
        foreach (['roles', 'functions', 'role_details', 'permissions', 'role_permissions'] as $table) {
            if (!Schema::hasTable($table)) {
                return;
            }
        }

        $teacherRole = Role::query()->where('is_deleted', false)->orderBy('id')->get()->first(
            fn (Role $role): bool => IdentityV2Definitions::canonicalRoleCode($role) === 'TEACHER'
        );
        $difficultyFunctionId = DB::table('functions')
            ->where('function_name', 'do_kho')
            ->value('id');

        if (!$teacherRole || !$difficultyFunctionId) {
            return;
        }

        DB::transaction(function () use ($teacherRole, $difficultyFunctionId): void {
            $permissionIds = DB::table('permissions')
                ->where('function_id', $difficultyFunctionId)
                ->pluck('id')
                ->all();

            if ($permissionIds !== []) {
                DB::table('role_permissions')
                    ->where('role_id', $teacherRole->id)
                    ->whereIn('permission_id', $permissionIds)
                    ->delete();
            }

            DB::table('role_details')
                ->where('role_id', $teacherRole->id)
                ->where('function_id', $difficultyFunctionId)
                ->delete();
        });
    }

    public function down(): void
    {
        // Do not restore removed grants during rollback; permissions may have been changed since.
    }
};
