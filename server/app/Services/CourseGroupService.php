<?php

namespace App\Services;

use App\Exceptions\BusinessException;
use App\Models\CourseGroup;
use App\Models\Subject;
use App\Models\User;
use App\Policies\CourseGroupPolicy;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class CourseGroupService
{
    public function __construct(
        private CourseGroupPolicy $courseGroupPolicy,
        private CourseGroupInvitationService $invitationService
    ) {
    }

    public function add(array $data, User $actor): CourseGroup
    {
        $actorId = (int) $actor->id;
        $requestedTeacherId = (int) ($data['teacher_id'] ?? $actorId);

        return DB::transaction(function () use ($data, $actorId, $requestedTeacherId): CourseGroup {
            $users = $this->lockUsers([$actorId, $requestedTeacherId]);
            $actor = $users->get($actorId);
            $teacherId = $actor && $actor->hasRoleCode('TEACHER')
                ? $actorId
                : $requestedTeacherId;
            $teacher = $users->get($teacherId);
            abort_unless($actor && $teacher, 404);

            if (!$this->courseGroupPolicy->create($actor)) {
                throw new BusinessException('Không có quyền tạo nhóm học phần', 403);
            }

            $data['teacher_id'] = $teacherId;
            $subject = Subject::query()
                ->where('is_deleted', false)
                ->lockForUpdate()
                ->findOrFail($data['subject_id']);

            if ($teacher->is_locked || $teacher->is_deleted || !$teacher->hasRoleCode('TEACHER')) {
                throw new BusinessException('Tài khoản được phân công không phải giảng viên đang hoạt động', 422);
            }
            if (!$teacher->assignedSubjects()->whereKey($subject->id)->exists()) {
                throw new BusinessException('Giảng viên chưa được phân công học phần này', 422);
            }

            // Generate an invite code when one is not supplied.
            if (empty($data['join_code'])) {
                $data['join_code'] = $this->invitationService->generateUniqueInviteCode();
            }

            return CourseGroup::query()->create($data);
        });
    }

    public function update(array $data, CourseGroup $courseGroup, User $actor): CourseGroup
    {
        $courseGroupId = (int) $courseGroup->id;
        $actorId = (int) $actor->id;
        $snapshot = CourseGroup::query()->findOrFail($courseGroupId);
        $snapshotTeacherId = (int) $snapshot->teacher_id;
        $snapshotSubjectId = (int) $snapshot->subject_id;
        $relationshipChange = isset($data['teacher_id']) || isset($data['subject_id']);
        $teacherIdToLock = isset($data['teacher_id'])
            ? (int) $data['teacher_id']
            : $snapshotTeacherId;
        $subjectIdToLock = isset($data['subject_id'])
            ? (int) $data['subject_id']
            : $snapshotSubjectId;

        return DB::transaction(function () use (
            $data,
            $courseGroupId,
            $actorId,
            $snapshotTeacherId,
            $snapshotSubjectId,
            $relationshipChange,
            $teacherIdToLock,
            $subjectIdToLock
        ): CourseGroup {
            $userIds = [$actorId];
            if ($relationshipChange) {
                $userIds[] = $teacherIdToLock;
            }
            $users = $this->lockUsers($userIds);
            $actor = $users->get($actorId);
            abort_unless($actor, 404);

            $subject = null;
            if ($relationshipChange) {
                $subject = Subject::query()
                    ->where('is_deleted', false)
                    ->lockForUpdate()
                    ->findOrFail($subjectIdToLock);
            }

            $courseGroup = CourseGroup::query()->lockForUpdate()->findOrFail($courseGroupId);
            $this->assertCanManage($courseGroup, $actor, 'update');

            if ($relationshipChange) {
                if (!isset($data['teacher_id']) && (int) $courseGroup->teacher_id !== $snapshotTeacherId) {
                    throw new BusinessException('Lớp học vừa được cập nhật. Vui lòng tải lại rồi thử lại.', 409);
                }
                if (!isset($data['subject_id']) && (int) $courseGroup->subject_id !== $snapshotSubjectId) {
                    throw new BusinessException('Lớp học vừa được cập nhật. Vui lòng tải lại rồi thử lại.', 409);
                }
            }

            if ($actor->hasRoleCode('TEACHER')) {
                $subjectId = (int) ($data['subject_id'] ?? $courseGroup->subject_id);

                if (!$actor->assignedSubjects()->whereKey($subjectId)->exists()) {
                    throw new BusinessException('Giảng viên chưa được phân công học phần này', 403);
                }
                unset($data['teacher_id']);
            } elseif (isset($data['teacher_id']) || isset($data['subject_id'])) {
                $teacherId = (int) ($data['teacher_id'] ?? $courseGroup->teacher_id);
                $subjectId = (int) ($data['subject_id'] ?? $courseGroup->subject_id);
                $teacher = $users->get($teacherId);
                abort_unless($teacher && $subject && (int) $subject->id === $subjectId, 404);

                if ($teacher->is_locked || $teacher->is_deleted || !$teacher->hasRoleCode('TEACHER')) {
                    throw new BusinessException('Tài khoản được phân công không phải giảng viên đang hoạt động', 422);
                }
                if (!$teacher->assignedSubjects()->whereKey($subjectId)->exists()) {
                    throw new BusinessException('Giảng viên chưa được phân công học phần này', 422);
                }
            }

            $courseGroup->update($data);

            return $courseGroup;
        });
    }

    public function delete(CourseGroup $courseGroup, User $actor): bool
    {
        $courseGroupId = (int) $courseGroup->id;
        $actorId = (int) $actor->id;

        return DB::transaction(function () use ($courseGroupId, $actorId): bool {
            $actor = $this->lockActor($actorId);
            $courseGroup = CourseGroup::query()->lockForUpdate()->findOrFail($courseGroupId);
            $this->assertCanManage($courseGroup, $actor, 'delete');
            $courseGroup->update(['is_deleted' => true]);

            return true;
        });
    }

    public function hide(CourseGroup $courseGroup, User $actor): CourseGroup
    {
        $courseGroupId = (int) $courseGroup->id;
        $actorId = (int) $actor->id;

        return DB::transaction(function () use ($courseGroupId, $actorId): CourseGroup {
            $actor = $this->lockActor($actorId);
            $courseGroup = CourseGroup::query()->lockForUpdate()->findOrFail($courseGroupId);
            $this->assertCanManage($courseGroup, $actor, 'update');
            $courseGroup->update(['is_hidden' => true]);

            return $courseGroup;
        });
    }

    public function assertCanManage(
        CourseGroup $courseGroup,
        User $actor,
        string $action = 'update'
    ): void
    {
        if (!$this->courseGroupPolicy->manage($actor, $courseGroup, $action)) {
            throw new BusinessException('Không có quyền quản lý nhóm học phần này', 403);
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
