<?php

namespace App\Http\Requests;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;

class UpdateNotificationRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize(): bool
    {
        $actor = $this->user();
        $notification = $this->route('notification');
        $changes = $this->only([
            'title',
            'content',
            'sent_at',
            'priority',
            'status',
            'course_group_ids',
        ]);

        return $actor instanceof User
            && $notification instanceof Notification
            && $actor->can('update', [$notification, $changes]);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'title' => 'sometimes|string|max:200',
            'content' => 'sometimes|string',

            'sent_at' => 'sometimes|nullable|date',

            'priority' => ['sometimes', 'nullable', 'integer'],

            'status' => 'sometimes|boolean',

            'course_group_ids' => 'sometimes|array|min:1',
            'course_group_ids.*' => 'integer|distinct|exists:course_groups,id',
        ];
    }
}
