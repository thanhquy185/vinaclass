<?php

namespace App\Services;

use App\Models\CourseGroup;
use App\Models\Exam;
use App\Models\User;
use App\Policies\ExamPolicy;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Carbon;

class ExamQueryService
{
    public function __construct(private ExamPolicy $examPolicy)
    {
    }

    public function getAll(User $viewer)
    {
        $query = Exam::query()
            ->where('is_deleted', false)
            ->with([
                'subject',
                'courseGroups' => fn ($groups) => $groups->where('course_groups.is_deleted', false),
            ]);

        if (!$this->examPolicy->viewCatalog($viewer)) {
            return $query->whereRaw('1 = 0')->get();
        }

        if ($viewer->hasRoleCode('ADMIN') || $viewer->isCustomRole()) {
            return $query->get();
        }

        if ($viewer->hasRoleCode('TEACHER')) {
            $exams = $query->where(function (Builder $visible) use ($viewer) {
                $visible->where('creator_id', $viewer->id)
                    ->orWhereHas('courseGroups', fn ($groups) => $groups
                        ->where('teacher_id', $viewer->id)
                        ->where('course_groups.is_deleted', false));
            })->get();

            $exams->each(function ($exam) use ($viewer) {
                $exam->setRelation('courseGroups', $exam->courseGroups->where('teacher_id', $viewer->id)->values());
                $exam->courseGroups->each(fn ($group) => $group->makeHidden('join_code'));
            });

            return $exams;
        }

        if ($viewer->hasRoleCode('STUDENT')) {
            $groupIds = $viewer->courseGroups()
                ->where('course_groups.is_deleted', false)
                ->pluck('course_groups.id');

            $exams = $query
                ->whereHas('courseGroups', fn ($groups) => $groups->whereIn('course_groups.id', $groupIds))
                ->with(['courseGroups' => fn ($groups) => $groups->whereIn('course_groups.id', $groupIds)])
                ->get();

            $exams->each(fn ($exam) => $exam->courseGroups->each(fn ($group) => $group->makeHidden('join_code')));

            return $exams;
        }

        return $query->whereRaw('1 = 0')->get();
    }

    public function getOne(Exam $exam)
    {
        $exam->load('questions');

        return $exam;
    }

    public function getById(int $id): Exam
    {
        return Exam::query()->where('is_deleted', false)->findOrFail($id);
    }

    public function assertCanViewStudentExams(User $actor, User $student): void
    {
        abort_unless($this->examPolicy->viewStudentExams($actor, $student), 403);
    }

    public function assertCanViewStudentProgress(User $actor, CourseGroup $courseGroup, User $student): void
    {
        abort_unless($this->examPolicy->viewStudentProgress($actor, $courseGroup, $student), 403);
    }

    public function assertCanViewExam(User $actor, Exam $exam): void
    {
        abort_unless($this->examPolicy->view($actor, $exam), 403);
    }

    public function assertCanViewGroupResults(User $actor, CourseGroup $courseGroup, Exam $exam): void
    {
        abort_unless($this->examPolicy->viewGroupResults($actor, $courseGroup, $exam), 403);
    }

    public function getOfStudent(User $user)
    {
        // Start from this student's membership relation so the result can only
        // contain exams assigned to active classes they currently belong to.
        $courseGroups = $user->courseGroups()
            ->where('course_groups.is_deleted', false)
            ->with(['exams' => fn ($query) => $query
                ->where('exams.is_deleted', false)
                ->with('subject')])
            ->get();

        $examsById = [];

        foreach ($courseGroups as $courseGroup) {
            foreach ($courseGroup->exams->where('is_deleted', false) as $exam) {
                if (!isset($examsById[$exam->id])) {
                    $exam->setAttribute('assigned_course_groups', []);
                    $examsById[$exam->id] = $exam;
                }

                $assignedCourseGroups = $examsById[$exam->id]->getAttribute('assigned_course_groups');
                $assignedCourseGroups[] = [
                    'id' => (int) $courseGroup->id,
                    'group_name' => $courseGroup->group_name,
                    'subject_id' => (int) $courseGroup->subject_id,
                    'start_time' => $exam->pivot?->start_time ?? $exam->start_time,
                    'end_time' => $exam->pivot?->end_time ?? $exam->end_time,
                ];
                $examsById[$exam->id]->setAttribute('assigned_course_groups', $assignedCourseGroups);
            }
        }

        return collect(array_values($examsById));
    }

