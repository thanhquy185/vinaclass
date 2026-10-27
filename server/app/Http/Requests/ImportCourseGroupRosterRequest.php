<?php

namespace App\Http\Requests;

class ImportCourseGroupRosterRequest extends CourseGroupScopedRequest
{
    public function rules(): array
    {
        return [
            'file' => ['required', 'file', 'mimes:xlsx,xls,csv'],
        ];
    }

    public function messages(): array
    {
        return [
            'file.required' => 'Vui lòng chọn tệp danh sách sinh viên.',
            'file.file' => 'Tệp danh sách sinh viên không hợp lệ.',
            'file.mimes' => 'Chỉ hỗ trợ tệp XLSX, XLS hoặc CSV.',
        ];
    }

    public function attributes(): array
    {
        return [
            'file' => 'Tệp danh sách sinh viên',
        ];
    }
}
