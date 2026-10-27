<?php

namespace App\Services;

use App\Exceptions\BusinessException;
use App\Models\CourseGroup;
use App\Models\CourseGroupNotification;
use App\Models\Notification;
use App\Models\User;
use App\Policies\NotificationPolicy;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

class NotificationService
{
    public function __construct(
        private NotificationPolicy $notificationPolicy
    ) {
    }

    public function add(array $data, User $actor)
    {
        $actorId = (int) $actor->id;

        return DB::transaction(function () use ($data, $actorId) {
            $actor = $this->lockActor($actorId);
            $groupIds = $data['course_group_ids'] ?? [];
            $this->lockCourseGroups($groupIds);

            if (!$this->notificationPolicy->create($actor)) {
                throw new BusinessException('Không có quyền tạo thông báo', 403);
            }

            $this->assertCanManageGroups($groupIds, 'create', $actor);
            $data['status'] = filter_var($data['status'] ?? true, FILTER_VALIDATE_BOOLEAN);
            if ($data['status']) {
                $this->assertCanPublish($actor);
            }

            $data['sender_id'] = $actor->id;
            $notification = Notification::create(Arr::except($data, ['course_group_ids']));
            $rows = collect($groupIds)->map(fn ($courseGroupId) => [
                'course_group_id' => $courseGroupId,
                'notification_id' => $notification->id,
            ])->all();

            if ($rows !== []) {
                CourseGroupNotification::insert($rows);
            }

            return [
                'notification' => $notification,
                'courseGroupNotification' => $rows,
            ];
        });
    }

    public function update(array $data, Notification $notification, User $actor)
    {
        $notificationId = (int) $notification->id;
        $actorId = (int) $actor->id;

        return DB::transaction(function () use ($data, $notificationId, $actorId) {
            $actor = $this->lockActor($actorId);
            $notification = Notification::query()
                ->lockForUpdate()
                ->findOrFail($notificationId);
            $attachedGroupIds = $notification->courseGroupNotifications()
                ->pluck('course_group_id')
                ->map(fn ($id) => (int) $id)
                ->all();
            $groupIds = array_merge(
                $attachedGroupIds,
                $data['course_group_ids'] ?? []
            );
            $this->lockCourseGroups($groupIds);

            if (!$this->notificationPolicy->update($actor, $notification, $data)) {
                throw new BusinessException('Không có quyền quản lý thông báo này', 403);
            }

            if (isset($data['course_group_ids'])) {
                $this->assertCanManageGroups($data['course_group_ids'], 'update', $actor);
            }

            $notification->update(Arr::except($data, ['course_group_ids', 'sender_id']));

            if (array_key_exists('course_group_ids', $data)) {
                $notification->courseGroupNotifications()->delete();
                $rows = array_map(fn ($courseGroupId) => [
                    'notification_id' => $notification->id,
                    'course_group_id' => $courseGroupId,
                ], $data['course_group_ids']);

                if ($rows !== []) {
                    $notification->courseGroupNotifications()->insert($rows);
                }
            }

            return $notification->load('courseGroupNotifications');
        });
    }

    public function delete(Notification $notification, User $actor)
    {
        $notificationId = (int) $notification->id;
        $actorId = (int) $actor->id;

        return DB::transaction(function () use ($notificationId, $actorId): bool {
            $actor = $this->lockActor($actorId);
            $notification = Notification::query()
                ->lockForUpdate()
                ->findOrFail($notificationId);
            $groupIds = $notification->courseGroupNotifications()
                ->pluck('course_group_id')
                ->map(fn ($id) => (int) $id)
                ->all();
            $this->lockCourseGroups($groupIds);
            $this->assertCanManageNotification($notification, 'delete', $actor);

            $notification->courseGroupNotifications()->delete();

            return (bool) $notification->delete();
        });
    }

    public function removeFromCourseGroup(
        Notification $notification,
        int $courseGroupId,
        User $actor
    ): bool {
        $notificationId = (int) $notification->id;
        $actorId = (int) $actor->id;

        return DB::transaction(function () use ($notificationId, $courseGroupId, $actorId): bool {
            $actor = $this->lockActor($actorId);
            $notification = Notification::query()
                ->lockForUpdate()
                ->findOrFail($notificationId);
            $group = CourseGroup::query()
                ->whereKey($courseGroupId)
                ->where('is_deleted', false)
                ->lockForUpdate()
                ->firstOrFail();
            $this->assertCanManageNotification($notification, 'update', $actor);

            $attached = $notification->courseGroupNotifications()
                ->where('course_group_id', $group->id)
                ->exists();

            if (!$attached) {
                return false;
            }

            return (bool) $notification->courseGroupNotifications()
                ->where('course_group_id', $group->id)
                ->delete();
        });
    }

    private function assertCanPublish(User $user): void
    {
        if (!$this->notificationPolicy->publish($user)) {
            throw new BusinessException('Không có quyền phát hành thông báo', 403);
        }
    }

    private function assertCanManageGroups(array $groupIds, string $action, User $user): void
    {
        if (!$this->notificationPolicy->manageGroups($user, $groupIds, $action)) {
            $message = $user->hasRoleCode('TEACHER')
                ? 'Chỉ được quản lý thông báo trong lớp mình phụ trách'
                : 'Danh sách lớp không hợp lệ hoặc tài khoản không đủ quyền';
            throw new BusinessException($message, 403);
        }
    }

    private function assertCanManageNotification(
        Notification $notification,
        string $action,
        User $user
    ): void
    {
        if (!$this->notificationPolicy->manage($user, $notification, $action)) {
            throw new BusinessException('Không có quyền quản lý thông báo này', 403);
        }
    }

    private function lockActor(int $actorId): User
    {
        return User::query()
            ->with('role')
            ->lockForUpdate()
            ->findOrFail($actorId);
    }

    private function lockCourseGroups(array $groupIds): void
    {
        $groupIds = array_values(array_unique(array_map('intval', $groupIds)));
        sort($groupIds);

        if ($groupIds === []) {
            return;
        }

        CourseGroup::query()
            ->whereIn('id', $groupIds)
            ->orderBy('id')
            ->lockForUpdate()
            ->get(['id']);
    }
}
