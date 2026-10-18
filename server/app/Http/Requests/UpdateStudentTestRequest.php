<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateStudentTestRequest extends FormRequest
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
                'exists:questions,id'
            ],

            'answers.*.answer_id' => [
                'required',
                'integer',
                'exists:answer_options,id'
            ],
        ];
    }
}
