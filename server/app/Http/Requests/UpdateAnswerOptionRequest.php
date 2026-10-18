<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAnswerOptionRequest extends FormRequest
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
            "option_content" => [
                "sometimes",
                "required",
                "string",
                "max:1000",
            ],
            "is_correct_answer" => [
                "sometimes",
                "required",
                "boolean",
            ],
            "question_id" => [
                "sometimes",
                "required",
                "integer",
                "exists:questions,id",
            ],
        ];
    }

    public function messages()
    {
        return [
            'option_content.required' => 'Vui lòng nhập nội dung lựa chọn.',
            'option_content.string' => 'Nội dung lựa chọn phải là chuỗi ký tự.',
            'option_content.max' => 'Nội dung lựa chọn không được vượt quá 1000 ký tự.',
            'is_correct_answer.required' => 'Vui lòng xác định đáp án đúng.',
            'is_correct_answer.boolean' => 'Trạng thái đáp án đúng phải là kiểu đúng/sai.',
            'question_id.required' => 'Vui lòng chọn câu hỏi.',
            'question_id.integer' => 'Mã câu hỏi không hợp lệ.',
            'question_id.exists' => 'Câu hỏi không tồn tại.',
        ];
    }

    public function attributes()
    {
        return [
            'option_content' => 'Nội dung lựa chọn',
            'is_correct_answer' => 'Trạng thái đáp án đúng',
            'question_id' => 'Câu hỏi',
        ];
    }
}
