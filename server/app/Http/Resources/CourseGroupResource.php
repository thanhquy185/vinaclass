<?php

namespace App\Http\Resources;

use App\Models\User;
use Illuminate\Http\Resources\Json\JsonResource;

class CourseGroupResource extends JsonResource
{
    public function toArray($request): array
    {
        $data = $this->resource->toArray();

        if ($this->resource->relationLoaded('teacher')) {
            $teacher = $this->resource->teacher;
            $data['teacher'] = $teacher instanceof User
                ? UserResource::serializeForViewer($teacher, $request)
                : null;
        }

        if ($this->resource->relationLoaded('students')) {
            $data['students'] = $this->resource->students
                ->map(fn (User $student) => UserResource::serializeForViewer($student, $request))
                ->values()
                ->all();
        }

        if ($this->resource->relationLoaded('notifications')) {
            $data['notifications'] = NotificationResource::collection(
                $this->resource->notifications
            )->resolve($request);
        }

        return $data;
    }
}
