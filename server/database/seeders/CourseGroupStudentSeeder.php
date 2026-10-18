<?php

namespace Database\Seeders;

use App\Models\ChiTietNhom;
use App\Models\CourseGroupStudent;
use App\Models\User;
use Illuminate\Database\Seeder;

class CourseGroupStudentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $chiTietNhoms = [
            // Nhóm 1
            ['student_id' => 10, 'course_group_id' => 1],
            ['student_id' => 11, 'course_group_id' => 1],
            ['student_id' => 12, 'course_group_id' => 1],
            ['student_id' => 13, 'course_group_id' => 1],
            ['student_id' => 14, 'course_group_id' => 1],
            ['student_id' => 15, 'course_group_id' => 1],
            ['student_id' => 16, 'course_group_id' => 1],
            ['student_id' => 17, 'course_group_id' => 1],
            ['student_id' => 18, 'course_group_id' => 1],
            ['student_id' => 19, 'course_group_id' => 1],

            // Nhóm 2
            ['student_id' => 20, 'course_group_id' => 2],
            ['student_id' => 21, 'course_group_id' => 2],
            ['student_id' => 22, 'course_group_id' => 2],
            ['student_id' => 23, 'course_group_id' => 2],
            ['student_id' => 24, 'course_group_id' => 2],
            ['student_id' => 25, 'course_group_id' => 2],
            ['student_id' => 26, 'course_group_id' => 2],
            ['student_id' => 27, 'course_group_id' => 2],
            ['student_id' => 28, 'course_group_id' => 2],
            ['student_id' => 29, 'course_group_id' => 2],

            // Nhóm 3
            ['student_id' => 30, 'course_group_id' => 3],
            ['student_id' => 3,  'course_group_id' => 3],
            ['student_id' => 10, 'course_group_id' => 3],
            ['student_id' => 11, 'course_group_id' => 3],
            ['student_id' => 12, 'course_group_id' => 3],
            ['student_id' => 13, 'course_group_id' => 3],
            ['student_id' => 14, 'course_group_id' => 3],
            ['student_id' => 15, 'course_group_id' => 3],
            ['student_id' => 16, 'course_group_id' => 3],
            ['student_id' => 17, 'course_group_id' => 3],

            // Nhóm 4
            ['student_id' => 18, 'course_group_id' => 4],
            ['student_id' => 19, 'course_group_id' => 4],
            ['student_id' => 20, 'course_group_id' => 4],
            ['student_id' => 21, 'course_group_id' => 4],
            ['student_id' => 22, 'course_group_id' => 4],
            ['student_id' => 23, 'course_group_id' => 4],
            ['student_id' => 24, 'course_group_id' => 4],
            ['student_id' => 25, 'course_group_id' => 4],
            ['student_id' => 26, 'course_group_id' => 4],
            ['student_id' => 27, 'course_group_id' => 4],
        ];

        CourseGroupStudent::upsert(
            $chiTietNhoms,
            ['student_id', 'course_group_id'], // khóa xác định trùng (giống điều kiện firstOrCreate)
            [] // không update gì khi trùng
        );
    }
}
