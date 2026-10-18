<?php

namespace App\Services;

use App\Models\CourseGroupNotification;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class NotificationService
{
    public function getAll()
    {
        return Notification::all()->load(["sender", "courseGroups.subject"]);
    }

    public function getOne(Notification $notification)
    {
        return $notification;
    }

    public function add(array $data)
    {
        return DB::transaction(function () use ($data) {
            $notification = Notification::create($data);

            $courseGroupIds = $data["course_group_ids"];
            $courseGroupNotifications = collect($courseGroupIds)->map(
                function ($courseGroupId) use ($notification) {
                    return ([
                        "course_group_id" => $courseGroupId,
                        "notification_id" => $notification->id,
                    ]);
                }
            )->toArray();

            $courseGroupNotification = CourseGroupNotification::insert($courseGroupNotifications);

            return ([
                "notification" => $notification,
                "courseGroupNotification" => $courseGroupNotifications
            ]);
        });
    }

    public function update(array $data, Notification $notification)
    {
        return DB::transaction(function () use ($data, $notification) {

            // 1. Update thông báo
            $notification->update($data);

            // 2. Xóa toàn bộ chi tiết thông báo cũ
            $notification->courseGroupNotifications()->delete();

            // 3. Thêm mới chi tiết thông báo
            if (!empty($data['course_group_ids'])) {
                $chiTietData = array_map(function ($courseGroupId) use ($notification) {
                    return [
                        'notification_id' => $notification->id,
                        'course_group_id' => $courseGroupId,
                    ];
                }, $data['course_group_ids']);

                $notification->courseGroupNotifications()->insert($chiTietData);
            }

            return $notification->load('courseGroupNotifications');
        });
    }

    public function delete(Notification $notification)
    {
        $notification->courseGroupNotifications()->delete();
        return $notification->delete();
    }
}
