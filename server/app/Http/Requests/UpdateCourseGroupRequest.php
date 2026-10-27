<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;

class UpdateCourseGroupRequest extends CourseGroupScopedRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'subject_id' => [
                'sometimes',
                'integer',
                Rule::exists('subjects', 'id')->where('is_deleted', false),
            ],
            'group_name' => ['sometimes', 'string', 'max:100'],
            'join_code' => [
                'sometimes',
                'string',
                'max:20',
                Rule::unique('course_groups', 'join_code')->ignore($this->route('courseGroup'))
            ],
            'notes' => ['sometimes', 'nullable', 'string'],
            'semester' => ['sometimes', 'integer', 'min:1', 'max:3'],
            'academic_year' => ['sometimes', 'integer', 'min:2000'],
            'background_url' => ['sometimes', 'nullable', 'string'],
            'teacher_id' => ['sometimes', 'integer', 'exists:users,id'],
            'is_hidden' => ['sometimes', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'subject_id.integer' => ':attribute phải là số nguyên',
            'subject_id.exists' => ':attribute không tồn tại trong hệ thống',

            'group_name.string' => ':attribute phải là chuỗi ký tự',
            'group_name.max' => ':attribute không được vượt quá 100 ký tự',

            'join_code.string' => ':attribute phải là chuỗi ký tự',
            'join_code.max' => ':attribute không được vượt quá 20 ký tự',
            'join_code.unique' => ':attribute đã tồn tại',

            'notes.string' => ':attribute phải là chuỗi ký tự',

            'semester.integer' => ':attribute phải là số nguyên',
            'semester.min' => ':attribute phải từ 1 đến 3',
            'semester.max' => ':attribute phải từ 1 đến 3',

            'academic_year.integer' => ':attribute phải là số nguyên',
            'academic_year.min' => ':attribute phải từ năm 2000 trở lên',

            'background_url.string' => ':attribute phải là chuỗi ký tự',

            'teacher_id.integer' => ':attribute phải là số nguyên',
            'teacher_id.exists' => ':attribute không tồn tại trong hệ thống',

            'is_hidden.boolean' => ':attribute phải là kiểu đúng/sai',
        ];
    }

    public function attributes(): array
    {
        return [
            'subject_id' => 'Mã môn học',
            'group_name' => 'Tên nhóm',
            'join_code' => 'Mã mời',
            'notes' => 'Ghi chú',
            'semester' => 'Học kỳ',
            'academic_year' => 'Năm học',
            'background_url' => 'URL ảnh nền',
            'teacher_id' => 'Mã giảng viên',
            'is_hidden' => 'Trạng thái ẩn',
        ];
    }
}
