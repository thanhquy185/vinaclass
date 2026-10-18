<?php

namespace Database\Seeders;

use App\Models\CauHoi;
use App\Models\ChiTietDeThi;
use App\Models\ExamQuestion;
use Illuminate\Database\Seeder;

class ExamQuestionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $chiTietDeThis = [];

        $chiTietDeThis = [];

        // đề 1 (id = 1, môn 1)
        $question_order = 1;
        for ($i = 1; $i <= 10; $i++) {
            $chiTietDeThis[] = [
                'question_id' => $i,
                'exam_id' => 1,
                'question_order' => $question_order++,
            ];
        }

        // đề 2 (id = 2, môn 1)
        $question_order = 1;
        for ($i = 11; $i <= 20; $i++) {
            $chiTietDeThis[] = [
                'question_id' => $i,
                'exam_id' => 2,
                'question_order' => $question_order++,
            ];
        }

        // đề 3 (id = 3, môn 2)
        $question_order = 1;
        for ($i = 26; $i <= 35; $i++) {
            $chiTietDeThis[] = [
                'question_id' => $i,
                'exam_id' => 3,
                'question_order' => $question_order++,
            ];
        }

        // đề 4 (id = 4, môn 2)
        $question_order = 1;
        for ($i = 36; $i <= 45; $i++) {
            $chiTietDeThis[] = [
                'question_id' => $i,
                'exam_id' => 4,
                'question_order' => $question_order++,
            ];
        }

        ExamQuestion::insert($chiTietDeThis);
    }
}
