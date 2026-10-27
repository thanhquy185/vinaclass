<?php

namespace App\Services;

use App\Models\ExamAttempt;
use App\Models\ExamAttemptLog;
use App\Models\User;
use App\Policies\ExamAttemptPolicy;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\HttpException;

class ExamAttemptLogService
{
    public function __construct(private ExamAttemptPolicy $examAttemptPolicy)
    {
    }

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

    public function update(array $data, ExamAttempt $examAttempt, User $actor): int
    {
        $actorId = (int) $actor->id;
        $attemptId = (int) $examAttempt->id;

        return DB::transaction(function () use ($data, $attemptId, $actorId) {
            // Lock the current actor before the attempt, matching other attempt write paths.
            $currentActor = User::query()
                ->with('role')
                ->lockForUpdate()
                ->findOrFail($actorId);
            $lockedAttempt = ExamAttempt::query()
                ->lockForUpdate()
                ->findOrFail($attemptId);

            abort_unless(
                $this->examAttemptPolicy->updateOwnLog($currentActor, $lockedAttempt),
                403
            );

            if ($lockedAttempt->status === 'SUBMITTED') {
                throw new HttpException(409, 'Bài thi đã được nộp');
            }

            // Lock the attempt first so concurrent first writes cannot create duplicate logs.
            $log = ExamAttemptLog::query()
                ->where('exam_attempt_id', $lockedAttempt->id)
                ->lockForUpdate()
                ->first();

            if (!$log) {
                $log = ExamAttemptLog::create([
                    'exam_attempt_id' => $lockedAttempt->id,
                    'tab_switch_count' => 0,
                ]);
            }

            $currentCount = (int) $log->tab_switch_count;
            $requestedCount = max(0, (int) ($data['tab_switch_count'] ?? $currentCount));
            // The client sends a monotonic event count; max keeps retries idempotent and handles out-of-order requests.
            $log->tab_switch_count = max($currentCount, $requestedCount);
            $log->save();

            return (int) $log->tab_switch_count;
        });
    }

    public function delete(ExamAttemptLog $examAttemptLog)
    {
        return $examAttemptLog->delete();
    }
}
