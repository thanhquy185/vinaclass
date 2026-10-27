<?php

namespace App\Services;

use App\Models\ExamAttempt;
use App\Models\User;
use App\Policies\ExamAttemptPolicy;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\HttpException;

class ExamAttemptSubmissionService
{
    public function __construct(
        private ExamAttemptReviewService $examAttemptReviewService,
        private ExamAttemptAnswerProcessor $examAttemptAnswerProcessor,
        private ExamAttemptTimingService $examAttemptTimingService,
        private ExamAttemptPolicy $examAttemptPolicy
    ) {
    }

    public function updateStudentTest(array $data, ExamAttempt $examAttempt, User $actor): void
    {
        $examAttemptId = (int) $examAttempt->id;
        $actorId = (int) $actor->id;

        DB::transaction(function () use ($data, $examAttemptId, $actorId): void {
            $actor = $this->lockActor($actorId);
            $examAttempt = ExamAttempt::query()
                ->whereKey($examAttemptId)
                ->lockForUpdate()
                ->firstOrFail();

            abort_unless(
                $this->examAttemptPolicy->updateOwnAttempt($actor, $examAttempt),
                403,
                'Không có quyền cập nhật bài thi này'
            );

            $this->updateLockedAttemptAnswers($data, $examAttempt);
        });
    }

    public function submitTest(array $data, int $examAttemptId, User $actor)
    {
        return $this->submitAttempt($data, $examAttemptId, $actor, false, true);
    }

    /** Submit only after the scheduled deadline. Called by the timeout queue job. */
    public function submitExpiredTest(int $examAttemptId)
    {
        return $this->submitAttempt([], $examAttemptId, null, true, false);
    }

    /** Force submission after the student's tab-switch limit has been reached. */
    public function submitAfterTabSwitchLimit(int $examAttemptId, User $actor)
    {
        return $this->submitAttempt([], $examAttemptId, $actor, false, false);
    }

    private function updateLockedAttemptAnswers(array $data, ExamAttempt $examAttempt): void
    {
        if ($examAttempt->status === 'SUBMITTED') {
            throw new HttpException(409, 'Bài thi đã được nộp');
        }

        if ($this->examAttemptTimingService->remainingSeconds($examAttempt, $examAttempt->exam) <= 0) {
            throw new HttpException(409, 'Đã hết thời gian làm bài');
        }

        $this->examAttemptAnswerProcessor->updateAnswers($data['answers'], $examAttempt);
    }

    private function submitAttempt(
        array $data,
        int $examAttemptId,
        ?User $actor,
        bool $requireExpired,
        bool $saveFinalAnswers
    ) {
        $actorId = $actor ? (int) $actor->id : null;

        return DB::transaction(function () use (
            $data,
            $examAttemptId,
            $actorId,
            $requireExpired,
            $saveFinalAnswers
        ) {
            $actor = $actorId === null ? null : $this->lockActor($actorId);
            $examAttempt = ExamAttempt::query()
                ->whereKey($examAttemptId)
                ->lockForUpdate()
                ->firstOrFail();

            if ($actor) {
                abort_unless(
                    $this->examAttemptPolicy->updateOwnAttempt($actor, $examAttempt),
                    403,
                    'Không có quyền nộp bài thi này'
                );
            } else {
                abort_unless($requireExpired, 403, 'Không có quyền nộp bài thi này');
            }

            if ($examAttempt->status === 'SUBMITTED') {
                throw new HttpException(409, 'Bài thi đã được nộp');
            }

            $expired = $this->examAttemptTimingService
                ->remainingSeconds($examAttempt, $examAttempt->exam) <= 0;

            if ($requireExpired && !$expired) {
                throw new HttpException(409, 'Bài thi chưa đến hạn tự động nộp');
            }

            if ($saveFinalAnswers && !$expired) {
                $this->updateLockedAttemptAnswers($data, $examAttempt);
            }

            $examAttempt->load('examAttemptAnswers');
            $correctAnswerCount = $examAttempt->examAttemptAnswers->reduce(function ($carry, $answer) {
                return $answer->is_selected_correct ? $carry + 1 : $carry;
            }, 0);
            $totalScore = $examAttempt->examAttemptAnswers->reduce(
                fn ($carry, $answer) => $carry + ($answer->score ?? 0),
                0
            );

            $examAttempt->update([
                'submission_time' => Date::now(),
                'total_score' => $totalScore,
                'correct_answer_count' => $correctAnswerCount,
                'status' => 'SUBMITTED',
            ]);

            return $actor
                ? $this->examAttemptReviewService->reviewResultById($examAttempt->id, $actor)
                : true;
        });
    }

    private function lockActor(int $actorId): User
    {
        return User::query()
            ->with('role')
            ->lockForUpdate()
            ->findOrFail($actorId);
    }
}
