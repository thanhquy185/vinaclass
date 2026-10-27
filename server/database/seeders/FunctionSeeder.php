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
                'function_name' => 'ma_tran_quyen',
                'icon_url' => 'example.icon',
            ],
            [
                'function_name' => 'thong_bao',
                'icon_url' => 'example.icon',
            ],
            [
                'function_name' => 'tai_lieu',
                'icon_url' => 'example.icon',
            ],
            [
                'function_name' => 'thong_ke_ket_qua',
                'icon_url' => 'example.icon',
            ],
            [
                'function_name' => 'thong_ke_de_thi',
                'icon_url' => 'example.icon',
            ],
            [
                'function_name' => 'thong_ke_lop_hoc',
                'icon_url' => 'example.icon',
            ],
            [
                'function_name' => 'thong_ke_cau_hoi',
                'icon_url' => 'example.icon',
            ],
        ];

        foreach ($actions as $action) {
            FunctionModel::query()->updateOrCreate(
                ['function_name' => $action['function_name']],
                ['icon_url' => $action['icon_url']]
            );
        }
    }
}
