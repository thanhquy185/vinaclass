<?php

namespace App\Http\Resources;

use App\Models\User;
use Illuminate\Http\Resources\Json\JsonResource;

class TeacherSubjectResource extends JsonResource
{
    public function toArray($request): array
    {
        $data = $this->resource->toArray();

        if ($this->resource->relationLoaded('teacher')) {
            $teacher = $this->resource->teacher;
            if ($teacher instanceof User) {
                $teacherData = UserResource::make($teacher)->resolve($request);
                $data['teacher'] = array_intersect_key($teacherData, array_flip([
                    'id',
                    'username',
                    'role_id',
                    'role_code',
                    'role',
                    'profile',
                    'teacher_profile',
                ]));
            }
        }

        return $data;
    }
}
