<?php

namespace App\Services;

use App\Models\CourseGroup;
use App\Models\Exam;
use App\Models\ExamAttempt;
use App\Models\ExamQuestion;
use App\Models\Question;
use App\Models\User;
use App\Policies\ExamAttemptPolicy;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\HttpException;

class ExamAttemptStartService
{
    public function __construct(
        private ExamAttemptLogService $examAttemptLogService,
        private ExamAttemptAnswerService $examAttemptAnswerService,
        private ExamAttemptPolicy $examAttemptPolicy,
        private ExamAttemptTimingService $examAttemptTimingService,
        private ExamQueryService $examQueryService
    ) {
    }

    public function startTest(array $data, User $actor)
    {
        $studentId = $data['student_id'];
        $examId = $data['exam_id'];

        $student = User::query()->findOrFail($studentId);
        if (!$this->examAttemptPolicy->startOwnAttempt($actor, $student)) {
            throw new HttpException(403, 'Tài khoản không đủ điều kiện dự thi');
        }

        $exam = $this->examQueryService->getById($examId);
        $now = Date::now();
        if ($exam->is_deleted || $now->lt($exam->start_time) || $now->gte($exam->end_time)) {
            throw new HttpException(422, 'Đề thi chưa mở hoặc đã kết thúc');
        }

        [$examAttempt, $duration, $exam] = DB::transaction(function () use ($studentId, $examId, $actor) {
            // Lock both identities in a stable order before checking the current role and account state.
            $lockedUsers = $this->lockUsers((int) $actor->id, (int) $studentId);
            $currentActor = $lockedUsers[(int) $actor->id];
            $student = $lockedUsers[(int) $studentId];

            if (!$this->examAttemptPolicy->startOwnAttempt($currentActor, $student)) {
                throw new HttpException(403, 'Tài khoản không đủ điều kiện dự thi');
            }

            // Keep the exam definition stable while creating its attempt.
            $exam = Exam::query()
                ->with(['examConfiguration', 'courseGroups'])
                ->lockForUpdate()
                ->findOrFail($examId);
            $now = Date::now();
            if ($exam->is_deleted || $now->lt($exam->start_time) || $now->gte($exam->end_time)) {
                throw new HttpException(422, 'Đề thi chưa mở hoặc đã kết thúc');
            }

            $enrolledGroupIds = $student->courseGroups()
                ->where('course_groups.is_deleted', false)
                ->pluck('course_groups.id')
                ->map(fn ($id) => (int) $id)
                ->all();
            $eligibleGroup = $exam->courseGroups->first(function (CourseGroup $group) use ($enrolledGroupIds, $now, $exam) {
                return in_array((int) $group->id, $enrolledGroupIds, true)
                    && $this->examQueryService->isOpenForCourseGroup($exam, $group, $now);
            });

            if (!$eligibleGroup) {
                throw new HttpException(403, 'Sinh viên chưa được phân công đề thi này');
            }

            $existingAttempt = ExamAttempt::query()
                ->where('student_id', $studentId)
                ->where('exam_id', $examId)
                ->lockForUpdate()
                ->latest('id')
                ->first();
            if ($existingAttempt) {
                if ($existingAttempt->status !== 'SUBMITTED' && $exam->examConfiguration?->is_enable_resume) {
                    return [$existingAttempt, null, $exam];
                }

                throw new HttpException(409, 'Sinh viên đã sử dụng lượt thi của đề này');
            }

            $questionIds = ExamQuestion::query()
                ->where('exam_id', $examId)
                ->orderBy('question_id')
                ->pluck('question_id');
            if ($questionIds->isEmpty()) {
                throw new HttpException(422, 'Đề thi chưa có câu hỏi');
            }

            $assignmentEnd = $eligibleGroup->pivot->end_time ?: $exam->end_time;
            $effectiveEndTimestamp = min(
                $exam->end_time->timestamp,
                Date::parse($assignmentEnd)->timestamp
            );
            $deadlineTimestamp = min(
                $now->copy()->addMinutes($exam->duration_minutes)->timestamp,
                $effectiveEndTimestamp
            );
            if ($deadlineTimestamp <= $now->timestamp) {
                throw new HttpException(422, 'Đề thi đã kết thúc theo lịch của lớp học');
            }

            $duration = $deadlineTimestamp - $now->timestamp;

            // Prevent question edits from racing with the initial attempt snapshot.
            Question::query()
                ->whereIn('id', $questionIds)
                ->orderBy('id')
                ->lockForUpdate()
                ->get();
            $questions = $this->examQueryService->getQuestions($examId);

            $examAttempt = ExamAttempt::create([
                'student_id' => $studentId,
                'exam_id' => $examId,
                'start_time' => $now,
                'deadline_at' => $now->copy()->setTimestamp($deadlineTimestamp),
            ]);
            $this->examAttemptLogService->add([
                'exam_attempt_id' => $examAttempt->id,
                'tab_switch_count' => 0,
            ]);

            $answerRows = $questions->map(fn ($question) => [
                'exam_attempt_id' => $examAttempt->id,
                'question_id' => $question->id,
            ]);
            $this->examAttemptAnswerService->addManyNonTrans($answerRows);

            return [$examAttempt, $duration, $exam];
        });

        $remainingSeconds = $duration ?? $this->examAttemptTimingService->remainingSeconds($examAttempt, $exam);
        if ($duration !== null) {
            $this->examAttemptTimingService->scheduleAutomaticSubmission($examAttempt->id, $duration);
        }

        $examAttempt->setAttribute('remaining_seconds', $remainingSeconds);

        return $examAttempt->load(['examAttemptAnswers', 'examAttemptLog']);
    }

    /**
     * @return array<int, User>
     */
    private function lockUsers(int $actorId, int $studentId): array
    {
        $userIds = array_values(array_unique([$actorId, $studentId]));
        sort($userIds);

        $lockedUsers = [];
        foreach ($userIds as $userId) {
            $lockedUsers[$userId] = User::query()
                ->with('role')
                ->lockForUpdate()
                ->findOrFail($userId);
        }

        return $lockedUsers;
    }
}
