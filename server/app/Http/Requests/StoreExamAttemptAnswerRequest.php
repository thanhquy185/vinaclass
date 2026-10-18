<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreExamAttemptAnswerRequest extends FormRequest
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

            "question_id" => [
                "required",
                "integer",
                "exists:questions,id",
                Rule::unique('exam_attempt_answers')->where(
                    fn ($query) => $query->where('exam_attempt_id', $this->input('exam_attempt_id'))
                ),
            ],

            "answer_option_id" => [
                "nullable",
                "integer",
                "exists:answer_options,id",
            ],

            "is_selected_correct" => [
                "nullable",
                "boolean",
            ],

            "score" => [
                "nullable",
                "numeric",
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
            'question_id.required' => 'Vui lòng chọn câu hỏi.',
            'question_id.integer' => 'Mã câu hỏi không hợp lệ.',
            'question_id.exists' => 'Câu hỏi không tồn tại.',
            'question_id.unique' => 'Câu hỏi đã có câu trả lời trong bài làm này.',
            'answer_option_id.integer' => 'Mã đáp án không hợp lệ.',
            'answer_option_id.exists' => 'Đáp án không tồn tại.',
            'is_selected_correct.boolean' => 'Trạng thái đáp án đúng phải là kiểu đúng/sai.',
            'score.numeric' => 'Điểm phải là số.',
            'score.min' => 'Điểm không được nhỏ hơn 0.',
        ];
    }

    public function attributes()
    {
        return [
            'exam_attempt_id' => 'Bài làm',
            'question_id' => 'Câu hỏi',
            'answer_option_id' => 'Đáp án',
            'is_selected_correct' => 'Trạng thái đáp án đúng',
            'score' => 'Điểm',
        ];
    }
}
