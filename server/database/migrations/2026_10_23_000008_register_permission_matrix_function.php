<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('functions')) {
            return;
        }

        $now = now();
        $existing = DB::table('functions')
            ->where('function_name', 'ma_tran_quyen')
            ->first();
        $function = [
            'function_name' => 'ma_tran_quyen',
            'icon_url' => 'example.icon',
            'updated_at' => $now,
        ];

        $optionalColumns = [
            'code' => 'ma_tran_quyen',
            'name_vi' => 'Ma trận quyền',
            'name_en' => 'Permission matrix',
            'route_key' => 'permission-matrix',
            'icon_key' => 'lock',
            'sort_order' => 30,
            'status' => true,
            'is_deleted' => false,
        ];
        foreach ($optionalColumns as $column => $value) {
            if (Schema::hasColumn('functions', $column)) {
                $function[$column] = $value;
            }
        }

        if (Schema::hasColumn('functions', 'parent_function_id')) {
            $parentId = DB::table('functions')
                ->where('function_name', 'access_section')
                ->value('id');
            $function['parent_function_id'] = $parentId;
        }

        if ($existing) {
            DB::table('functions')->where('id', $existing->id)->update($function);
            $functionId = (int) $existing->id;
        } else {
            $function['created_at'] = $now;
            $functionId = (int) DB::table('functions')->insertGetId($function);
        }

        if (Schema::hasTable('permissions')) {
            DB::table('permissions')->updateOrInsert(
                ['function_id' => $functionId, 'action_code' => 'VIEW'],
                [
                    'code' => 'ma_tran_quyen.view',
                    'name_vi' => 'Xem',
                    'name_en' => 'View',
                    'status' => true,
                    'updated_at' => $now,
                    'created_at' => $now,
                ]
            );
        }

        if (Schema::hasTable('role_details')) {
            $adminRoleId = Schema::hasColumn('roles', 'code')
                ? DB::table('roles')->where('code', 'ADMIN')->value('id')
                : null;

            if (!$adminRoleId) {
                $adminRoleId = DB::table('roles')
                    ->whereRaw('LOWER(role_name) IN (?, ?, ?)', ['admin', 'quan_tri_vien', 'quan_tri'])
                    ->value('id');
            }

            if ($adminRoleId) {
                DB::table('role_details')->insertOrIgnore([
                    'role_id' => $adminRoleId,
                    'function_id' => $functionId,
                    'action' => 'VIEW',
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            }
        }
    }

    public function down(): void
    {
        // Keep the catalog row and permission when rolling back other changes.
    }
};
