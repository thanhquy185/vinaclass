<?php

namespace App\Services;

use App\Models\TeacherSubject;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class TeacherSubjectService
{
    public function getAll()
    {
        return TeacherSubject::all()->load(['subject', 'teacher']);
    }

    public function add(array $data)
    {
        return TeacherSubject::create($data)->load(['subject', 'teacher']);
    }

    public function delete(int $teacherId, int $subjectId): int
    {
        return TeacherSubject::where('teacher_id', $teacherId)
            ->where('subject_id', $subjectId)
            ->delete();
    }

    public function getOfTeacher(User $user)
    {
        $user->load('assignedSubjects');
        return $user->assignedSubjects;
    }

    public function syncAssignments(array $data)
    {
        return DB::transaction(function () use ($data) {
            $teacherId = $data['teacher_id'];
            $subjectIds = $data['subject_ids'] ?? [];

            // Xóa tất cả phân công cũ của giảng viên
            TeacherSubject::where('teacher_id', $teacherId)->delete();

            $records = [];
            foreach ($subjectIds as $subjectId) {
                $records[] = [
                    'teacher_id' => $teacherId,
                    'subject_id' => $subjectId,
                ];
            }

            if (!empty($records)) {
                TeacherSubject::insert($records);
            }

            return $records;
        });
    }
}
