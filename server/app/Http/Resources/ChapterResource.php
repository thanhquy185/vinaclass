<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ChapterResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array|\Illuminate\Contracts\Support\Arrayable|\JsonSerializable
     */
    public function toArray($request)
    {
        return [
            'id'        => $this->id,
            'chapter_name' => $this->chapter_name,
            'subject_id'  => $this->subject_id,
            'subject'    => new SubjectResource($this->whenLoaded('subject')),
            'is_deleted' => $this->is_deleted,
        ];
    }
}
