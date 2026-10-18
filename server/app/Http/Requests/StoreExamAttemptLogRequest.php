<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreExamAttemptLogRequest extends FormRequest
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
            "exam_attempt_id" => [
                "required",
                "integer",
                "exists:exam_attempts,id",
            ],

            "tab_switch_count" => [
                "required",
                "integer",
                "min:0",
            ],
        ];
    }

    public function messages()
    {
        return [
            'exam_attempt_id.required' => 'Vui lòng chọn bài làm.',
            'exam_attempt_id.integer' => 'Mã bài làm không hợp lệ.',
            'exam_attempt_id.exists' => 'Bài làm không tồn tại.',
            'tab_switch_count.required' => 'Vui lòng nhập số lần chuyển tab.',
            'tab_switch_count.integer' => 'Số lần chuyển tab phải là số nguyên.',
            'tab_switch_count.min' => 'Số lần chuyển tab không được nhỏ hơn 0.',
        ];
    }

    public function attributes()
    {
        return [
            'exam_attempt_id' => 'Bài làm',
            'tab_switch_count' => 'Số lần chuyển tab',
        ];
    }
}
