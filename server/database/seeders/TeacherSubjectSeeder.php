<?php

namespace Database\Seeders;

use App\Models\TeacherSubject;
use Illuminate\Database\Seeder;

class TeacherSubjectSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {

        $phanCongs = [
            ['teacher_id' => 2, 'subject_id' => 1],
            ['teacher_id' => 4, 'subject_id' => 2],
            ['teacher_id' => 5, 'subject_id' => 3],
            ['teacher_id' => 6, 'subject_id' => 4],
            ['teacher_id' => 7, 'subject_id' => 5],
            ['teacher_id' => 8, 'subject_id' => 6],
            ['teacher_id' => 9, 'subject_id' => 7],
            ['teacher_id' => 10, 'subject_id' => 8],
            ['teacher_id' => 2, 'subject_id' => 9],
            ['teacher_id' => 4, 'subject_id' => 10],

            ['teacher_id' => 5, 'subject_id' => 1],
            ['teacher_id' => 6, 'subject_id' => 2],
            ['teacher_id' => 7, 'subject_id' => 3],
            ['teacher_id' => 8, 'subject_id' => 4],
            ['teacher_id' => 9, 'subject_id' => 5],
            ['teacher_id' => 10, 'subject_id' => 6],
            ['teacher_id' => 2, 'subject_id' => 7],
            ['teacher_id' => 4, 'subject_id' => 8],
            ['teacher_id' => 5, 'subject_id' => 9],
            ['teacher_id' => 6, 'subject_id' => 10],
        ];

        TeacherSubject::upsert(
            $phanCongs,
            ['teacher_id', 'subject_id'], // khóa xác định trùng
            [] // không update gì khi trùng
        );
    }
}
