<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTeacherSubjectRequest extends FormRequest
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
            'teacher_id' => [
                'required',
                'integer',
                'exists:users,id',
            ],
            'subject_id' => [
                'required',
                'integer',
                'exists:subjects,id',
                Rule::unique('teacher_subjects')
                    ->where(function ($query) {
                        return $query->where('teacher_id', $this->teacher_id);
                    }),
            ],
        ];
    }

    public function messages()
    {
        return [
            'teacher_id.required' => ':attribute không được để trống',
            'teacher_id.integer' => ':attribute phải là số nguyên',
            'teacher_id.exists' => ':attribute không tồn tại trong hệ thống',

            'subject_id.required' => ':attribute không được để trống',
            'subject_id.integer' => ':attribute phải là số nguyên',
            'subject_id.exists' => ':attribute không tồn tại trong hệ thống',
            'subject_id.unique' => 'Giảng viên đã được phân công môn học này',
        ];
    }

    public function attributes()
    {
        return [
            'teacher_id' => 'Mã giảng viên',
            'subject_id' => 'Mã môn học',
        ];
    }
}
