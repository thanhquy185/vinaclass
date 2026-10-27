<?php

namespace App\Http\Resources;

use App\Models\User;
use App\Services\UserProfileService;
use Illuminate\Http\Resources\Json\JsonResource;

class CourseGroupMaterialResource extends JsonResource
{
    public function toArray($request): array
    {
        $creator = $this->resource->relationLoaded('creator')
            ? $this->resource->getRelation('creator')
            : null;
        $creatorName = $creator instanceof User
            ? app(UserProfileService::class)->personalValue($creator, 'full_name')
            : null;

        return [
            'id' => $this->id,
            'course_group_id' => $this->course_group_id,
            'title' => $this->title,
            'description' => $this->description,
            'file_name' => $this->original_file_name,
            'mime_type' => $this->mime_type,
            'file_size' => $this->file_size,
            'creator_id' => $this->creator_id,
            'creator_name' => $creatorName,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
