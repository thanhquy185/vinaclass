<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCourseGroupStudentRequest extends FormRequest
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
            'student_id' => [
                'sometimes',
                'required',
                'integer',
                'exists:users,id',
                Rule::unique('course_group_students')->where(function ($query) {
                    $current = $this->route('courseGroupStudent');
                    $courseGroupId = $this->input(
                        'course_group_id',
                        is_object($current) ? $current->course_group_id : null
                    );

                    $query->where('course_group_id', $courseGroupId);

                    if (is_object($current)) {
                        $query->where(function ($currentPair) use ($current) {
                            $currentPair
                                ->where('student_id', '!=', $current->student_id)
                                ->orWhere('course_group_id', '!=', $current->course_group_id);
                        });
                    }
                }),
            ],
            'course_group_id' => [
                'sometimes',
                'required',
                'integer',
                'exists:course_groups,id',
            ],
        ];
    }

    public function messages()
    {
        return [
            'student_id.required' => 'Vui lòng chọn sinh viên.',
            'student_id.integer' => 'Mã sinh viên không hợp lệ.',
            'student_id.exists' => 'Sinh viên không tồn tại.',
            'student_id.unique' => 'Sinh viên đã tham gia nhóm học phần này.',
            'course_group_id.required' => 'Vui lòng chọn nhóm học phần.',
            'course_group_id.integer' => 'Mã nhóm học phần không hợp lệ.',
            'course_group_id.exists' => 'Nhóm học phần không tồn tại.',
        ];
    }

    public function attributes()
    {
        return [
            'student_id' => 'Sinh viên',
            'course_group_id' => 'Nhóm học phần',
        ];
    }
}
