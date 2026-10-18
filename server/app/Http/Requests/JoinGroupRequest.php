<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class JoinGroupRequest extends FormRequest
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
            "join_code" => [
                "required",
                "string",
                "max:20",
                "exists:course_groups,join_code",
            ],
        ];
    }

    public function messages()
    {
        return [
            'student_id.required' => 'Vui lòng chọn sinh viên.',
            'student_id.integer' => 'Mã sinh viên không hợp lệ.',
            'student_id.exists' => 'Sinh viên không tồn tại.',
            'join_code.required' => 'Vui lòng nhập mã mời.',
            'join_code.string' => 'Mã mời không hợp lệ.',
            'join_code.max' => 'Mã mời không được vượt quá 20 ký tự.',
            'join_code.exists' => 'Mã mời không tồn tại.',
        ];
    }

    public function attributes()
    {
        return [
            'student_id' => 'Sinh viên',
            'join_code' => 'Mã mời',
        ];
    }
}
