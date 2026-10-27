<?php

use App\Models\Role;
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

        DB::transaction(function (): void {
            $teacherRole = Role::query()->where('code', 'TEACHER')->first();
            $examFunctionId = DB::table('functions')
                ->where('function_name', 'de_thi')
                ->value('id');

            if (!$teacherRole || !$examFunctionId) {
                return;
            }

            $permissionId = DB::table('permissions')
                ->where('function_id', $examFunctionId)
                ->where('action_code', 'ASSIGN')
                ->value('id');

            if (!$permissionId) {
                return;
            }

            $exists = DB::table('role_permissions')
                ->where('role_id', $teacherRole->id)
                ->where('permission_id', $permissionId)
                ->exists();

            if (!$exists) {
                DB::table('role_permissions')->insert([
                    'role_id' => $teacherRole->id,
                    'permission_id' => $permissionId,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        });
    }

    public function down(): void
    {
        // Keep authorization grants when rolling back application code.
    }
};
