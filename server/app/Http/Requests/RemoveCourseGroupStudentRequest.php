<?php

namespace App\Http\Requests;

class RemoveCourseGroupStudentRequest extends CourseGroupScopedRequest
{
    public function rules(): array
    {
        return [
            'student_id' => ['required', 'integer', 'min:1'],
        ];
    }

    public function messages(): array
    {
        return [
            'student_id.required' => 'Vui lòng chọn sinh viên.',
            'student_id.integer' => 'ID sinh viên không hợp lệ.',
            'student_id.min' => 'ID sinh viên không hợp lệ.',
        ];
    }

    public function attributes(): array
    {
        return [
            'student_id' => 'Sinh viên',
        ];
    }
}
