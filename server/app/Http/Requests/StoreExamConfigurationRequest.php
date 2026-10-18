<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreExamConfigurationRequest extends FormRequest
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
            'exam_id' => ['required', 'integer', 'exists:exams,id', 'unique:exam_configurations,exam_id'],
            'has_monitoring' => ['sometimes', 'nullable', 'boolean'],
            'limit_questions_per_page' => ['sometimes', 'nullable', 'integer'],
            'allow_back_last_question' => ['sometimes', 'nullable', 'boolean'],
            'allow_copy' => ['sometimes', 'nullable', 'boolean'],
            'allow_print' => ['sometimes', 'nullable', 'boolean'],
            'is_enable_resume' => ['sometimes', 'nullable', 'boolean'],
            'shuffle_questions' => ['sometimes', 'nullable', 'boolean'],
            'shuffle_answers' => ['sometimes', 'nullable', 'boolean'],
            'show_score' => ['sometimes', 'nullable', 'boolean'],
            'show_detail_results' => ['sometimes', 'nullable', 'boolean'],
            'is_limit_switch_tab' => ['sometimes', 'nullable', 'boolean'],
            'tab_switch_limit' => ['sometimes', 'nullable', 'integer', 'min:0'],
            'message_on_warning' => ['sometimes', 'nullable', 'string'],
        ];
    }

    public function messages()
    {
        return [
            'exam_id.required' => ':attribute không được để trống',
            'exam_id.integer' => ':attribute phải là số nguyên',
            'exam_id.exists' => ':attribute không tồn tại trong hệ thống',
            'exam_id.unique' => ':attribute đã được cấu hình',

            'has_monitoring.boolean' => ':attribute phải là kiểu đúng/sai',
            'limit_questions_per_page.integer' => ':attribute phải là số nguyên',
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
            'exam_id' => 'Mã đề thi',
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
