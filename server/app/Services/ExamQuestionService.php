<?php

namespace App\Services;

use App\Models\ExamQuestion;

class ExamQuestionService
{
    public function getAll()
    {
        return ExamQuestion::all();
    }

    public function getOne(ExamQuestion $examQuestion)
    {
        return $examQuestion;
    }

    public function add(array $data)
    {
        //
    }

    public function update(array $data, ExamQuestion $examQuestion)
    {
        //
    }

    public function delete(ExamQuestion $examQuestion)
    {
        //
    }

    public function getByExamAndQuestion(int $examId, int $questionId): ExamQuestion
    {
        return ExamQuestion::where('exam_id', $examId)
            ->where('question_id', $questionId)
            ->firstOrFail();
    }
    public function addArr(array $data)
    {
        return ExamQuestion::insert($data);
    }

    public function deleteByExamId(int $examId): int
    {
        return ExamQuestion::where('exam_id', $examId)->delete();
    }
}
