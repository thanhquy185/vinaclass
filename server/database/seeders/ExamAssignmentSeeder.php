<?php

namespace Database\Seeders;

use App\Models\ExamAssignment;
use App\Models\GiaoBaiThi;
use Illuminate\Database\Seeder;

class ExamAssignmentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $giaoBaiThis = [
            ['exam_id' => 1,  'course_group_id' => 1,  'start_time' => '2026-03-01 08:00:00', 'end_time' => '2026-03-01 08:30:00'],
            ['exam_id' => 2,  'course_group_id' => 1,  'start_time' => '2026-03-10 08:00:00', 'end_time' => '2026-03-10 08:45:00'],

            ['exam_id' => 3,  'course_group_id' => 2,  'start_time' => '2026-03-02 08:00:00', 'end_time' => '2026-03-02 08:30:00'],
            ['exam_id' => 4,  'course_group_id' => 2,  'start_time' => '2026-03-11 08:00:00', 'end_time' => '2026-03-11 08:45:00'],

            ['exam_id' => 5,  'course_group_id' => 3,  'start_time' => '2026-03-03 08:00:00', 'end_time' => '2026-03-03 08:30:00'],
            ['exam_id' => 6,  'course_group_id' => 3,  'start_time' => '2026-03-12 08:00:00', 'end_time' => '2026-03-12 08:45:00'],

            ['exam_id' => 7,  'course_group_id' => 4,  'start_time' => '2026-03-04 08:00:00', 'end_time' => '2026-03-04 08:30:00'],
            ['exam_id' => 8,  'course_group_id' => 4,  'start_time' => '2026-03-13 08:00:00', 'end_time' => '2026-03-13 08:45:00'],

            ['exam_id' => 9,  'course_group_id' => 5,  'start_time' => '2026-03-05 08:00:00', 'end_time' => '2026-03-05 08:30:00'],
            ['exam_id' => 10, 'course_group_id' => 5,  'start_time' => '2026-03-14 08:00:00', 'end_time' => '2026-03-14 08:45:00'],

            ['exam_id' => 11, 'course_group_id' => 6,  'start_time' => '2026-03-06 08:00:00', 'end_time' => '2026-03-06 08:30:00'],
            ['exam_id' => 12, 'course_group_id' => 6,  'start_time' => '2026-03-15 08:00:00', 'end_time' => '2026-03-15 08:45:00'],

            ['exam_id' => 13, 'course_group_id' => 7,  'start_time' => '2026-03-07 08:00:00', 'end_time' => '2026-03-07 08:30:00'],
            ['exam_id' => 14, 'course_group_id' => 7,  'start_time' => '2026-03-16 08:00:00', 'end_time' => '2026-03-16 08:45:00'],

            ['exam_id' => 15, 'course_group_id' => 8,  'start_time' => '2026-03-08 08:00:00', 'end_time' => '2026-03-08 08:30:00'],
            ['exam_id' => 16, 'course_group_id' => 8,  'start_time' => '2026-03-17 08:00:00', 'end_time' => '2026-03-17 08:45:00'],

            ['exam_id' => 17, 'course_group_id' => 9,  'start_time' => '2026-03-09 08:00:00', 'end_time' => '2026-03-09 08:30:00'],
            ['exam_id' => 18, 'course_group_id' => 9,  'start_time' => '2026-03-18 08:00:00', 'end_time' => '2026-03-18 08:45:00'],

            ['exam_id' => 19, 'course_group_id' => 10, 'start_time' => '2026-03-10 13:00:00', 'end_time' => '2026-03-10 13:30:00'],
            ['exam_id' => 20, 'course_group_id' => 10, 'start_time' => '2026-03-19 13:00:00', 'end_time' => '2026-03-19 13:45:00'],

            // ['exam_id' => 5,  'course_group_id' => 3,  'start_time' => '2026-03-03 08:00:00', 'end_time' => '2026-03-03 08:30:00'],

            ['exam_id' => 1,  'course_group_id' => 3,  'start_time' => '2026-03-01 08:00:00', 'end_time' => '2026-03-01 08:30:00'],
            ['exam_id' => 1,  'course_group_id' => 4,  'start_time' => '2026-03-01 08:00:00', 'end_time' => '2026-03-01 08:30:00'],


        ];

        ExamAssignment::upsert(
            $giaoBaiThis,
            ['exam_id', 'course_group_id'], // khóa xác định trùng
            [] // không update gì khi trùng
        );
    }
}
