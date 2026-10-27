<?php

namespace App\Http\Requests;

class AddCourseGroupStudentRequest extends CourseGroupScopedRequest
{
    public function rules(): array
    {
        return [
            'username' => ['required', 'string', 'max:255'],
        ];
    }

    public function messages(): array
    {
        return [
            'username.required' => 'Vui lòng nhập mã sinh viên.',
            'username.string' => 'Mã sinh viên không hợp lệ.',
            'username.max' => 'Mã sinh viên không hợp lệ.',
        ];
    }

    public function attributes(): array
    {
        return [
            'username' => 'Mã sinh viên',
        ];
    }
}
