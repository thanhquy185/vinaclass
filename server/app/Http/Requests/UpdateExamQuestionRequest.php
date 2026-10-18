<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateExamQuestionRequest extends FormRequest
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
            ],

            "exam_id" => [
                "required",
                "integer",
                "exists:exams,id"
            ],

            "question_order" => [
                "sometimes",
                "integer",
                "min:1",
            ],

            "score" => [
                "sometimes",
                "numeric",
                "min:0"
            ],
        ];
    }
}
