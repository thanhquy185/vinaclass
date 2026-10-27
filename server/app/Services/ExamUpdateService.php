<?php

namespace App\Services;

use App\Models\Exam;
use App\Models\User;
use App\Policies\ExamPolicy;
use Illuminate\Support\Facades\DB;

class ExamUpdateService
{
    public function __construct(
        private ExamUpdateValidator $updateValidator,
        private ExamUpdateRelationsSynchronizer $relationsSynchronizer,
        private ExamPolicy $examPolicy
    ) {
    }

    public function update(array $data, Exam $exam, User $actor): Exam
    {
        $examId = (int) $exam->id;
        $actorId = (int) $actor->id;

        return DB::transaction(function () use ($data, $examId, $actorId): Exam {
            $actor = $this->lockActor($actorId);
            // Serialize edits with exam starts while keeping the actor-first lock order.
            $exam = Exam::query()->lockForUpdate()->findOrFail($examId);
            $this->assertCanManage($exam, $actor, 'update');
            $updatePlan = $this->updateValidator->validate($data, $exam, $actor);

            $exam->update(collect($data)->only([
                'subject_id', 'exam_name', 'start_time', 'end_time', 'duration_minutes',
            ])->all());

            $this->relationsSynchronizer->sync($data, $exam, $updatePlan, $actor);

            $exam->load(['questions', 'subject', 'courseGroups', 'examConfiguration']);
            $exam->questions->load('answerOptions');

            return $exam;
        });
    }

    public function assertCanManage(Exam $exam, User $actor, string $action = 'update'): void
    {
        if ($exam->is_deleted) {
            abort(404);
        }

        abort_unless($this->examPolicy->manage($actor, $exam, $action), 403);
    }

    private function lockActor(int $actorId): User
    {
        return User::query()
            ->with(['role', 'assignedSubjects'])
            ->lockForUpdate()
            ->findOrFail($actorId);
    }
}
