<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTeacherSubjectsRequest extends FormRequest
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
            'teacher_id' => ['required', 'integer', 'exists:users,id'],
            'subject_ids' => ['required', 'array', 'min:1'],
            'subject_ids.*' => ['required', 'integer', 'distinct', 'exists:subjects,id'],
        ];
    }

    public function messages()
    {
        return [
            'teacher_id.required' => 'Vui lòng chọn giảng viên.',
            'teacher_id.integer' => 'Mã giảng viên không hợp lệ.',
            'teacher_id.exists' => 'Giảng viên không tồn tại.',
            'subject_ids.required' => 'Vui lòng chọn ít nhất một môn học.',
            'subject_ids.array' => 'Danh sách môn học phải là một mảng.',
            'subject_ids.min' => 'Danh sách môn học phải có ít nhất một môn.',
            'subject_ids.*.required' => 'Mã môn học không được để trống.',
            'subject_ids.*.integer' => 'Mã môn học phải là số nguyên.',
            'subject_ids.*.distinct' => 'Danh sách môn học không được trùng lặp.',
            'subject_ids.*.exists' => 'Môn học không tồn tại.',
        ];
    }

    public function attributes()
    {
        return [
            'teacher_id' => 'Giảng viên',
            'subject_ids' => 'Danh sách môn học',
            'subject_ids.*' => 'Mã môn học',
        ];
    }
}
