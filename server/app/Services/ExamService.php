<?php

namespace App\Services;

use App\Exceptions\BusinessException;
use App\Models\Exam;
use App\Models\ExamAttempt;
use App\Models\User;
use App\Policies\ExamPolicy;
use Illuminate\Support\Facades\DB;

class ExamService
{
    private ExamCreationService $examCreationService;
    private ExamPolicy $examPolicy;

    public function __construct(
        ExamCreationService $examCreationService,
        ExamPolicy $examPolicy
    ) {
        $this->examCreationService = $examCreationService;
        $this->examPolicy = $examPolicy;
    }

    public function add(array $data, User $creator)
    {
        return $this->examCreationService->add($data, $creator);
    }

    public function generateByFilter(array $data, User $creator)
    {
        return $this->examCreationService->generateByFilter($data, $creator);
    }

    public function delete(Exam $exam, User $actor)
    {
        $examId = (int) $exam->id;
        $actorId = (int) $actor->id;

        return DB::transaction(function () use ($examId, $actorId): bool {
            $actor = User::query()
                ->with(['role', 'assignedSubjects'])
                ->lockForUpdate()
                ->findOrFail($actorId);
            // Lock the actor first to match exam creation, updates, and attempt starts.
            $lockedExam = Exam::query()->lockForUpdate()->findOrFail($examId);
            $this->assertCanManage($lockedExam, $actor, 'delete');

            if (ExamAttempt::query()->where('exam_id', $lockedExam->id)->exists()) {
                throw new BusinessException(
                    'Không thể xóa đề thi đã có lượt làm bài để bảo toàn lịch sử và kết quả',
                    409
                );
            }

            return (bool) $lockedExam->update(['is_deleted' => true]);
        });
    }

    public function assertCanManage(Exam $exam, User $actor, string $action = 'update'): void
    {
        if ($exam->is_deleted) {
            abort(404);
        }

        abort_unless($this->examPolicy->manage($actor, $exam, $action), 403);
    }

}
