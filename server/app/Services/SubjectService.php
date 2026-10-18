<?php

namespace App\Services;

use App\Models\Subject;
use App\Models\User;

class SubjectService
{
    public function getAll()
    {
        return Subject::all()->load("chapters");
    }

    public function getOne(Subject $subject)
    {
        return $subject;
    }

    public function add(array $data)
    {
        return Subject::create($data);
    }

    public function update(array $data, Subject $subject)
    {
        $subject->update($data);
        return $subject;
    }

    public function delete(Subject $subject)
    {
        return $subject->delete();
    }

    public function getWithCourseGroups()
    {
        $subjects = Subject::all();
        $subjects->load(['courseGroups', 'chapters']);
        return $subjects;
    }

    public function getWithChapters()
    {
        $subject = Subject::all();
        $subject->load('chapters');
        return $subject;
    }

    public function getOfTeacher(User $user)
    {
        // Get IDs of course groups managed by the teacher
        $courseGroupIds = $user->managedCourseGroups->pluck('id');

        $data = $user->assignedSubjects()->with([
            'courseGroups' => function ($query) use ($courseGroupIds) {
                $query->whereIn('id', $courseGroupIds);
            }
        ])->get();

        return $data->load('chapters');
    }
}
