<?php

namespace App\Http\Requests;

use App\Models\ExamConfiguration;
use App\Models\User;
use App\Policies\ExamPolicy;
use Illuminate\Foundation\Http\FormRequest;

class UpdateExamConfigurationRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize(ExamPolicy $policy): bool
    {
        $actor = $this->user();
        $configuration = $this->route('examConfiguration');

        if (!$actor instanceof User || !$configuration instanceof ExamConfiguration) {
            return false;
        }

        $exam = $configuration->loadMissing('exam')->exam;

        return $exam !== null && $policy->manage($actor, $exam, 'update');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules()
    {
        return [
            'has_monitoring' => ['sometimes', 'boolean'],
            'limit_questions_per_page' => ['sometimes', 'integer', 'min:-1', 'not_in:0'],
            'allow_back_last_question' => ['sometimes', 'boolean'],
            'allow_copy' => ['sometimes', 'boolean'],
            'allow_print' => ['sometimes', 'boolean'],
            'is_enable_resume' => ['sometimes', 'boolean'],
            'shuffle_questions' => ['sometimes', 'boolean'],
            'shuffle_answers' => ['sometimes', 'boolean'],
            'show_score' => ['sometimes', 'boolean'],
            'show_detail_results' => ['sometimes', 'boolean'],
            'is_limit_switch_tab' => ['sometimes', 'boolean'],
            'tab_switch_limit' => ['sometimes', 'integer', 'min:0'],
            'message_on_warning' => ['sometimes', 'nullable', 'string'],
        ];
    }

    public function messages()
    {
        return [
            'has_monitoring.boolean' => ':attribute phải là kiểu đúng/sai',
            'limit_questions_per_page.integer' => ':attribute phải là số nguyên',
            'limit_questions_per_page.min' => ':attribute phải là -1 hoặc số nguyên dương',
            'limit_questions_per_page.not_in' => ':attribute không được bằng 0',
            'allow_back_last_question.boolean' => ':attribute phải là kiểu đúng/sai',
            'allow_copy.boolean' => ':attribute phải là kiểu đúng/sai',
            'allow_print.boolean' => ':attribute phải là kiểu đúng/sai',
            'is_enable_resume.boolean' => ':attribute phải là kiểu đúng/sai',
            'shuffle_questions.boolean' => ':attribute phải là kiểu đúng/sai',
            'shuffle_answers.boolean' => ':attribute phải là kiểu đúng/sai',
            'show_score.boolean' => ':attribute phải là kiểu đúng/sai',
            'show_detail_results.boolean' => ':attribute phải là kiểu đúng/sai',
            'is_limit_switch_tab.boolean' => ':attribute phải là kiểu đúng/sai',

            'tab_switch_limit.integer' => ':attribute phải là số nguyên',
            'tab_switch_limit.min' => ':attribute phải lớn hơn hoặc bằng 0',

            'message_on_warning.string' => ':attribute phải là chuỗi ký tự',
        ];
    }

    public function attributes()
    {
        return [
            'has_monitoring' => 'Giám sát thi',
            'limit_questions_per_page' => 'Số câu hỏi mỗi trang',
            'allow_back_last_question' => 'Cho phép quay lại câu trước',
            'allow_copy' => 'Cho phép sao chép',
            'allow_print' => 'Cho phép in',
            'is_enable_resume' => 'Cho phép tiếp tục bài thi',
            'shuffle_questions' => 'Trộn câu hỏi',
            'shuffle_answers' => 'Trộn đáp án',
            'show_score' => 'Hiển thị điểm',
            'show_detail_results' => 'Hiển thị chi tiết kết quả',
            'is_limit_switch_tab' => 'Giới hạn chuyển tab',
            'tab_switch_limit' => 'Số lần chuyển tab tối đa',
            'message_on_warning' => 'Thông báo cảnh báo',
        ];
    }
}
