<?php

namespace App\Http\Resources;

use App\Models\User;
use Illuminate\Http\Resources\Json\JsonResource;

class NotificationResource extends JsonResource
{
    public function toArray($request): array
    {
        $data = $this->resource->toArray();

        if ($this->resource->relationLoaded('sender')) {
            $sender = $this->resource->sender;
            $data['sender'] = $sender instanceof User
                ? UserResource::serializeForViewer($sender, $request)
                : null;
        }

        return $data;
    }
}
