<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DifficultySeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $doKhos = [
            ['difficulty_name' => 'Nhận biết'],
            ['difficulty_name' => 'Thông hiểu'],
            ['difficulty_name' => 'Vận dụng'],
            ['difficulty_name' => 'Vận dụng cao'],
        ];

        \App\Models\Difficulty::upsert(
            $doKhos,
            ['difficulty_name'], // khóa xác định trùng (ví dụ: "Dễ", "Trung bình", "Khó")
            [] // không update gì khi trùng
        );
    }
}
