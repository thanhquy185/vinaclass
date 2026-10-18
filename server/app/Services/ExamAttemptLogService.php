<?php

namespace App\Services;

use App\Models\ExamAttempt;
use App\Models\ExamAttemptLog;

class ExamAttemptLogService
{
    public function getAll()
    {
        return ExamAttemptLog::all();
    }

    public function getOne(ExamAttemptLog $examAttemptLog)
    {
        return $examAttemptLog;
    }

    public function add(array $data)
    {
        return ExamAttemptLog::create($data);
    }

    public function update(array $data, ExamAttempt $examAttempt): int
    {
        return ExamAttemptLog::where('exam_attempt_id', $examAttempt->id)
            ->update($data);
    }

    public function delete(ExamAttemptLog $examAttemptLog)
    {
        return $examAttemptLog->delete();
    }
}
