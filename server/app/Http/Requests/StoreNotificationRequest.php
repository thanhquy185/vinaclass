<?php

namespace App\Http\Requests;

use App\Models\Notification;
use Illuminate\Foundation\Http\FormRequest;

class StoreNotificationRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize(): bool
    {
        $actor = $this->user();
        if (!$actor?->can('create', Notification::class)) {
            return false;
        }

        return !filter_var($this->input('status', true), FILTER_VALIDATE_BOOLEAN)
            || $actor->can('publish', Notification::class);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:200'],
            'content' => ['required', 'string'],

            'sent_at' => ['sometimes', 'nullable', 'date'],

            'priority' => ['sometimes', 'nullable', 'integer'],

            'status' => ['sometimes', 'boolean'],

            'course_group_ids' => ['required', 'array', 'min:1'],
            'course_group_ids.*' => ['integer', 'distinct', 'exists:course_groups,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'title.required' => ':attribute không được để trống',
            'title.string' => ':attribute phải là chuỗi ký tự',
            'title.max' => ':attribute không được vượt quá 200 ký tự',

            'content.required' => ':attribute không được để trống',
            'content.string' => ':attribute phải là chuỗi ký tự',

            'sent_at.date' => ':attribute không đúng định dạng ngày giờ',

            'priority.integer' => ':attribute phải là số nguyên',

            'status.boolean' => ':attribute phải là kiểu đúng/sai',

            'course_group_ids.required' => ':attribute không được để trống',
            'course_group_ids.array' => ':attribute phải là mảng',
            'course_group_ids.min' => ':attribute phải có ít nhất 1 phần tử',
            'course_group_ids.*.integer' => ':attribute phải là số nguyên',
            'course_group_ids.*.exists' => ':attribute không tồn tại trong hệ thống',
        ];
    }

    public function attributes()
    {
        return [
            'title' => 'Tiêu đề',
            'content' => 'Nội dung',
            'sent_at' => 'Thời gian gửi',
            'priority' => 'Mức độ ưu tiên',
            'status' => 'Trạng thái',
            'course_group_ids' => 'Danh sách nhóm học phần',
            'course_group_ids.*' => 'Mã nhóm học phần',
        ];
    }
}
