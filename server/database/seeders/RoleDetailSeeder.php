<?php

namespace Database\Seeders;

use App\Models\Action;
use App\Models\FunctionModel;
use App\Models\Role;
use App\Models\RoleDetail;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class RoleDetailSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run() //làm tạm đầy đủ crud
    {
        $adminRole = Role::where('role_name', 'admin')->first();
        $adminActions = FunctionModel::all();
        $roleDetails = [];

        $hanhDongs = ["VIEW", "ADD", "UPDATE", "DELETE"];

        foreach ($adminActions as $adminAction) {
            foreach ($hanhDongs as $hanhDong) {
                $roleDetails[] = [
                    "role_id" => $adminRole->id,
                    "function_id" => $adminAction->id,
                    "action" => $hanhDong
                ];
            }
        }

        $giangVienRole = Role::where('role_name', 'teacher')->first();
        $giangVienActions = FunctionModel::whereIn('function_name', [
            'hoc_phan',
            'cau_hoi',
            'chuong',
            'phan_cong',
            'de_thi',
            'thong_bao'
        ])->get();

        foreach ($giangVienActions as $giangVienAction) {
            foreach ($hanhDongs as $hanhDong) {
                $roleDetails[] = [
                    "role_id" => $giangVienRole->id,
                    "function_id" => $giangVienAction->id,
                    "action" => $hanhDong
                ];
            }
        }

        RoleDetail::insertOrIgnore($roleDetails); //ignore hoặc insert dựa vào constraint unique của db
    }
}
