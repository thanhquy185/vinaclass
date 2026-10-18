<?php

namespace Database\Seeders;

use App\Models\Action;
use App\Models\FunctionModel;
use App\Models\Role;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class FunctionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $actions = [
            [
                'function_name' => 'nguoi_dung',
                'icon_url' => 'example.icon',
            ],
            [
                'function_name' => 'do_kho',
                'icon_url' => 'example.icon',
            ],
            [
                'function_name' => 'hoc_phan',
                'icon_url' => 'example.icon',
            ],
            [
                'function_name' => 'cau_hoi',
                'icon_url' => 'example.icon',
            ],
            [
                'function_name' => 'mon_hoc',
                'icon_url' => 'example.icon',
            ],
            [
                'function_name' => 'chuong',
                'icon_url' => 'example.icon',
            ],
            [
                'function_name' => 'phan_cong',
                'icon_url' => 'example.icon',
            ],
            [
                'function_name' => 'de_thi',
                'icon_url' => 'example.icon',
            ],
            [
                'function_name' => 'nhom_quyen',
                'icon_url' => 'example.icon',
            ],
            [
                'function_name' => 'thong_bao',
                'icon_url' => 'example.icon',
            ],
        ];

        FunctionModel::upsert($actions, ['function_name']);
    }
}
