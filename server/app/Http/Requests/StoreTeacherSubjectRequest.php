<?php

namespace App\Http\Requests;

use App\Models\User;
use App\Policies\TeacherSubjectPolicy;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTeacherSubjectRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize(TeacherSubjectPolicy $policy): bool
    {
        $actor = $this->user();

        return $actor instanceof User && $policy->manage($actor, 'assign');
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
                Rule::exists('users', 'id')
                    ->where('is_locked', false)
                    ->where('is_deleted', false),
            ],
            'subject_id' => [
                'required',
                'integer',
                Rule::exists('subjects', 'id')->where('is_deleted', false),
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
