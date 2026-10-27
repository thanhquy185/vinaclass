<?php

namespace App\Http\Requests;

use App\Models\ExamAttempt;
use App\Models\User;
use App\Policies\ExamAttemptPolicy;
use Illuminate\Foundation\Http\FormRequest;

class UpdateStudentTestRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize(ExamAttemptPolicy $policy): bool
    {
        $actor = $this->user();
        $examAttempt = $this->route('examAttempt');

        return $actor instanceof User
            && $examAttempt instanceof ExamAttempt
            && $policy->updateOwnAttempt($actor, $examAttempt);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules()
    {
        return [
            'answers' => ['required', 'array', 'min:1'],

            'answers.*.question_id' => [
                'required',
                'integer',
                'distinct',
                'exists:questions,id'
            ],

            'answers.*.answer_id' => [
                'sometimes',
                'nullable',
                'integer',
                'exists:answer_options,id'
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'answers.*.question_id.distinct' => 'Mỗi câu hỏi chỉ được gửi một câu trả lời.',
        ];
    }
}
