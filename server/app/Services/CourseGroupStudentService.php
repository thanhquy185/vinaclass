<?php

namespace App\Services;

use App\Models\CourseGroupStudent;

class CourseGroupStudentService
{
    public function getAll()
    {
        return CourseGroupStudent::all();
    }

    public function getOne(CourseGroupStudent $courseGroupStudent)
    {
        return $courseGroupStudent;
    }

    public function add(array $data)
    {
        return CourseGroupStudent::create($data);
    }

    public function update(array $data, CourseGroupStudent $courseGroupStudent)
    {
        $courseGroupStudent->update($data);
        return $courseGroupStudent;
    }

    public function delete(CourseGroupStudent $courseGroupStudent)
    {
        return $courseGroupStudent->delete();
    }
}