<?php

namespace App\Services;

use App\Models\ExamAttempt;
use App\Models\User;
use App\Policies\ExamAttemptPolicy;
use DateTime;
use Illuminate\Support\Facades\DB;

class ExamAttemptService
{
    public function __construct(
        private ExamAttemptStartService $examAttemptStartService,
        private ExamAttemptTimingService $examAttemptTimingService,
        private ExamAttemptSubmissionService $examAttemptSubmissionService,
        private ExamAttemptPolicy $examAttemptPolicy
    ) {
    }

    public function add(array $data, User $actor)
    {
        $actorId = (int) $actor->id;

        return DB::transaction(function () use ($data, $actorId) {
            $actor = $this->lockActor($actorId);
            $this->assertCanManageLegacyAttempts($actor);

            return ExamAttempt::create($data);
        });
    }

    public function update(array $data, ExamAttempt $examAttempt, User $actor)
    {
        $examAttemptId = (int) $examAttempt->id;
        $actorId = (int) $actor->id;

        return DB::transaction(function () use ($data, $examAttemptId, $actorId) {
            $actor = $this->lockActor($actorId);
            $this->assertCanManageLegacyAttempts($actor);
            $examAttempt = ExamAttempt::query()
                ->lockForUpdate()
                ->findOrFail($examAttemptId);

            $examAttempt->update($data);

            return $examAttempt->refresh();
        });
    }

    public function updateById(array $data, int $examAttemptId, User $actor)
    {
        $actorId = (int) $actor->id;

        return DB::transaction(function () use ($data, $examAttemptId, $actorId): bool {
            $actor = $this->lockActor($actorId);
            $this->assertCanManageLegacyAttempts($actor);
            $examAttempt = ExamAttempt::query()
                ->lockForUpdate()
                ->findOrFail($examAttemptId);

            return (bool) $examAttempt->update($data);
        });
    }

    public function delete(ExamAttempt $examAttempt, User $actor)
    {
        $examAttemptId = (int) $examAttempt->id;
        $actorId = (int) $actor->id;

        return DB::transaction(function () use ($examAttemptId, $actorId): bool {
            $actor = $this->lockActor($actorId);
            $this->assertCanManageLegacyAttempts($actor);
            $examAttempt = ExamAttempt::query()
                ->lockForUpdate()
                ->findOrFail($examAttemptId);

            return (bool) $examAttempt->delete();
        });
    }

    private function assertCanManageLegacyAttempts(User $actor): void
    {
        abort_unless($this->examAttemptPolicy->manage($actor), 403);
    }

    private function lockActor(int $actorId): User
    {
        return User::query()
            ->with('role')
            ->lockForUpdate()
            ->findOrFail($actorId);
    }

    public function startTest(array $data, User $actor)
    {
        return $this->examAttemptStartService->startTest($data, $actor);
    }

    public function calculateDuration(DateTime $startTime, DateTime $endTime, int $doTestTime): float
    {
        $expectedEnd = clone $startTime;
        $expectedEnd->modify("+{$doTestTime} minutes");

        if ($expectedEnd <= $endTime) {
            return $doTestTime;
        }

        return ($endTime->getTimestamp() - $startTime->getTimestamp()) / 60;
    }

    // Automatically submit when the client cannot send its final request.
    public function setAutoSubmit(int $examAttemptId, int $sec)
    {
        $this->examAttemptTimingService->scheduleAutomaticSubmission($examAttemptId, $sec);
    }

    public function updateStudentTest(array $data, ExamAttempt $examAttempt, User $actor)
    {
        return $this->examAttemptSubmissionService->updateStudentTest(
            $data,
            $examAttempt,
            $actor
        );
    }

    public function submitTest(array $data, int $examAttemptId, User $actor)
    {
        return $this->examAttemptSubmissionService->submitTest($data, $examAttemptId, $actor);
    }

    /** Submit only after the scheduled deadline. Called by the timeout queue job. */
    public function submitExpiredTest(int $examAttemptId)
    {
        return $this->examAttemptSubmissionService->submitExpiredTest($examAttemptId);
    }

    /** Force submission after the student's tab-switch limit has been reached. */
    public function submitAfterTabSwitchLimit(int $examAttemptId, User $actor)
    {
        return $this->examAttemptSubmissionService->submitAfterTabSwitchLimit(
            $examAttemptId,
            $actor
        );
    }

}
