<?php

namespace App\Http\Requests;

use App\Models\CourseGroup;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCourseGroupRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize(): bool
    {
        return $this->user()?->can('create', CourseGroup::class) ?? false;
    }

    public function rules(): array
    {
        return [
            'subject_id' => [
                'required',
                'integer',
                Rule::exists('subjects', 'id')->where('is_deleted', false),
            ],
            'group_name' => ['required', 'string', 'max:100'],
            'notes' => ['nullable', 'string'],
            'semester' => ['required', 'integer', 'min:1', 'max:3'],
            'academic_year' => ['required', 'integer', 'min:2000'],
            'background_url' => ['sometimes', 'nullable', 'string'],
            'teacher_id' => $this->user()?->hasRoleCode('TEACHER')
                ? ['sometimes', 'nullable', 'integer', 'exists:users,id']
                : ['required', 'integer', 'exists:users,id'],
            'is_hidden' => ['sometimes', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'subject_id.required' => ':attribute không được để trống',
            'subject_id.integer' => ':attribute phải là số nguyên',
            'subject_id.exists' => ':attribute không tồn tại trong hệ thống',

            'group_name.required' => ':attribute không được để trống',
            'group_name.string' => ':attribute phải là chuỗi ký tự',
            'group_name.max' => ':attribute không được vượt quá 100 ký tự',

            'notes.string' => ':attribute phải là chuỗi ký tự',

            'semester.required' => ':attribute không được để trống',
            'semester.integer' => ':attribute phải là số nguyên',
            'semester.min' => ':attribute phải từ 1 đến 3',
            'semester.max' => ':attribute phải từ 1 đến 3',

            'academic_year.required' => ':attribute không được để trống',
            'academic_year.integer' => ':attribute phải là số nguyên',
            'academic_year.min' => ':attribute phải từ năm 2000 trở lên',

            'background_url.string' => ':attribute phải là chuỗi ký tự',

            'teacher_id.required' => ':attribute không được để trống',
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
