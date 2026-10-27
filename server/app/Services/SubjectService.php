<?php

namespace App\Services;

use App\Models\Subject;
use App\Models\User;
use App\Policies\ChapterPolicy;
use App\Policies\ExamPolicy;
use App\Policies\SubjectPolicy;
use Illuminate\Support\Facades\DB;

class SubjectService
{
    public function __construct(
        private SubjectPolicy $subjectPolicy,
        private ChapterPolicy $chapterPolicy,
        private ExamPolicy $examPolicy
    ) {
    }

    public function getAll(User $viewer)
    {
        abort_unless($this->subjectPolicy->viewCatalog($viewer), 403);

        $query = Subject::query()
            ->where('is_deleted', false)
            ->with([
                'chapters' => fn ($chapters) => $chapters
                    ->where('is_deleted', false)
                    ->orderBy('id'),
            ])
            ->withCount([
                'courseGroups as course_groups_count' => fn ($groups) => $groups
                    ->where('is_deleted', false),
                'chapters as chapters_count' => fn ($chapters) => $chapters
                    ->where('is_deleted', false),
            ])
            ->orderByDesc('id');

        if ($viewer->hasRoleCode('TEACHER')) {
            $query->whereIn(
                'id',
                $viewer->assignedSubjects()->where('subjects.is_deleted', false)->select('subjects.id')
            );
        }

        return $query->get();
    }

    public function getOne(Subject $subject, User $viewer)
    {
        abort_unless($this->subjectPolicy->view($viewer, $subject), 404);

        return $subject->load([
            'chapters' => fn ($chapters) => $chapters
                ->where('is_deleted', false)
                ->orderBy('id'),
        ])->loadCount([
            'courseGroups as course_groups_count' => fn ($groups) => $groups
                ->where('is_deleted', false),
            'chapters as chapters_count' => fn ($chapters) => $chapters
                ->where('is_deleted', false),
        ]);
    }

    public function add(array $data, User $actor): Subject
    {
        $actorId = (int) $actor->id;

        return DB::transaction(function () use ($data, $actorId): Subject {
            $actor = $this->lockActor($actorId);
            abort_unless($this->subjectPolicy->manage($actor, 'create'), 403);

            $subject = Subject::create([
                'subject_code' => $data['subject_code'],
                'subject_name' => $data['subject_name'],
                'credit_count' => $data['credit_count'],
                'theory_hours' => $data['theory_hours'] ?? null,
                'practice_hours' => $data['practice_hours'] ?? null,
                'is_deleted' => false,
            ]);

            $chapters = $data['chapters'] ?? [];
            if ($chapters !== []) {
                abort_unless($this->chapterPolicy->manage($actor, 'create'), 403);

                foreach ($chapters as $chapter) {
                    $subject->chapters()->create([
                        'chapter_name' => $chapter['chapter_name'],
                        'is_deleted' => false,
                    ]);
                }
            }

            return $subject->load([
                'chapters' => fn ($query) => $query
                    ->where('is_deleted', false)
                    ->orderBy('id'),
            ])->loadCount([
                'courseGroups as course_groups_count' => fn ($groups) => $groups
                    ->where('is_deleted', false),
                'chapters as chapters_count' => fn ($query) => $query
                    ->where('is_deleted', false),
            ]);
        });
    }

    public function update(array $data, Subject $subject, User $actor): Subject
    {
        $subjectId = (int) $subject->id;
        $actorId = (int) $actor->id;

        return DB::transaction(function () use ($data, $subjectId, $actorId): Subject {
            $actor = $this->lockActor($actorId);
            abort_unless($this->subjectPolicy->manage($actor, 'update'), 403);
            $subject = Subject::query()
                ->where('is_deleted', false)
                ->lockForUpdate()
                ->findOrFail($subjectId);

            $subject->update(array_intersect_key($data, array_flip([
                'subject_name',
                'credit_count',
                'theory_hours',
                'practice_hours',
            ])));

            return $subject->refresh();
        });
    }

    public function delete(Subject $subject, User $actor): bool
    {
        $subjectId = (int) $subject->id;
        $actorId = (int) $actor->id;

        return DB::transaction(function () use ($subjectId, $actorId): bool {
            $actor = $this->lockActor($actorId);
            abort_unless($this->subjectPolicy->manage($actor, 'delete'), 403);
            $subject = Subject::query()
                ->where('is_deleted', false)
                ->lockForUpdate()
                ->findOrFail($subjectId);

            return (bool) $subject->update(['is_deleted' => true]);
        });
    }

    public function getWithCourseGroups(User $viewer)
    {
        abort_unless($this->subjectPolicy->viewWithCourseGroups($viewer), 403);

        return Subject::query()
            ->where('is_deleted', false)
            ->withCount([
                'courseGroups as course_groups_count' => fn ($groups) => $groups
                    ->where('is_deleted', false),
                'chapters as chapters_count' => fn ($chapters) => $chapters
                    ->where('is_deleted', false),
            ])
            ->with([
                'courseGroups' => fn ($groups) => $groups->where('is_deleted', false),
                'chapters' => fn ($chapters) => $chapters
                    ->where('is_deleted', false)
                    ->orderBy('id'),
            ])
            ->orderByDesc('id')
            ->get();
    }

    public function getCourseGroupsForExam(Subject $subject, User $viewer)
    {
        abort_unless($this->examPolicy->assignCourseGroups($viewer), 403);
        abort_unless($this->subjectPolicy->view($viewer, $subject), 404);

        $query = $subject->courseGroups()
            ->where('is_deleted', false)
            ->orderByDesc('id');

        if ($viewer->hasRoleCode('TEACHER')) {
            $query->where('teacher_id', $viewer->id);
        }

        return $query->get();
    }

    public function getWithChapters(User $viewer)
    {
        return $this->getAll($viewer);
    }

    public function getOfTeacher(User $teacher, User $actor)
    {
        abort_unless(
            $this->subjectPolicy->viewTeacherSubjects($actor, $teacher),
            403
        );

        return $teacher->assignedSubjects()
            ->where('subjects.is_deleted', false)
            ->with([
                'courseGroups' => fn ($groups) => $groups
                    ->where('teacher_id', $teacher->id)
                    ->where('is_deleted', false),
                'chapters' => fn ($chapters) => $chapters->where('is_deleted', false),
            ])
            ->orderByDesc('subjects.id')
            ->get();
    }

    private function lockActor(int $actorId): User
    {
        return User::query()
            ->with('role')
            ->lockForUpdate()
            ->findOrFail($actorId);
    }
}
