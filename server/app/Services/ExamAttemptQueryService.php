<?php

namespace App\Services;

use App\Models\CourseGroup;
use App\Models\Exam;
use App\Models\ExamAttempt;
use App\Models\User;
use App\Policies\ExamAttemptPolicy;

class ExamAttemptQueryService
{
    public function __construct(
        private ExamAttemptPolicy $examAttemptPolicy,
        private ExamAttemptReviewService $examAttemptReviewService,
        private ExamQueryService $examQueryService
    ) {
    }

    public function getAll(User $actor)
    {
        $this->assertCanManageLegacyAttempts($actor);

        return ExamAttempt::all();
    }

    public function getOne(ExamAttempt $examAttempt, User $actor)
    {
        $this->assertCanManageLegacyAttempts($actor);

        return $this->examAttemptReviewService->reviewResultById($examAttempt->id, $actor);
    }

    public function reviewResult(ExamAttempt $examAttempt, User $viewer)
    {
        return $this->examAttemptReviewService->reviewResult($examAttempt, $viewer);
    }

    public function getOfStudent(User $user, User $actor)
    {
        $this->examQueryService->assertCanViewStudentExams($actor, $user);

        $examAttempts = ExamAttempt::query()
            ->where('student_id', $user->id)
            ->whereHas('exam', fn ($exam) => $exam->where('is_deleted', false))
            ->with('exam.examConfiguration')
            ->orderByDesc('created_at')
            ->get();

        if ($actor->hasRoleCode('STUDENT') && (int) $actor->id === (int) $user->id) {
            $examAttempts->each(function ($attempt) {
                if (!$attempt->exam?->examConfiguration?->show_score) {
                    $attempt->makeHidden(['total_score', 'correct_answer_count']);
                }
            });
        }

        return ['exam_attempts' => $examAttempts];
    }

    public function getByCourseGroupAndStudent(CourseGroup $courseGroup, User $user, User $actor)
    {
        $this->examQueryService->assertCanViewStudentProgress($actor, $courseGroup, $user);

        $courseGroup->load([
            'exams' => function ($examQuery) use ($user) {
                $examQuery->where('exams.is_deleted', false)->with([
                    'examConfiguration',
                    'attempts' => function ($query) use ($user) {
                        $query->where('student_id', $user->id)->orderByDesc('created_at');
                    },
                ]);
            },
        ]);

        $courseGroup->exams->each(function ($exam) use ($actor) {
            $exam->attempt = $exam->attempts->first() ?? null;
            $exam->can_resume = $exam->attempt !== null
                && $exam->attempt->status !== 'SUBMITTED'
                && (bool) $exam->examConfiguration?->is_enable_resume;

            if (
                $actor->hasRoleCode('STUDENT')
                && $exam->attempt
                && !$exam->examConfiguration?->show_score
            ) {
                $exam->attempt->makeHidden(['total_score', 'correct_answer_count']);
            }

            $exam->makeHidden(['attempts', 'examConfiguration']);
        });

        if ($actor->hasRoleCode('STUDENT')) {
            $courseGroup->makeHidden('join_code');
        }

        return $courseGroup;
    }

    public function getOfCourseGroupAndExam(CourseGroup $courseGroup, Exam $exam, User $actor): array
    {
        $this->examQueryService->assertCanViewGroupResults($actor, $courseGroup, $exam);

        $examAttempts = ExamAttempt::query()
            ->where('exam_id', $exam->id)
            ->whereHas('user.courseGroups', function ($query) use ($courseGroup) {
                $query->where('course_groups.id', $courseGroup->id);
            })
            ->with('examAttemptLogs')
            ->get();

        $submittedAttempts = $examAttempts->where('status', 'SUBMITTED');
        $submittedAttempts->load('examAttemptAnswers');
        $exam->loadCount(['questions as total_questions']);
        $exam->load(['questions.answerOptions']);
        $questions = $exam->questions;

        $result = $examAttempts->map(function ($examAttempt) use ($questions) {
            $questionsClone = collect();

            if ($examAttempt->status === 'SUBMITTED') {
                $answerMap = $examAttempt->examAttemptAnswers->keyBy('question_id');
                $questionsClone = $questions->map(function ($question) use ($answerMap) {
                    $questionClone = clone $question;
                    $answer = $answerMap->get($questionClone->id);
                    $questionClone->selected_answer = $answer?->answer_option_id;

                    return $questionClone;
                });

                $examAttempt->makeHidden('examAttemptAnswers');
            }

            return [
                'examAttempt' => $examAttempt,
                'questions' => $questionsClone,
            ];
        });

        $exam->makeHidden(['examConfiguration', 'questions']);

        return [
            'exam' => $exam,
            'examAttempts' => $result,
        ];
    }

    private function assertCanManageLegacyAttempts(User $actor): void
    {
        abort_unless($this->examAttemptPolicy->manage($actor), 403);
    }
}
