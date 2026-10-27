<?php

namespace App\Http\Requests;

use App\Models\User;
use App\Policies\ExamAttemptPolicy;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreExamAttemptRequest extends FormRequest
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
            "student_id" => [
                "required",
                "integer",
                "exists:users,id"
            ],

            "exam_id" => [
                "required",
                "integer",
                "exists:exams,id"
            ],

            "start_time" => [
                "required",
                "date"
            ],

            "submission_time" => [
                "nullable",
                "date",
                "after_or_equal:start_time"
            ],

            "total_score" => [
                "nullable",
                "numeric",
                "min:0",
                "max:10"
            ],

            "correct_answer_count" => [
                "nullable",
                "integer",
                "min:0"
            ],

            "status" => [
                "sometimes",
                Rule::in(["IN_PROGRESS", "SAVED", "SUBMITTED", "CANCELLED"]),
            ],
        ];
    }

    public function messages()
    {
        return [
            "student_id.required" => ":attribute không được để trống",
            "student_id.integer" => ":attribute phải là số nguyên",
            "student_id.exists" => ":attribute không tồn tại trong hệ thống",

            "exam_id.required" => ":attribute không được để trống",
            "exam_id.integer" => ":attribute phải là số nguyên",
            "exam_id.exists" => ":attribute không tồn tại trong hệ thống",

            "start_time.required" => ":attribute không được để trống",
            "start_time.date" => ":attribute không đúng định dạng ngày giờ",

            "submission_time.date" => ":attribute không đúng định dạng ngày giờ",
            "submission_time.after_or_equal" => ":attribute phải sau hoặc bằng thời gian bắt đầu",

            "total_score.numeric" => ":attribute phải là số",
            "total_score.min" => ":attribute phải lớn hơn hoặc bằng 0",
            "total_score.max" => ":attribute không được vượt quá 10",

            "correct_answer_count.integer" => ":attribute phải là số nguyên",
            "correct_answer_count.min" => ":attribute phải lớn hơn hoặc bằng 0",

            "status.in" => ":attribute không hợp lệ",
        ];
    }

    public function attributes()
    {
        return [
            "student_id" => "Mã sinh viên",
            "exam_id" => "Mã đề thi",
            "start_time" => "Thời gian bắt đầu",
            "submission_time" => "Thời gian nộp bài",
            "total_score" => "Tổng điểm",
            "correct_answer_count" => "Số câu đúng",
            "status" => "Trạng thái",
        ];
    }
}
