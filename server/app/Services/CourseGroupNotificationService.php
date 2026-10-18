<?php

namespace App\Services;

use App\Models\CourseGroupNotification;

class CourseGroupNotificationService
{
    public function getAll()
    {
        return CourseGroupNotification::all();
    }

    public function getOne(CourseGroupNotification $courseGroupNotification)
    {
        return $courseGroupNotification;
    }

    public function add(array $data)
    {
        return CourseGroupNotification::create($data);
    }

    public function update(array $data, CourseGroupNotification $courseGroupNotification)
    {
        $courseGroupNotification->update($data);
        return $courseGroupNotification;
    }

    public function delete(CourseGroupNotification $courseGroupNotification)
    {
        return $courseGroupNotification->delete();
    }
}