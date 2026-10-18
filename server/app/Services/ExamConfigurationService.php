<?php

namespace App\Services;

use App\Models\ExamConfiguration;

class ExamConfigurationService
{
    public function getAll()
    {
        return ExamConfiguration::with('exam')->get();
    }

    public function getOne(ExamConfiguration $examConfiguration): ExamConfiguration
    {
        return $examConfiguration->load('exam');
    }

    public function create(array $data): ExamConfiguration
    {
        $examConfiguration = ExamConfiguration::create($data);
        return $examConfiguration->load('exam');
    }

    public function update(ExamConfiguration $examConfiguration, array $data): ExamConfiguration
    {
        $examConfiguration->update($data);
        return $examConfiguration->load('exam');
    }

    public function delete(ExamConfiguration $examConfiguration): bool
    {
        return (bool) $examConfiguration->delete();
    }

    public function findByExamId(int $examId): ?ExamConfiguration
    {
        return ExamConfiguration::where('exam_id', $examId)->first();
    }
}
