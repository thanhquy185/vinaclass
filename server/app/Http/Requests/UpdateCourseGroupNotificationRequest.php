<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCourseGroupNotificationRequest extends FormRequest
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
            'course_group_id' => [
                'sometimes',
                'required',
                'integer',
                'exists:course_groups,id',
                Rule::unique('course_group_notifications')->where(function ($query) {
                    $current = $this->route('courseGroupNotification');

                    $query->where('notification_id', $this->input('notification_id'));

                    if (is_object($current)) {
                        $query->where(function ($currentPair) use ($current) {
                            $currentPair
                                ->where('course_group_id', '!=', $current->course_group_id)
                                ->orWhere('notification_id', '!=', $current->notification_id);
                        });
                    }
                }),
            ],
            'notification_id' => [
                'sometimes',
                'required',
                'integer',
                'exists:notifications,id',
            ],
        ];
    }

    public function messages()
    {
        return [
            'course_group_id.required' => 'Vui lòng chọn nhóm học phần.',
            'course_group_id.integer' => 'Mã nhóm học phần không hợp lệ.',
            'course_group_id.exists' => 'Nhóm học phần không tồn tại.',
            'course_group_id.unique' => 'Thông báo đã được liên kết với nhóm học phần này.',
            'notification_id.required' => 'Vui lòng chọn thông báo.',
            'notification_id.integer' => 'Mã thông báo không hợp lệ.',
            'notification_id.exists' => 'Thông báo không tồn tại.',
        ];
    }

    public function attributes()
    {
        return [
            'course_group_id' => 'Nhóm học phần',
            'notification_id' => 'Thông báo',
        ];
    }
}
