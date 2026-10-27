<?php

namespace App\Http\Requests;

use App\Models\ExamAttempt;
use App\Models\User;
use App\Policies\ExamAttemptPolicy;
use Illuminate\Foundation\Http\FormRequest;

class UpdateExamAttemptLogRequest extends FormRequest
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
            && $policy->updateOwnLog($actor, $examAttempt);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules()
    {
        return [
            "tab_switch_count" => [
                "sometimes",
                "integer",
                "min:0"
            ],
        ];
    }
}
