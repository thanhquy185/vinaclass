<?php

namespace App\Services;

use App\Models\Chapter;
use App\Models\Subject;
use App\Models\User;
use App\Policies\ChapterPolicy;
use Illuminate\Support\Facades\DB;

class ChapterService
{
    public function __construct(private ChapterPolicy $chapterPolicy)
    {
    }

    public function getAll(User $viewer)
    {
        abort_unless($this->chapterPolicy->viewCatalog($viewer), 403);

        $query = Chapter::query()
            ->where('is_deleted', false)
            ->whereHas('subject', fn ($subjects) => $subjects->where('is_deleted', false))
            ->with('subject');

        if ($viewer->hasRoleCode('TEACHER')) {
            $query->whereIn(
                'subject_id',
                $viewer->assignedSubjects()->where('subjects.is_deleted', false)->select('subjects.id')
            );
        }

        return $query->orderByDesc('id')->get();
    }

    public function getOne(Chapter $chapter, User $viewer): Chapter
    {
        abort_unless($this->chapterPolicy->view($viewer, $chapter), 404);

        return $chapter->load('subject');
    }

    public function create(array $data, User $actor): Chapter
    {
        $actorId = (int) $actor->id;

        return DB::transaction(function () use ($data, $actorId) {
            $actor = $this->lockActor($actorId);
            $subject = Subject::query()
                ->where('is_deleted', false)
                ->lockForUpdate()
                ->findOrFail($data['subject_id']);

            abort_unless(
                $this->chapterPolicy->manageSubject($actor, $subject, 'create'),
                403
            );

            return $subject->chapters()->create([
                'chapter_name' => $data['chapter_name'],
                'is_deleted' => false,
            ]);
        });
    }

    public function update(Subject $subject, array $data, User $actor): Subject
    {
        $subjectId = (int) $subject->id;
        $actorId = (int) $actor->id;

        return DB::transaction(function () use ($subjectId, $data, $actorId) {
            $actor = $this->lockActor($actorId);
            $lockedSubject = Subject::query()
                ->where('is_deleted', false)
                ->lockForUpdate()
                ->findOrFail($subjectId);

            abort_unless(
                $this->chapterPolicy->manageSubject($actor, $lockedSubject, 'update'),
                403
            );

            $incoming = collect($data['chapters'] ?? []);
            $keepIds = [];

            foreach ($incoming as $item) {
                if (!empty($item['id'])) {
                    $chapter = $lockedSubject->chapters()->whereKey($item['id'])->firstOrFail();
                    $chapter->update([
                        'chapter_name' => $item['chapter_name'],
                        'is_deleted' => false,
                    ]);
                } else {
                    $chapter = $lockedSubject->chapters()->create([
                        'chapter_name' => $item['chapter_name'],
                        'is_deleted' => false,
                    ]);
                }

                $keepIds[] = $chapter->id;
            }

            $removedChapters = $lockedSubject->chapters()
                ->where('is_deleted', false)
                ->whereNotIn('id', $keepIds)
                ->lockForUpdate()
                ->get();

            foreach ($removedChapters as $chapter) {
                if ($chapter->questions()->exists()) {
                    $chapter->update(['is_deleted' => true]);
                } else {
                    $chapter->delete();
                }
            }

            $lockedSubject->setRelation(
                'chapters',
                $lockedSubject->chapters()
                    ->where('is_deleted', false)
                    ->orderBy('id')
                    ->get()
            );

            return $lockedSubject;
        });
    }

    public function getBySubject(Subject $subject, User $viewer)
    {
        abort_unless(
            $this->chapterPolicy->viewForSubject($viewer, $subject),
            404
        );

        return $subject->chapters()
            ->where('is_deleted', false)
            ->orderBy('id')
            ->get();
    }

    public function delete(Chapter $chapter, User $actor): bool
    {
        $chapterId = (int) $chapter->id;
        $subjectId = (int) $chapter->subject_id;
        $actorId = (int) $actor->id;

        return DB::transaction(function () use ($chapterId, $subjectId, $actorId) {
            $actor = $this->lockActor($actorId);
            $subject = Subject::query()
                ->where('is_deleted', false)
                ->lockForUpdate()
                ->findOrFail($subjectId);

            abort_unless(
                $this->chapterPolicy->manageSubject($actor, $subject, 'delete'),
                403
            );

            $lockedChapter = Chapter::query()
                ->where('subject_id', $subject->id)
                ->lockForUpdate()
                ->findOrFail($chapterId);

            abort_unless(!$lockedChapter->is_deleted, 404);

            if ($lockedChapter->questions()->exists()) {
                return (bool) $lockedChapter->update(['is_deleted' => true]);
            }

            return (bool) $lockedChapter->delete();
        });
    }

    private function lockActor(int $actorId): User
    {
        return User::query()
            ->with(['role', 'assignedSubjects'])
            ->lockForUpdate()
            ->findOrFail($actorId);
    }
}
