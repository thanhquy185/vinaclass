<?php

namespace App\Services;

use App\Exceptions\BusinessException;
use App\Models\ExamAssignment;
use App\Models\ExamAttempt;

class ExamAssignmentService
{
    public function getAll()
    {
        return ExamAssignment::all();
    }

    public function getOne(ExamAssignment $examAssignment)
    {
        return $examAssignment;
    }

    public function add(array $data): ExamAssignment
    {
        $this->assertNoAttempts((int) $data['exam_id']);
        return ExamAssignment::create($data);
    }

    public function update(array $data, ExamAssignment $examAssignment): ExamAssignment
    {
        $candidate = clone $examAssignment;
        $candidate->fill($data);
        if ($candidate->isDirty()) {
            $this->assertNoAttemptsForExams([
                (int) $examAssignment->exam_id,
                (int) $candidate->exam_id,
            ]);
        }
        $examAssignment->update($data);
        return $examAssignment;
    }

    public function delete(ExamAssignment $examAssignment): bool
    {
        $this->assertNoAttempts((int) $examAssignment->exam_id);
        return (bool) $examAssignment->delete();
    }

    public function addArr(array $data): bool
    {
        if (!empty($data)) {
            $this->assertNoAttemptsForExams(array_column($data, 'exam_id'));
        }
        return ExamAssignment::query()->insert($data);
    }

    public function deleteByExamId(int $examId): int
    {
        $this->assertNoAttempts($examId);
        return ExamAssignment::query()->where('exam_id', $examId)->delete();
    }

    private function assertNoAttempts(int $examId): void
    {
        $this->assertNoAttemptsForExams([$examId]);
    }

    private function assertNoAttemptsForExams(array $examIds): void
    {
        if (ExamAttempt::query()->whereIn('exam_id', array_unique($examIds))->exists()) {
            throw new BusinessException('Không thể thay đổi nhóm được giao sau khi đã có lượt thi', 409);
        }
    }
}
