<?php

namespace App\Services;

use App\Exceptions\BusinessException;
use App\Models\Exam;
use App\Models\ExamAttempt;
use App\Models\Subject;
use App\Models\User;

class ExamUpdateValidator
{
    public function __construct(private ExamMutationValidator $examMutationValidator)
    {
    }

    public function validate(array $data, Exam $exam, User $actor): ExamUpdatePlan
    {
        $subjectId = (int) ($data['subject_id'] ?? $exam->subject_id);
        Subject::query()
            ->where('is_deleted', false)
            ->lockForUpdate()
            ->findOrFail($subjectId);
        $actor->loadMissing(['role', 'assignedSubjects']);
        $isAdmin = $actor->hasRoleCode('ADMIN') || $actor->isCustomRole();
        if (!$isAdmin && !$actor->assignedSubjects->contains('id', $subjectId)) {
            throw new BusinessException('Giảng viên chưa được phân công học phần này', 403);
        }

        $courseGroupIds = array_key_exists('course_group_ids', $data)
            ? $data['course_group_ids']
            : ($subjectId !== (int) $exam->subject_id
                ? $exam->courseGroups()->pluck('course_groups.id')->all()
                : null);

        $courseGroupAssignmentsChanged = $this->haveCourseGroupAssignmentsChanged($data, $exam);
        if ($courseGroupAssignmentsChanged) {
            $this->examMutationValidator->assertCanAssignCourseGroups($actor);
        }

        if ($courseGroupIds !== null && !empty($courseGroupIds)) {
            $this->examMutationValidator->validateCourseGroups(
                $courseGroupIds,
                $subjectId,
                $actor->id,
                $isAdmin
            );
        }

        $hasAttempts = ExamAttempt::query()->where('exam_id', $exam->id)->exists();
        if ($hasAttempts && $subjectId !== (int) $exam->subject_id) {
            throw new BusinessException(
                'Không thể đổi môn học của đề sau khi đã có lượt thi',
                409
            );
        }

        $scheduleChanged = $this->hasScheduleChanged($data, $exam);
        if ($hasAttempts && ($scheduleChanged || $courseGroupAssignmentsChanged)) {
            throw new BusinessException(
                'Không thể thay đổi lịch, thời lượng hoặc nhóm được giao sau khi đã có lượt thi',
                409
            );
        }

        $questionIds = array_key_exists('questions', $data)
            ? collect($data['questions'])->pluck('id')->map(fn ($id) => (int) $id)->unique()
            : ($subjectId !== (int) $exam->subject_id
                ? $exam->questions()->pluck('questions.id')->map(fn ($id) => (int) $id)->unique()
                : null);
        if ($questionIds !== null) {
            $this->examMutationValidator->validateExamQuestions(
                $questionIds,
                $subjectId,
                $actor,
                $isAdmin
            );
        }

        if (array_key_exists('questions', $data) && $hasAttempts) {
            $this->assertQuestionsUnchanged($exam, $data['questions']);
        }

        return new ExamUpdatePlan($courseGroupAssignmentsChanged, $scheduleChanged);
    }

    private function haveCourseGroupAssignmentsChanged(array $data, Exam $exam): bool
    {
        if (!array_key_exists('course_group_ids', $data)) {
            return false;
        }

        $currentIds = $exam->courseGroups()
            ->pluck('course_groups.id')
            ->map(fn ($id) => (int) $id)
            ->sort()
            ->values()
            ->all();
        $incomingIds = collect($data['course_group_ids'])
            ->map(fn ($id) => (int) $id)
            ->sort()
            ->values()
            ->all();

        return $currentIds !== $incomingIds;
    }

    private function hasScheduleChanged(array $data, Exam $exam): bool
    {
        $scheduleCandidate = clone $exam;
        $scheduleCandidate->fill(collect($data)->only([
            'start_time', 'end_time', 'duration_minutes',
        ])->all());

        return $scheduleCandidate->isDirty();
    }

    private function assertQuestionsUnchanged(Exam $exam, array $incomingQuestions): void
    {
        $currentQuestionMap = $exam->questions()->get()->mapWithKeys(function ($question) {
            return [(int) $question->id => [
                (int) $question->pivot->question_order,
                number_format((float) $question->pivot->score, 2, '.', ''),
            ]];
        })->sortKeys()->all();
        $incomingQuestionMap = collect($incomingQuestions)->mapWithKeys(function ($question) {
            return [(int) $question['id'] => [
                (int) $question['order'],
                number_format((float) $question['score'], 2, '.', ''),
            ]];
        })->sortKeys()->all();

        if ($currentQuestionMap !== $incomingQuestionMap) {
            throw new BusinessException('Không thể thay đổi danh sách câu hỏi sau khi đã có lượt thi', 409);
        }
    }
}
