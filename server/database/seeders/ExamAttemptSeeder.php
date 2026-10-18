<?php

namespace Database\Seeders;

use App\Models\BaiLam;
use App\Models\DeThi;
use App\Models\Exam;
use App\Models\ExamAttempt;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;

class ExamAttemptSeeder extends Seeder
{
    public function run()
    {
        $student = User::where('username', 'sinhvien')->first();

        // 'tenDe' => 'Đề thi giữa kỳ Lập trình C',
        // 'tenDe' => 'Đề thi giữa kỳ Cấu trúc dữ liệu',
        // lấy 2 đề 
        $deThi1 = Exam::where('exam_name', 'Đề thi giữa kỳ Lập trình C')->first();
        $deThi2 = Exam::where('exam_name', 'Đề thi giữa kỳ Cấu trúc dữ liệu và giải thuật')->first();

        $now = Date::now();

        $baiLams = [
            // 🟡 ĐANG LÀM
            [
                'student_id' => $student->id,
                'exam_id' => $deThi1->id,
                'start_time' => $now->copy()->subMinutes(30),
                'submission_time' => null,
                'total_score' => null,
                'correct_answer_count' => null,
                'status' => 'IN_PROGRESS',
                'updated_at' => $now,
            ],

            // 🔵 TẠM LƯU
            [
                'student_id' => $student->id,
                'exam_id' => $deThi2->id,
                'start_time' => $now->copy()->subHours(2),
                'submission_time' => null,
                'total_score' => null,
                'correct_answer_count' => 5,
                'status' => 'SAVED',
                'updated_at' => $now->copy()->subMinutes(10),
            ],

            // 🟢 ĐÃ NỘP
            [
                'student_id' => $student->id,
                'exam_id' => $deThi1->id,
                'start_time' => $now->copy()->subDays(1)->subHours(1),
                'submission_time' => $now->copy()->subDays(1),
                'total_score' => 8.75,
                'correct_answer_count' => 35,
                'status' => 'SUBMITTED',
                'updated_at' => $now->copy()->subDays(1),
            ],

            // 🔴 BỊ HỦY
            [
                'student_id' => $student->id,
                'exam_id' => $deThi2->id,
                'start_time' => $now->copy()->subDays(3),
                'submission_time' => null,
                'total_score' => null,
                'correct_answer_count' => 10,
                'status' => 'CANCELLED',
                'updated_at' => $now->copy()->subDays(3),
            ],

            [
                'student_id' => 10,
                'exam_id' => 5,
                'start_time' => $now->copy()->subDays(1)->subHours(1),
                'submission_time' => $now->copy()->subDays(1),
                'total_score' => 8.75,
                'correct_answer_count' => 35,
                'status' => 'SUBMITTED',
                'updated_at' => $now->copy()->subDays(1),
            ],
            [
                'student_id' => 11,
                'exam_id' => 5,
                'start_time' => $now->copy()->subDays(1)->subHours(1),
                'submission_time' => $now->copy()->subDays(1),
                'total_score' => 8.75,
                'correct_answer_count' => 35,
                'status' => 'SUBMITTED',
                'updated_at' => $now->copy()->subDays(1),
            ],
            [
                'student_id' => 12,
                'exam_id' => 5,
                'start_time' => $now->copy()->subDays(1)->subHours(1),
                'submission_time' => $now->copy()->subDays(1),
                'total_score' => 8.75,
                'correct_answer_count' => 35,
                'status' => 'SUBMITTED',
                'updated_at' => $now->copy()->subDays(1),
            ],
            [
                'student_id' => 13,
                'exam_id' => 5,
                'start_time' => $now->copy()->subDays(1)->subHours(1),
                'submission_time' => $now->copy()->subDays(1),
                'total_score' => 8.75,
                'correct_answer_count' => 35,
                'status' => 'SUBMITTED',
                'updated_at' => $now->copy()->subDays(1),
            ],
            [
                'student_id' => 14,
                'exam_id' => 5,
                'start_time' => $now->copy()->subDays(1)->subHours(1),
                'submission_time' => $now->copy()->subDays(1),
                'total_score' => 8.75,
                'correct_answer_count' => 35,
                'status' => 'SUBMITTED',
                'updated_at' => $now->copy()->subDays(1),
            ],
            [
                'student_id' => 15,
                'exam_id' => 5,
                'start_time' => $now->copy()->subDays(1)->subHours(1),
                'submission_time' => $now->copy()->subDays(1),
                'total_score' => 8.75,
                'correct_answer_count' => 35,
                'status' => 'SUBMITTED',
                'updated_at' => $now->copy()->subDays(1),
            ],
            [
                'student_id' => 16,
                'exam_id' => 5,
                'start_time' => $now->copy()->subDays(1)->subHours(1),
                'submission_time' => $now->copy()->subDays(1),
                'total_score' => 8.75,
                'correct_answer_count' => 35,
                'status' => 'SUBMITTED',
                'updated_at' => $now->copy()->subDays(1),
            ],
            [
                'student_id' => 17,
                'exam_id' => 5,
                'start_time' => $now->copy()->subDays(1)->subHours(1),
                'submission_time' => $now->copy()->subDays(1),
                'total_score' => 8.75,
                'correct_answer_count' => 35,
                'status' => 'SUBMITTED',
                'updated_at' => $now->copy()->subDays(1),
            ],

            [
                'student_id' => 10,
                'exam_id' => 1,
                'start_time' => $now->copy()->subDays(1)->subHours(1),
                'submission_time' => $now->copy()->subDays(1),
                'total_score' => 8.75,
                'correct_answer_count' => 35,
                'status' => 'SUBMITTED',
                'updated_at' => $now->copy()->subDays(1),
            ],
            [
                'student_id' => 11,
                'exam_id' => 1,
                'start_time' => $now->copy()->subDays(1)->subHours(1),
                'submission_time' => $now->copy()->subDays(1),
                'total_score' => 8.75,
                'correct_answer_count' => 35,
                'status' => 'SUBMITTED',
                'updated_at' => $now->copy()->subDays(1),
            ],
            [
                'student_id' => 12,
                'exam_id' => 1,
                'start_time' => $now->copy()->subDays(1)->subHours(1),
                'submission_time' => $now->copy()->subDays(1),
                'total_score' => 8.75,
                'correct_answer_count' => 35,
                'status' => 'SUBMITTED',
                'updated_at' => $now->copy()->subDays(1),
            ],
            [
                'student_id' => 13,
                'exam_id' => 1,
                'start_time' => $now->copy()->subDays(1)->subHours(1),
                'submission_time' => $now->copy()->subDays(1),
                'total_score' => 8.75,
                'correct_answer_count' => 35,
                'status' => 'SUBMITTED',
                'updated_at' => $now->copy()->subDays(1),
            ],
            [
                'student_id' => 14,
                'exam_id' => 1,
                'start_time' => $now->copy()->subDays(1)->subHours(1),
                'submission_time' => $now->copy()->subDays(1),
                'total_score' => 8.75,
                'correct_answer_count' => 35,
                'status' => 'SUBMITTED',
                'updated_at' => $now->copy()->subDays(1),
            ],
            [
                'student_id' => 15,
                'exam_id' => 1,
                'start_time' => $now->copy()->subDays(1)->subHours(1),
                'submission_time' => $now->copy()->subDays(1),
                'total_score' => 8.75,
                'correct_answer_count' => 35,
                'status' => 'SUBMITTED',
                'updated_at' => $now->copy()->subDays(1),
            ],
            [
                'student_id' => 16,
                'exam_id' => 1,
                'start_time' => $now->copy()->subDays(1)->subHours(1),
                'submission_time' => $now->copy()->subDays(1),
                'total_score' => 8.75,
                'correct_answer_count' => 35,
                'status' => 'SUBMITTED',
                'updated_at' => $now->copy()->subDays(1),
            ],
            [
                'student_id' => 17,
                'exam_id' => 1,
                'start_time' => $now->copy()->subDays(1)->subHours(1),
                'submission_time' => $now->copy()->subDays(1),
                'total_score' => 8.75,
                'correct_answer_count' => 35,
                'status' => 'SUBMITTED',
                'updated_at' => $now->copy()->subDays(1),
            ],
            [
                'student_id' => 18,
                'exam_id' => 1,
                'start_time' => $now->copy()->subDays(1)->subHours(1),
                'submission_time' => $now->copy()->subDays(1),
                'total_score' => 8.75,
                'correct_answer_count' => 35,
                'status' => 'SUBMITTED',
                'updated_at' => $now->copy()->subDays(1),
            ],
            [
                'student_id' => 19,
                'exam_id' => 1,
                'start_time' => $now->copy()->subDays(1)->subHours(1),
                'submission_time' => $now->copy()->subDays(1),
                'total_score' => 8.75,
                'correct_answer_count' => 35,
                'status' => 'SUBMITTED',
                'updated_at' => $now->copy()->subDays(1),
            ],
            [
                'student_id' => 20,
                'exam_id' => 1,
                'start_time' => $now->copy()->subDays(1)->subHours(1),
                'submission_time' => $now->copy()->subDays(1),
                'total_score' => 8.75,
                'correct_answer_count' => 35,
                'status' => 'SUBMITTED',
                'updated_at' => $now->copy()->subDays(1),
            ],
            [
                'student_id' => 21,
                'exam_id' => 1,
                'start_time' => $now->copy()->subDays(1)->subHours(1),
                'submission_time' => $now->copy()->subDays(1),
                'total_score' => 8.75,
                'correct_answer_count' => 35,
                'status' => 'SUBMITTED',
                'updated_at' => $now->copy()->subDays(1),
            ],
            [
                'student_id' => 22,
                'exam_id' => 1,
                'start_time' => $now->copy()->subDays(1)->subHours(1),
                'submission_time' => $now->copy()->subDays(1),
                'total_score' => 8.75,
                'correct_answer_count' => 35,
                'status' => 'SUBMITTED',
                'updated_at' => $now->copy()->subDays(1),
            ],
            [
                'student_id' => 23,
                'exam_id' => 1,
                'start_time' => $now->copy()->subDays(1)->subHours(1),
                'submission_time' => $now->copy()->subDays(1),
                'total_score' => 8.75,
                'correct_answer_count' => 35,
                'status' => 'SUBMITTED',
                'updated_at' => $now->copy()->subDays(1),
            ],
            [
                'student_id' => 24,
                'exam_id' => 1,
                'start_time' => $now->copy()->subDays(1)->subHours(1),
                'submission_time' => $now->copy()->subDays(1),
                'total_score' => 8.75,
                'correct_answer_count' => 35,
                'status' => 'SUBMITTED',
                'updated_at' => $now->copy()->subDays(1),
            ],
            [
                'student_id' => 25,
                'exam_id' => 1,
                'start_time' => $now->copy()->subDays(1)->subHours(1),
                'submission_time' => $now->copy()->subDays(1),
                'total_score' => 8.75,
                'correct_answer_count' => 35,
                'status' => 'SUBMITTED',
                'updated_at' => $now->copy()->subDays(1),
            ],
            [
                'student_id' => 26,
                'exam_id' => 1,
                'start_time' => $now->copy()->subDays(1)->subHours(1),
                'submission_time' => $now->copy()->subDays(1),
                'total_score' => 8.75,
                'correct_answer_count' => 35,
                'status' => 'SUBMITTED',
                'updated_at' => $now->copy()->subDays(1),
            ],
            [
                'student_id' => 27,
                'exam_id' => 1,
                'start_time' => $now->copy()->subDays(1)->subHours(1),
                'submission_time' => $now->copy()->subDays(1),
                'total_score' => 8.75,
                'correct_answer_count' => 35,
                'status' => 'SUBMITTED',
                'updated_at' => $now->copy()->subDays(1),
            ],
        ];

        ExamAttempt::upsert(
            $baiLams,
            ['student_id', 'exam_id'], // key xác định trùng
            [] // không update gì khi trùng
        );
    }
}
