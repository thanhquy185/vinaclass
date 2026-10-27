<?php

namespace App\Services;

use App\Exceptions\BusinessException;
use App\Models\Exam;
use App\Models\ExamAttempt;
use App\Models\ExamConfiguration;
use App\Models\User;
use App\Policies\ExamPolicy;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

class ExamConfigurationService
{
    public function __construct(private ExamPolicy $examPolicy)
    {
    }

    public function getAll(User $viewer)
    {
        if (!$viewer->hasRoleCode('ADMIN', 'TEACHER') && !$viewer->isCustomRole()) {
            return collect();
        }

        $query = ExamConfiguration::query()
            ->with('exam')
            ->whereHas('exam', function ($examQuery) use ($viewer) {
                $examQuery->where('is_deleted', false);
                if ($viewer->hasRoleCode('TEACHER')) {
                    $examQuery->where('creator_id', $viewer->id);
                }
            });

        return $query->get()
            ->filter(fn (ExamConfiguration $configuration) => $configuration->exam
                && $this->examPolicy->manage($viewer, $configuration->exam, 'view'))
            ->values();
    }

    public function getOne(ExamConfiguration $examConfiguration, User $viewer): ExamConfiguration
    {
        $examConfiguration->load('exam');
        $this->assertCanManageExam($examConfiguration->exam, $viewer, 'view');

        return $examConfiguration;
    }

    public function create(
        array $data,
        User $actor,
        string $action = 'create'
    ): ExamConfiguration
    {
        $actorId = (int) $actor->id;

        return DB::transaction(function () use ($data, $actorId, $action): ExamConfiguration {
            $actor = $this->lockActor($actorId);
            $exam = Exam::query()
                ->where('is_deleted', false)
                ->lockForUpdate()
                ->findOrFail($data['exam_id']);
            $this->assertCanManageExam($exam, $actor, $action);

            if (ExamConfiguration::query()->where('exam_id', $exam->id)->exists()) {
                throw new BusinessException('Đề thi đã được cấu hình', 409);
            }

            $this->assertNoAttempts((int) $exam->id);

            return ExamConfiguration::query()->create($data)->load('exam');
        });
    }

    public function update(
        ExamConfiguration $examConfiguration,
        array $data,
        User $actor
    ): ExamConfiguration
    {
        $actorId = (int) $actor->id;

        return DB::transaction(function () use ($examConfiguration, $data, $actorId): ExamConfiguration {
            $actor = $this->lockActor($actorId);
            $exam = Exam::query()->lockForUpdate()->findOrFail($examConfiguration->exam_id);
            $configuration = ExamConfiguration::query()
                ->lockForUpdate()
                ->findOrFail($examConfiguration->id);
            $this->assertCanManageExam($exam, $actor, 'update');

            $changes = Arr::except($data, ['exam_id']);
            $candidate = clone $configuration;
            $candidate->fill($changes);
            if ($candidate->isDirty()) {
                $this->assertNoAttempts((int) $exam->id);
            }

            $configuration->update($changes);

            return $configuration->load('exam');
        });
    }

    public function delete(ExamConfiguration $examConfiguration, User $actor): bool
    {
        $actorId = (int) $actor->id;

        return DB::transaction(function () use ($examConfiguration, $actorId): bool {
            $actor = $this->lockActor($actorId);
            $exam = Exam::query()->lockForUpdate()->findOrFail($examConfiguration->exam_id);
            $configuration = ExamConfiguration::query()
                ->lockForUpdate()
                ->findOrFail($examConfiguration->id);
            $this->assertCanManageExam($exam, $actor, 'delete');
            $this->assertNoAttempts((int) $exam->id);

            return (bool) $configuration->delete();
        });
    }

    public function findByExamId(int $examId): ?ExamConfiguration
    {
        return ExamConfiguration::where('exam_id', $examId)->first();
    }

    private function assertCanManageExam(?Exam $exam, User $actor, string $action): void
    {
        abort_unless(
            $exam
                && !$exam->is_deleted
                && $this->examPolicy->manage($actor, $exam, $action),
            403
        );
    }

    private function assertNoAttempts(int $examId): void
    {
        if (ExamAttempt::query()->where('exam_id', $examId)->exists()) {
            throw new BusinessException('Không thể thay đổi cấu hình đề sau khi đã có lượt thi', 409);
        }
    }

    private function lockActor(int $actorId): User
    {
        return User::query()
            ->with(['role', 'assignedSubjects'])
            ->lockForUpdate()
            ->findOrFail($actorId);
    }
}
