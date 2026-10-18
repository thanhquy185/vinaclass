<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StartTestRequest extends FormRequest
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
            "student_id" => [
                "required",
                "integer",
                "exists:users,id",
            ],

            "exam_id" => [
                "required",
                "integer",
                "exists:exams,id",
            ],
        ];
    }

    public function messages()
    {
        return [
            'student_id.required' => 'Vui lòng chọn sinh viên.',
            'student_id.integer' => 'Mã sinh viên không hợp lệ.',
            'student_id.exists' => 'Sinh viên không tồn tại.',
            'exam_id.required' => 'Vui lòng chọn đề thi.',
            'exam_id.integer' => 'Mã đề thi không hợp lệ.',
            'exam_id.exists' => 'Đề thi không tồn tại.',
        ];
    }

    public function attributes()
    {
        return [
            'student_id' => 'Sinh viên',
            'exam_id' => 'Đề thi',
        ];
    }
}
