<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class TeacherAssignmentGroupResource extends JsonResource
{
    public function toArray($request): array
    {
        $teacher = $this->resource['teacher'];
        $teacherData = UserResource::make($teacher)->resolve($request);

        return [
            'teacher_id' => $teacher->id,
            'teacher' => array_intersect_key($teacherData, array_flip([
                'id',
                'username',
                'email',
                'profile',
                'teacher_profile',
            ])),
            'subjects' => collect($this->resource['subjects'])
                ->map(fn ($subject): array => [
                    'id' => $subject->id,
                    'subject_code' => $subject->subject_code,
                    'subject_name' => $subject->subject_name,
                ])
                ->values()
                ->all(),
        ];
    }
}
