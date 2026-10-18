<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SubmitTestRequest extends FormRequest
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
            'answers' => ['required', 'array'],

            'answers.*.question_id' => [
                'required',
                'integer',
                'exists:questions,id',
            ],

            'answers.*.answer_id' => [
                'required',
                'integer',
                'exists:answer_options,id',
            ],
        ];
    }

    public function messages()
    {
        return [
            'answers.required' => 'Danh sách câu trả lời không được để trống.',
            'answers.array' => 'Danh sách câu trả lời phải là một mảng.',
            'answers.*.question_id.required' => 'Mã câu hỏi không được để trống.',
            'answers.*.question_id.integer' => 'Mã câu hỏi phải là số nguyên.',
            'answers.*.question_id.exists' => 'Câu hỏi không tồn tại.',
            'answers.*.answer_id.required' => 'Mã đáp án không được để trống.',
            'answers.*.answer_id.integer' => 'Mã đáp án phải là số nguyên.',
            'answers.*.answer_id.exists' => 'Đáp án không tồn tại.',
        ];
    }

    public function attributes()
    {
        return [
            'answers' => 'Danh sách câu trả lời',
            'answers.*.question_id' => 'Mã câu hỏi',
            'answers.*.answer_id' => 'Mã đáp án',
        ];
    }
}