    public function getQuestions(int $examId)
    {
        $exam = Exam::findOrFail($examId);
        $exam->load('questions');

        return $exam->questions;
    }

    public function isOpenForCourseGroup(Exam $exam, CourseGroup $courseGroup, Carbon $at): bool
    {
        if ($exam->is_deleted || $courseGroup->is_deleted) {
            return false;
        }

        [$startsAt, $endsAt] = $this->effectiveAssignmentWindow($exam, $courseGroup);

        return $at->greaterThanOrEqualTo($startsAt) && $at->lessThan($endsAt);
    }

    public function getExamDetails(Exam $exam, User $viewer)
    {
        abort_unless(!$exam->is_deleted, 404);
        abort_unless($this->examPolicy->view($viewer, $exam), 403);
        $exam->load(['subject', 'courseGroups', 'examConfiguration']);
        $isStaff = $viewer->hasRoleCode('ADMIN', 'TEACHER') || $viewer->isCustomRole();

        if ($isStaff) {
            abort_unless($viewer->hasRoleCode('ADMIN')
                || $viewer->isCustomRole()
                || (int) $exam->creator_id === (int) $viewer->id
                || $exam->courseGroups->contains('teacher_id', $viewer->id), 403);

            if ($viewer->hasRoleCode('TEACHER')) {
                $exam->setRelation('courseGroups', $exam->courseGroups->where('teacher_id', $viewer->id)->values());
                $exam->courseGroups->each(fn ($group) => $group->makeHidden('join_code'));
            }
        } else {
            $now = now();
            $enrolledIds = $viewer->courseGroups()
                ->where('course_groups.is_deleted', false)
                ->pluck('course_groups.id')
                ->map(fn ($id) => (int) $id)
                ->all();
            $assigned = $exam->courseGroups->contains(function (CourseGroup $group) use ($enrolledIds, $now, $exam) {
                return in_array((int) $group->id, $enrolledIds, true)
                    && $this->isOpenForCourseGroup($exam, $group, $now);
            });

            abort_unless($viewer->hasRoleCode('STUDENT') && !$viewer->is_locked && !$viewer->is_deleted && $assigned, 403);
            $exam->setRelation('courseGroups', $exam->courseGroups->whereIn('id', $enrolledIds)->values());
            $exam->courseGroups->each(fn ($group) => $group->makeHidden('join_code'));
        }

        $exam->load('questions');
        $exam->questions->load('answerOptions');

        if (!$isStaff) {
            $exam->questions->each(function ($question) {
                $question->makeHidden('answer_explanation');
                $question->answerOptions->each(fn ($answer) => $answer->makeHidden('is_correct_answer'));
            });
        }

        return $exam;
    }

    public function getByCourseGroupAndStudent(CourseGroup $courseGroup, User $user, User $viewer)
    {
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

        $courseGroup->exams->each(function ($exam) use ($courseGroup, $viewer) {
            [$startsAt, $endsAt] = $this->effectiveAssignmentWindow($exam, $courseGroup);
            $exam->start_time = $startsAt;
            $exam->end_time = $endsAt;
            $exam->attempt = $exam->attempts->first() ?? null;
            $exam->can_resume = $exam->attempt !== null
                && $exam->attempt->status !== 'SUBMITTED'
                && (bool) $exam->examConfiguration?->is_enable_resume;

            if ($viewer->hasRoleCode('STUDENT') && $exam->attempt && !$exam->examConfiguration?->show_score) {
                $exam->attempt->makeHidden(['total_score', 'correct_answer_count']);
            }

            $exam->makeHidden(['attempts', 'examConfiguration']);
        });

        return $courseGroup;
    }

    /**
     * @return array{0: Carbon, 1: Carbon}
     */
    private function effectiveAssignmentWindow(Exam $exam, CourseGroup $courseGroup): array
    {
        $examStartsAt = Carbon::parse($exam->start_time);
        $examEndsAt = Carbon::parse($exam->end_time);
        $assignmentStartsAt = $courseGroup->pivot?->start_time
            ? Carbon::parse($courseGroup->pivot->start_time)
            : $examStartsAt->copy();
        $assignmentEndsAt = $courseGroup->pivot?->end_time
            ? Carbon::parse($courseGroup->pivot->end_time)
            : $examEndsAt->copy();

        return [
            $assignmentStartsAt->greaterThan($examStartsAt) ? $assignmentStartsAt : $examStartsAt,
            $assignmentEndsAt->lessThan($examEndsAt) ? $assignmentEndsAt : $examEndsAt,
        ];
    }
}
