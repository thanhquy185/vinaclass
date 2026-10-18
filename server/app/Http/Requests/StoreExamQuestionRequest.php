<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreExamQuestionRequest extends FormRequest
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
            "question_id" => [
                "required",
                "integer",
                "exists:questions,id",
                Rule::unique('exam_questions')->where(
                    fn ($query) => $query->where('exam_id', $this->input('exam_id'))
                ),
            ],

            "exam_id" => [
                "required",
                "integer",
                "exists:exams,id",
            ],

            "question_order" => [
                "required",
                "integer",
                "min:1",
            ],

            "score" => [
                "required",
                "numeric",
                "min:0",
            ],
        ];
    }

    public function messages()
    {
        return [
            'question_id.required' => 'Vui lòng chọn câu hỏi.',
            'question_id.integer' => 'Mã câu hỏi không hợp lệ.',
            'question_id.exists' => 'Câu hỏi không tồn tại.',
            'question_id.unique' => 'Câu hỏi đã có trong đề thi này.',
            'exam_id.required' => 'Vui lòng chọn đề thi.',
            'exam_id.integer' => 'Mã đề thi không hợp lệ.',
            'exam_id.exists' => 'Đề thi không tồn tại.',
            'question_order.required' => 'Vui lòng nhập thứ tự câu hỏi.',
            'question_order.integer' => 'Thứ tự câu hỏi phải là số nguyên.',
            'question_order.min' => 'Thứ tự câu hỏi phải lớn hơn hoặc bằng 1.',
            'score.required' => 'Vui lòng nhập điểm câu hỏi.',
            'score.numeric' => 'Điểm câu hỏi phải là số.',
            'score.min' => 'Điểm câu hỏi không được nhỏ hơn 0.',
        ];
    }

    public function attributes()
    {
        return [
            'question_id' => 'Câu hỏi',
            'exam_id' => 'Đề thi',
            'question_order' => 'Thứ tự câu hỏi',
            'score' => 'Điểm câu hỏi',
        ];
    }
}
