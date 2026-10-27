<?php

namespace App\Http\Requests;

use App\Models\User;
use App\Policies\ExamAttemptPolicy;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateExamAttemptRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize(ExamAttemptPolicy $policy): bool
    {
        $actor = $this->user();

        return $actor instanceof User && $policy->manage($actor);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules()
    {
        return [
            "start_time" => [
                "sometimes",
                "date"
            ],

            "submission_time" => [
                "nullable",
                "date",
                "after_or_equal:start_time"
            ],

            "status" => [
                "sometimes",
                Rule::in(["IN_PROGRESS", "SAVED", "SUBMITTED", "CANCELLED"])
            ],
        ];
    }
}
