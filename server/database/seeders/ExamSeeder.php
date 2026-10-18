<?php

namespace Database\Seeders;

use App\Models\Exam;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Database\Seeder;

class ExamSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $monLapTrinhC = Subject::where('subject_name', 'Lập trình C')->first();
        $monCauTrucDuLieu = Subject::where('subject_name', 'Cấu trúc dữ liệu và giải thuật')->first();
        $giangvien = User::where('username', 'giangvien')->first();

        $deThis = [
            [
                'subject_id' => 1,
                'creator_id' => 2,
                'exam_name' => 'Đề thi giữa kỳ Lập trình C',
                'start_time' => '2026-03-01 08:00:00',
                'end_time' => '2026-03-01 08:30:00',
                'duration_minutes' => 30,
                'is_deleted' => false,
            ],
            [
                'subject_id' => 1,
                'creator_id' => 2,
                'exam_name' => 'Đề thi cuối kỳ Lập trình C',
                'start_time' => '2026-03-10 08:00:00',
                'end_time' => '2026-03-10 08:45:00',
                'duration_minutes' => 45,
                'is_deleted' => false,
            ],

            [
                'subject_id' => 2,
                'creator_id' => 2,
                'exam_name' => 'Đề thi giữa kỳ Cấu trúc dữ liệu và giải thuật',
                'start_time' => '2026-03-02 08:00:00',
                'end_time' => '2026-03-02 08:30:00',
                'duration_minutes' => 30,
                'is_deleted' => false,
            ],
            [
                'subject_id' => 2,
                'creator_id' => 2,
                'exam_name' => 'Đề thi cuối kỳ Cấu trúc dữ liệu và giải thuật',
                'start_time' => '2026-03-11 08:00:00',
                'end_time' => '2026-03-11 08:45:00',
                'duration_minutes' => 45,
                'is_deleted' => false,
            ],

            [
                'subject_id' => 3,
                'creator_id' => 2,
                'exam_name' => 'Đề thi giữa kỳ Lập trình hướng đối tượng',
                'start_time' => '2026-03-03 08:00:00',
                'end_time' => '2026-03-03 08:30:00',
                'duration_minutes' => 30,
                'is_deleted' => false,
            ],
            [
                'subject_id' => 3,
                'creator_id' => 2,
                'exam_name' => 'Đề thi cuối kỳ Lập trình hướng đối tượng',
                'start_time' => '2026-03-12 08:00:00',
                'end_time' => '2026-03-12 08:45:00',
                'duration_minutes' => 45,
                'is_deleted' => false,
            ],

            [
                'subject_id' => 4,
                'creator_id' => 2,
                'exam_name' => 'Đề thi giữa kỳ Cơ sở dữ liệu',
                'start_time' => '2026-03-04 08:00:00',
                'end_time' => '2026-03-04 08:30:00',
                'duration_minutes' => 30,
                'is_deleted' => false,
            ],
            [
                'subject_id' => 4,
                'creator_id' => 2,
                'exam_name' => 'Đề thi cuối kỳ Cơ sở dữ liệu',
                'start_time' => '2026-03-13 08:00:00',
                'end_time' => '2026-03-13 08:45:00',
                'duration_minutes' => 45,
                'is_deleted' => false,
            ],

            [
                'subject_id' => 5,
                'creator_id' => 2,
                'exam_name' => 'Đề thi giữa kỳ Hệ điều hành',
                'start_time' => '2026-03-05 08:00:00',
                'end_time' => '2026-03-05 08:30:00',
                'duration_minutes' => 30,
                'is_deleted' => false,
            ],
            [
                'subject_id' => 5,
                'creator_id' => 2,
                'exam_name' => 'Đề thi cuối kỳ Hệ điều hành',
                'start_time' => '2026-03-14 08:00:00',
                'end_time' => '2026-03-14 08:45:00',
                'duration_minutes' => 45,
                'is_deleted' => false,
            ],

            [
                'subject_id' => 6,
                'creator_id' => 2,
                'exam_name' => 'Đề thi giữa kỳ Mạng máy tính',
                'start_time' => '2026-03-06 08:00:00',
                'end_time' => '2026-03-06 08:30:00',
                'duration_minutes' => 30,
                'is_deleted' => false,
            ],
            [
                'subject_id' => 6,
                'creator_id' => 2,
                'exam_name' => 'Đề thi cuối kỳ Mạng máy tính',
                'start_time' => '2026-03-15 08:00:00',
                'end_time' => '2026-03-15 08:45:00',
                'duration_minutes' => 45,
                'is_deleted' => false,
            ],

            [
                'subject_id' => 7,
                'creator_id' => 2,
                'exam_name' => 'Đề thi giữa kỳ Phân tích thiết kế hệ thống',
                'start_time' => '2026-03-07 08:00:00',
                'end_time' => '2026-03-07 08:30:00',
                'duration_minutes' => 30,
                'is_deleted' => false,
            ],
            [
                'subject_id' => 7,
                'creator_id' => 2,
                'exam_name' => 'Đề thi cuối kỳ Phân tích thiết kế hệ thống',
                'start_time' => '2026-03-16 08:00:00',
                'end_time' => '2026-03-16 08:45:00',
                'duration_minutes' => 45,
                'is_deleted' => false,
            ],

            [
                'subject_id' => 8,
                'creator_id' => 2,
                'exam_name' => 'Đề thi giữa kỳ Lập trình Java',
                'start_time' => '2026-03-08 08:00:00',
                'end_time' => '2026-03-08 08:30:00',
                'duration_minutes' => 30,
                'is_deleted' => false,
            ],
            [
                'subject_id' => 8,
                'creator_id' => 2,
                'exam_name' => 'Đề thi cuối kỳ Lập trình Java',
                'start_time' => '2026-03-17 08:00:00',
                'end_time' => '2026-03-17 08:45:00',
                'duration_minutes' => 45,
                'is_deleted' => false,
            ],

            [
                'subject_id' => 9,
                'creator_id' => 2,
                'exam_name' => 'Đề thi giữa kỳ Lập trình Web',
                'start_time' => '2026-03-09 08:00:00',
                'end_time' => '2026-03-09 08:30:00',
                'duration_minutes' => 30,
                'is_deleted' => false,
            ],
            [
                'subject_id' => 9,
                'creator_id' => 2,
                'exam_name' => 'Đề thi cuối kỳ Lập trình Web',
                'start_time' => '2026-03-18 08:00:00',
                'end_time' => '2026-03-18 08:45:00',
                'duration_minutes' => 45,
                'is_deleted' => false,
            ],

            [
                'subject_id' => 10,
                'creator_id' => 2,
                'exam_name' => 'Đề thi giữa kỳ Phát triển ứng dụng Web',
                'start_time' => '2026-03-10 13:00:00',
                'end_time' => '2026-03-10 13:30:00',
                'duration_minutes' => 30,
                'is_deleted' => false,
            ],
            [
                'subject_id' => 10,
                'creator_id' => 2,
                'exam_name' => 'Đề thi cuối kỳ Phát triển ứng dụng Web',
                'start_time' => '2026-03-19 13:00:00',
                'end_time' => '2026-03-19 13:45:00',
                'duration_minutes' => 45,
                'is_deleted' => false,
            ],
        ];

        Exam::upsert(
            $deThis,
            ['exam_name'], // khóa xác định trùng
            [] // không update gì khi trùng
        );
    }
}
