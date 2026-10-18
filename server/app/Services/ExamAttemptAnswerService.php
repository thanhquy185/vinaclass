<?php

namespace App\Services;

use App\Models\ExamAttemptAnswer;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class ExamAttemptAnswerService
{
    public function getAll()
    {
        return ExamAttemptAnswer::all();
    }

    public function getOne(ExamAttemptAnswer $examAttemptAnswer): ExamAttemptAnswer
    {
        return $examAttemptAnswer;
    }

    public function add(array $data): ExamAttemptAnswer
    {
        return ExamAttemptAnswer::create($data);
    }

    public function update(array $data, ExamAttemptAnswer $examAttemptAnswer): ExamAttemptAnswer
    {
        $examAttemptAnswer->update($data);
        return $examAttemptAnswer;
    }

    public function updateById(array $data, int $examAttemptId, int $questionId)
    {
        return ExamAttemptAnswer::where('exam_attempt_id', $examAttemptId)
            ->where('question_id', $questionId)
            ->update($data);
    }

    public function delete(ExamAttemptAnswer $examAttemptAnswer): bool
    {
        return (bool) $examAttemptAnswer->delete();
    }

    public function addMany(array $answersArray)
    {
        return DB::transaction(function () use ($answersArray) {
            $results = [];
            foreach ($answersArray as $data) {
                $results[] = ExamAttemptAnswer::create($data);
            }
            return $results;
        });
    }

    public function addManyNonTrans(Collection $answers): array
    {
        $data = $answers->toArray();
        ExamAttemptAnswer::insert($data);
        return $data;
    }

    public function updateBatch(array $data): void
    {
        ExamAttemptAnswer::upsert(
            $data,
            ['exam_attempt_id', 'question_id'], // unique composite key
            ['answer_option_id', 'is_selected_correct', 'score'] // các cột cần update khi bị trùng khóa
        );
    }
}
