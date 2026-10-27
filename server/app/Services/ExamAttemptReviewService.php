<?php

namespace App\Services;

use App\Models\Exam;
use App\Models\ExamAttempt;
use App\Models\User;
use App\Policies\ExamPolicy;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Symfony\Component\HttpKernel\Exception\HttpException;

class ExamAttemptReviewService
{
    public function __construct(
        private ExamQueryService $examQueryService,
        private ExamPolicy $examPolicy
    )
    {
    }

    public function reviewResult(ExamAttempt $examAttempt, User $viewer)
    {
        $this->assertCanReview($examAttempt, $viewer);

        if ($examAttempt->status !== 'SUBMITTED') {
            throw new HttpException(500, 'Test has not been submitted yet');
        }

        return $this->buildReviewResult($examAttempt, $viewer);
    }

    public function assertCanReview(ExamAttempt $examAttempt, User $viewer): void
    {
        if ($viewer->is_locked || $viewer->is_deleted) {
            throw new HttpException(403, 'Tài khoản không hoạt động');
        }

        if ($viewer->hasRoleCode('STUDENT') && (int) $viewer->id === (int) $examAttempt->student_id) {
            $this->examQueryService->assertCanViewExam($viewer, $examAttempt->exam);
            return;
        }

        if ($viewer->hasRoleCode('ADMIN')) {
            $this->examQueryService->assertCanViewExam($viewer, $examAttempt->exam);
            return;
        }

        if ($viewer->isCustomRole()) {
            $exam = $examAttempt->exam()->with('courseGroups')->firstOrFail();
            $this->examQueryService->assertCanViewExam($viewer, $exam);
            $student = User::query()
                ->with('role')
                ->findOrFail($examAttempt->student_id);
            $canReview = $exam->courseGroups->contains(fn ($courseGroup) =>
                !$courseGroup->is_deleted
                && $this->examPolicy->viewStudentProgress($viewer, $courseGroup, $student)
            );

            if ($canReview) {
                return;
            }

            throw new HttpException(403, 'Không có quyền xem kết quả này');
        }

        if (!$viewer->hasRoleCode('TEACHER')) {
            throw new HttpException(403, 'Không có quyền xem kết quả này');
        }

        $exam = $examAttempt->exam()->with('creator')->firstOrFail();
        $this->examQueryService->assertCanViewExam($viewer, $exam);
        if ((int) $exam->creator_id === (int) $viewer->id) {
            return;
        }

        $teacherManagesStudentGroup = $exam->courseGroups()
            ->where('course_groups.teacher_id', $viewer->id)
            ->where('course_groups.is_deleted', false)
            ->whereHas('students', function ($query) use ($examAttempt) {
                $query->where('users.id', $examAttempt->student_id)
                    ->where('users.is_deleted', false);
            })
            ->exists();

        if ($teacherManagesStudentGroup) {
            return;
        }

        throw new HttpException(403, 'Không có quyền xem kết quả này');
    }

    private function buildReviewResult(ExamAttempt $examAttempt, User $viewer): array
    {
        $examAttempt->load('examAttemptLogs');

        $exam = $examAttempt->exam;
        $exam->loadCount(['questions as total_questions']);
        $questions = $exam->questions;
        $questions->load('answerOptions');
        $examAttemptAnswers = $examAttempt->examAttemptAnswers;

        $examAttempt->makeHidden(['exam', 'examAttemptAnswers']);
        $exam->makeHidden(['examConfiguration', 'questions']);

        $detailMap = $examAttemptAnswers->keyBy('question_id');
        $questions->transform(function ($question) use ($detailMap) {
            $detail = $detailMap->get($question->id);
            if (!$detail) {
                throw new HttpException(500, 'Question data is invalid or student has not attempted this question');
            }

            $question->selected_answer = $detail->answer_option_id;

            return $question;
        });

        $this->applyStudentResultVisibility($examAttempt, $exam, $questions, $viewer);

        return [
            'examAttempt' => $examAttempt,
            'exam' => $exam,
            'questions' => $questions,
        ];
    }

    private function applyStudentResultVisibility(ExamAttempt $attempt, Exam $exam, $questions, User $viewer): void
    {
        if ((int) $viewer->id !== (int) $attempt->student_id) {
            return;
        }

        $configuration = $exam->examConfiguration;
        if (!$configuration?->show_score) {
            $attempt->makeHidden(['total_score', 'correct_answer_count']);
        }

        if (!$configuration?->show_detail_results) {
            $questions->each(function ($question) {
                $question->setRelation('answerOptions', collect());
                $question->makeHidden(['selected_answer', 'answer_explanation', 'pivot']);
            });
        }
    }

    public function reviewResultById(int $examAttemptId, User $viewer)
    {
        try {
            $examAttempt = ExamAttempt::findOrFail($examAttemptId);
        } catch (ModelNotFoundException $exception) {
            return response()->json(['message' => 'Exam attempt not found'], 404);
        }

        $this->assertCanReview($examAttempt, $viewer);
        if ($examAttempt->status !== 'SUBMITTED') {
            throw new HttpException(500, 'Test has not been submitted yet');
        }

        return $this->buildReviewResult($examAttempt, $viewer);
    }

    public function reviewResultByIdNonCheckStatus(int $examAttemptId, User $viewer)
    {
        try {
            $examAttempt = ExamAttempt::findOrFail($examAttemptId);
        } catch (ModelNotFoundException $exception) {
            return response()->json(['message' => 'Exam attempt not found'], 404);
        }

        $this->assertCanReview($examAttempt, $viewer);
        $examAttempt->load('examAttemptLogs');

        $exam = $examAttempt->exam;
        $exam->loadCount(['questions as total_questions']);
        $questions = $exam->questions;
        $questions->load('answerOptions');
        $examAttemptAnswers = $examAttempt->examAttemptAnswers;

        $examAttempt->makeHidden(['exam', 'examAttemptAnswers']);
        $exam->makeHidden(['examConfiguration', 'questions']);

        $detailMap = $examAttemptAnswers->keyBy('question_id');
        $questions->transform(function ($question) use ($detailMap) {
            $detail = $detailMap->get($question->id);
            $question->selected_answer = $detail?->answer_option_id;

            return $question;
        });

        $this->applyStudentResultVisibility($examAttempt, $exam, $questions, $viewer);

        return [
            'examAttempt' => $examAttempt,
            'exam' => $exam,
            'questions' => $questions,
        ];
    }
}
