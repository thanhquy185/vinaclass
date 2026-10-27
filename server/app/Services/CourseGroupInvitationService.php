<?php

namespace App\Services;

use App\Exceptions\BusinessException;
use App\Models\CourseGroup;
use App\Models\CourseGroupStudent;
use App\Models\User;
use App\Policies\CourseGroupPolicy;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CourseGroupInvitationService
{
    public function __construct(private CourseGroupPolicy $courseGroupPolicy)
    {
    }

    public function joinGroup(array $data, User $authenticatedStudent)
    {
        $studentId = (int) $authenticatedStudent->id;
        $joinCode = trim((string) $data['join_code']);
        $courseGroupId = CourseGroup::query()
            ->where('join_code', $joinCode)
            ->where('is_deleted', false)
            ->value('id');

        if (!$courseGroupId) {
            throw ValidationException::withMessages([
                'join_code' => ['Mã tham gia không tồn tại.'],
            ]);
        }

        return DB::transaction(function () use ($studentId, $joinCode, $courseGroupId) {
            $student = User::query()
                ->with('role')
                ->lockForUpdate()
                ->findOrFail($studentId);

            $courseGroup = CourseGroup::query()
                ->whereKey($courseGroupId)
                ->where('join_code', $joinCode)
                ->where('is_deleted', false)
                ->lockForUpdate()
                ->first();

            if (!$courseGroup) {
                throw ValidationException::withMessages([
                    'join_code' => ['Mã tham gia không tồn tại.'],
                ]);
            }

            if (!$this->courseGroupPolicy->join($student)) {
                throw new BusinessException('Chỉ sinh viên đang hoạt động mới được tham gia lớp', 403);
            }

            $alreadyJoined = CourseGroupStudent::query()
                ->where('student_id', $student->id)
                ->where('course_group_id', $courseGroup->id)
                ->exists();

            if ($alreadyJoined) {
                throw ValidationException::withMessages([
                    'student_id' => ['Sinh viên đã tham gia lớp học này.'],
                ]);
            }

            return CourseGroupStudent::query()->create([
                'student_id' => $student->id,
                'course_group_id' => $courseGroup->id,
            ]);
        });
    }

    public function resetInviteCode(CourseGroup $courseGroup, User $actor): CourseGroup
    {
        $courseGroupId = (int) $courseGroup->id;
        $actorId = (int) $actor->id;

        return DB::transaction(function () use ($courseGroupId, $actorId): CourseGroup {
            $actor = User::query()
                ->with('role')
                ->lockForUpdate()
                ->findOrFail($actorId);
            $courseGroup = CourseGroup::query()->lockForUpdate()->findOrFail($courseGroupId);
            $this->assertCanManage($courseGroup, $actor, 'update');
            $courseGroup->update(['join_code' => $this->generateUniqueInviteCode()]);

            return $courseGroup;
        });
    }

    public function generateUniqueInviteCode(int $length = 8): string
    {
        $characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        $maxIndex = strlen($characters) - 1;

        do {
            $code = '';
            for ($i = 0; $i < $length; $i++) {
                $code .= $characters[random_int(0, $maxIndex)];
            }
        } while (CourseGroup::query()->where('join_code', $code)->exists());

        return $code;
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
}
