<?php

namespace App\Services;

use App\Jobs\SubmitTestJob;
use App\Models\Exam;
use App\Models\ExamAttempt;

class ExamAttemptTimingService
{
    public function remainingSeconds(ExamAttempt $attempt, Exam $exam): int
    {
        $deadline = min(
            $attempt->deadline_at?->timestamp ?? PHP_INT_MAX,
            $attempt->start_time->copy()->addMinutes((int) $exam->duration_minutes)->timestamp,
            $exam->end_time->timestamp
        );

        return max(0, $deadline - now()->timestamp);
    }

    public function scheduleAutomaticSubmission(int $examAttemptId, int $seconds): void
    {
        $seconds += 10;

        SubmitTestJob::dispatch($examAttemptId)
            ->onConnection('database')
            ->delay(now()->addSecond($seconds));
    }
}
