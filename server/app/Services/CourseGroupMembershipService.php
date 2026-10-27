<?php

namespace App\Services;

use App\Exceptions\BusinessException;
use App\Exceptions\NotFoundException;
use App\Models\CourseGroup;
use App\Models\CourseGroupStudent;
use App\Models\User;
use App\Policies\CourseGroupPolicy;
use Illuminate\Support\Facades\DB;

class CourseGroupMembershipService
{
    public function __construct(private CourseGroupPolicy $courseGroupPolicy)
    {
    }

    public function addStudentToGroup(
        string $username,
        CourseGroup $courseGroup,
        User $actor
    ): CourseGroupStudent {
        $courseGroupId = (int) $courseGroup->id;
        $actorId = (int) $actor->id;

        return DB::transaction(function () use ($username, $courseGroupId, $actorId): CourseGroupStudent {
            $studentId = User::query()->where('username', $username)->value('id');
            if (!$studentId) {
                throw new NotFoundException('Không tìm thấy tài khoản người dùng.');
            }

            [$actor, $student] = $this->lockUsers($actorId, (int) $studentId);
            if (!$student || $student->username !== $username) {
                throw new NotFoundException('Không tìm thấy tài khoản người dùng.');
            }

            $courseGroup = CourseGroup::query()->lockForUpdate()->findOrFail($courseGroupId);
            $this->assertCanManage($courseGroup, $actor, 'update');

            if (!$student->hasRoleCode('STUDENT') || $student->is_locked || $student->is_deleted) {
                throw new BusinessException('Tài khoản này không phải sinh viên đang hoạt động.');
            }

            $alreadyJoined = CourseGroupStudent::query()
                ->where('student_id', $student->id)
                ->where('course_group_id', $courseGroup->id)
                ->exists();

            if ($alreadyJoined) {
                throw new BusinessException('Sinh viên đã có trong lớp học này.');
            }

            return CourseGroupStudent::query()->create([
                'student_id' => $student->id,
                'course_group_id' => $courseGroup->id,
            ]);
        });
    }

    public function removeStudentFromGroup(
        int $studentId,
        CourseGroup $courseGroup,
        User $actor
    ): bool {
        $courseGroupId = (int) $courseGroup->id;
        $actorId = (int) $actor->id;

        return DB::transaction(function () use ($studentId, $courseGroupId, $actorId): bool {
            [$actor] = $this->lockUsers($actorId, $studentId);
            $courseGroup = CourseGroup::query()->lockForUpdate()->findOrFail($courseGroupId);
            $this->assertCanManage($courseGroup, $actor, 'update');

            $deleted = CourseGroupStudent::query()
                ->where('student_id', $studentId)
                ->where('course_group_id', $courseGroup->id)
                ->delete();

            if ($deleted === 0) {
                throw new NotFoundException('Sinh viên không có trong lớp học này.');
            }

            return true;
        });
    }

    private function assertCanManage(
        CourseGroup $courseGroup,
        User $actor,
        string $action
    ): void {
        if (!$this->courseGroupPolicy->manage($actor, $courseGroup, $action)) {
            throw new BusinessException('Không có quyền quản lý nhóm học phần này', 403);
        }
    }

    /**
     * @return array{0: User, 1: ?User}
     */
    private function lockUsers(int $actorId, ?int $studentId = null): array
    {
        $userIds = array_values(array_unique(array_filter([$actorId, $studentId])));
        sort($userIds);

        $users = [];
        foreach ($userIds as $userId) {
            $user = User::query()
                ->with('role')
                ->lockForUpdate()
                ->find($userId);

            if ($userId === $actorId && !$user) {
                throw new NotFoundException('Không tìm thấy tài khoản người dùng.');
            }

            $users[$userId] = $user;
        }

        return [
            $users[$actorId],
            $studentId === null ? null : ($users[$studentId] ?? null),
        ];
    }
}
