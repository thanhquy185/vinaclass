<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateNotificationRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules()
    {
        return [
            'title' => 'sometimes|string|max:200',
            'content' => 'sometimes|string',

            'sender_id' => 'sometimes|nullable|integer|exists:users,id',

            'sent_at' => 'sometimes|nullable|date',

            'priority' => ['sometimes', 'nullable', 'integer'],

            'status' => 'sometimes|nullable|boolean',

            'course_group_ids' => 'sometimes|array|min:1',
            'course_group_ids.*' => 'integer|exists:course_groups,id',
        ];
    }
}
