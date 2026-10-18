<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $roles = [
            [
                'role_name' => 'admin'
            ],
            [
                'role_name' => 'teacher'
            ],
        ];

        Role::upsert(
            $roles,
            ['role_name'], // khóa xác định trùng
            [] // không update gì khi trùng
        );
    }
}
