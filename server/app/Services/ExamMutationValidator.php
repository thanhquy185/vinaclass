<?php

namespace App\Services;

use App\Exceptions\BusinessException;
use App\Models\CourseGroup;
use App\Models\Question;
use App\Models\Subject;
use App\Models\User;
use App\Policies\ExamPolicy;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

class ExamMutationValidator
{
    public function __construct(private ExamPolicy $examPolicy)
    {
    }

    public function getAllowedSubjectIds(User $creator, bool $isAdmin): array
    {
        if ($isAdmin) {
            return Subject::query()
                ->where('is_deleted', false)
                ->pluck('id')
                ->map(fn ($id) => (int) $id)
                ->all();
        }

        return $creator->assignedSubjects->where('is_deleted', false)
            ->pluck('id')
            ->map(fn ($id) => (int) $id)
            ->all();
    }

    public function validateCourseGroups(
        array $courseGroupIds,
        int $subjectId,
        int $creatorId,
        bool $isAdmin
    ): void {
        $requestedIds = array_values(array_unique(array_map('intval', $courseGroupIds)));
        $query = CourseGroup::query()
            ->whereIn('id', $requestedIds)
            ->where('subject_id', $subjectId)
            ->where('is_deleted', false);

        if (!$isAdmin) {
            $query->where('teacher_id', $creatorId);
        }

        $validIds = $query
            ->orderBy('id')
            ->lockForUpdate()
            ->pluck('id');

        if ($validIds->count() !== count($requestedIds)) {
            throw new BusinessException('Course groups list is invalid or not under your management', 422);
        }
    }

    public function assertCanAssignCourseGroups(User $actor): void
    {
        if (!$this->examPolicy->assignCourseGroups($actor)) {
            throw new BusinessException('You do not have permission to assign this exam to classes.', 403);
        }
    }

    public function validateExamQuestions(
        Collection $questionIds,
        int $subjectId,
        User $creator,
        bool $isAdmin
    ): void {
        $query = Question::query()
            ->where('subject_id', $subjectId)
            ->where('is_deleted', false)
            ->where('status', '!=', 'archive')
            ->whereIn('id', $questionIds);

        if (!$isAdmin) {
            $query->where(function (Builder $visible) use ($creator) {
                $visible->where('status', 'public')
                    ->orWhere('creator_id', $creator->id);
            });
        }

        $validQuestionIds = $query
            ->orderBy('id')
            ->lockForUpdate()
            ->pluck('id');

        if ($validQuestionIds->count() !== $questionIds->count()) {
            throw new BusinessException(
                'Danh sách câu hỏi phải thuộc đúng học phần, đang hoạt động và được phép sử dụng',
                422
            );
        }
    }
}
