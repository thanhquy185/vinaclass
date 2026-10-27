<?php

namespace App\Http\Requests;

use App\Models\User;
use App\Policies\ExamAttemptPolicy;
use Illuminate\Foundation\Http\FormRequest;

class StartTestRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize(ExamAttemptPolicy $policy): bool
    {
        $actor = $this->user();

        return $actor instanceof User && $policy->startOwnAttempt($actor, $actor);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules()
    {
        return [
            "exam_id" => [
                "required",
                "integer",
                "exists:exams,id",
            ],
        ];
    }

    public function messages()
    {
        return [
            'exam_id.required' => 'Vui lòng chọn đề thi.',
            'exam_id.integer' => 'Mã đề thi không hợp lệ.',
            'exam_id.exists' => 'Đề thi không tồn tại.',
        ];
    }

    public function attributes()
    {
        return [
            'student_id' => 'Sinh viên',
            'exam_id' => 'Đề thi',
        ];
    }
}
