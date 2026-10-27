<?php

namespace App\Services;

use App\Models\ExamQuestion;
use Illuminate\Support\Facades\DB;

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
        return ExamQuestion::query()
            ->where('exam_id', $examId)
            ->where('question_id', $questionId)
            ->firstOrFail();
    }

    public function addArr(array $data)
    {
        if ($data === []) {
            return true;
        }

        $timestamp = now();
        $rows = array_map(static function (array $row) use ($timestamp): array {
            $row['created_at'] ??= $timestamp;
            $row['updated_at'] ??= $timestamp;

            return $row;
        }, $data);

        return ExamQuestion::query()->insert($rows);
    }

    public function deleteByExamId(int $examId): int
    {
        return ExamQuestion::query()
            ->where('exam_id', $examId)
            ->delete();
    }

    /**
     * Replace an exam's question set without changing the original usage date
     * of question links that remain in the exam.
     *
     * Statistics use exam_questions.created_at to measure when a question was
     * added to an exam, so deleting and reinserting every pivot on each edit
     * would incorrectly count unchanged questions as new usage.
     */
    public function syncForExam(int $examId, array $questions): void
    {
        DB::transaction(function () use ($examId, $questions): void {
            $createdAtByQuestionId = ExamQuestion::query()
                ->where('exam_id', $examId)
                ->pluck('created_at', 'question_id');

            $timestamp = now();
            $rows = array_map(static function (array $question) use (
                $examId,
                $createdAtByQuestionId,
                $timestamp
            ): array {
                $questionId = (int) $question['question_id'];

                return [
                    ...$question,
                    'exam_id' => $examId,
                    'created_at' => $createdAtByQuestionId->has($questionId)
                        ? $createdAtByQuestionId->get($questionId)
                        : $timestamp,
                    'updated_at' => $timestamp,
                ];
            }, $questions);

            $this->deleteByExamId($examId);

            if ($rows !== []) {
                ExamQuestion::query()->insert($rows);
            }
        });
    }
}
