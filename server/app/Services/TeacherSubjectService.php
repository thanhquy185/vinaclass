<?php

namespace App\Services;

use App\Exceptions\BusinessException;
use App\Models\Subject;
use App\Models\TeacherSubject;
use App\Models\User;
use App\Policies\TeacherSubjectPolicy;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class TeacherSubjectService
{
    public function __construct(
        private TeacherSubjectPolicy $teacherSubjectPolicy,
        private UserProfileService $userProfileService
    ) {
    }

    public function add(array $data, User $actor): TeacherSubject
    {
        $actorId = (int) $actor->id;

        return DB::transaction(function () use ($data, $actorId) {
            $teacherId = (int) $data['teacher_id'];
            $subjectId = (int) $data['subject_id'];
            $users = $this->lockUsers([$actorId, $teacherId]);
            $actor = $users->get($actorId);
            $teacher = $users->get($teacherId);
            abort_unless($actor && $teacher, 404);
            abort_unless($this->teacherSubjectPolicy->manage($actor, 'assign'), 403);
            $this->assertValidAssignment($teacher, [$subjectId]);

            if (TeacherSubject::query()
                ->where('teacher_id', $teacherId)
                ->where('subject_id', $subjectId)
                ->exists()) {
                throw new BusinessException('Giảng viên đã được phân công môn học này.', 409);
            }

            $assignment = TeacherSubject::create([
                'teacher_id' => $teacherId,
                'subject_id' => $subjectId,
            ])->load([
                'subject:id,subject_code,subject_name',
                'teacher:id,username,role_id',
                'teacher.role',
            ]);

            $this->userProfileService->loadPersonalProfiles($assignment->teacher);

            return $assignment;
        });
    }

    public function delete(int $teacherId, int $subjectId, User $actor): int
    {
        $actorId = (int) $actor->id;

        return DB::transaction(function () use ($teacherId, $subjectId, $actorId) {
            $users = $this->lockUsers([$actorId, $teacherId]);
            $actor = $users->get($actorId);
            abort_unless($actor && $users->has($teacherId), 404);
            abort_unless($this->teacherSubjectPolicy->manage($actor, 'delete'), 403);

            return TeacherSubject::query()
                ->where('teacher_id', $teacherId)
                ->where('subject_id', $subjectId)
                ->delete();
        });
    }

    public function syncAssignments(array $data, User $actor)
    {
        $actorId = (int) $actor->id;

        return DB::transaction(function () use ($data, $actorId) {
            $teacherId = (int) $data['teacher_id'];
            $subjectIds = array_map('intval', $data['subject_ids'] ?? []);
            $users = $this->lockUsers([$actorId, $teacherId]);
            $actor = $users->get($actorId);
            $teacher = $users->get($teacherId);
            abort_unless($actor && $teacher, 404);
            abort_unless($this->teacherSubjectPolicy->manage($actor, 'assign'), 403);
            $this->assertValidAssignment($teacher, $subjectIds);

            TeacherSubject::query()->where('teacher_id', $teacherId)->delete();

            $records = array_map(
                fn (int $subjectId) => [
                    'teacher_id' => $teacherId,
                    'subject_id' => $subjectId,
                ],
                $subjectIds
            );

            if ($records !== []) {
                TeacherSubject::query()->insert($records);
            }

            return $records;
        });
    }

    private function assertValidAssignment(User $teacher, array $subjectIds): void
    {
        if (!$teacher->hasRoleCode('TEACHER') || $teacher->is_locked || $teacher->is_deleted) {
            throw new BusinessException('Tài khoản được phân công không phải giảng viên đang hoạt động.', 422);
        }

        $subjectIds = array_map('intval', $subjectIds);
        if (count($subjectIds) !== count(array_unique($subjectIds))) {
            throw new BusinessException('Danh sách môn học không được trùng lặp.', 422);
        }

        if ($subjectIds === []) {
            return;
        }

        $activeSubjectIds = Subject::query()
            ->where('is_deleted', false)
            ->whereIn('id', $subjectIds)
            ->orderBy('id')
            ->lockForUpdate()
            ->pluck('id')
            ->map(fn ($id) => (int) $id)
            ->all();

        if (count($activeSubjectIds) !== count($subjectIds)) {
            throw new BusinessException('Danh sách học phần không hợp lệ hoặc đã ngừng hoạt động.', 422);
        }
    }

    private function lockUsers(array $userIds): Collection
    {
        $userIds = array_values(array_unique(array_map('intval', $userIds)));
        sort($userIds);

        return User::query()
            ->with('role')
            ->whereIn('id', $userIds)
            ->orderBy('id')
            ->lockForUpdate()
            ->get()
            ->keyBy('id');
    }
}
