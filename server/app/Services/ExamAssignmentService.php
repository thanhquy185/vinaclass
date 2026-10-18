<?php

namespace App\Services;

use App\Models\ExamAssignment;

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
        return ExamAssignment::create($data);
    }

    public function update(array $data, ExamAssignment $examAssignment): ExamAssignment
    {
        $examAssignment->update($data);
        return $examAssignment;
    }

    public function delete(ExamAssignment $examAssignment): bool
    {
        return (bool) $examAssignment->delete();
    }

    public function addArr(array $data): bool
    {
        return ExamAssignment::insert($data);
    }

    public function deleteByExamId(int $examId): int
    {
        return ExamAssignment::where('exam_id', $examId)->delete();
    }
}
