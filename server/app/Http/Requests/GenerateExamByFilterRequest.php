<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class GenerateExamByFilterRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'subject_id' => ['required', 'integer', 'exists:subjects,id'],
            'creator_id' => ['required', 'integer', 'exists:users,id'],
            'exam_name' => ['required', 'string', 'max:255'],
            'start_time' => ['required', 'date'],
            'end_time' => ['required', 'date', 'after:start_time'],
            'duration_minutes' => ['required', 'integer', 'min:1'],
            'course_group_ids' => ['sometimes', 'array'],
            'course_group_ids.*' => ['integer', 'exists:course_groups,id'],

            'chapter_ids' => ['nullable', 'array'],
            'chapter_ids.*' => ['integer', 'exists:chapters,id'],

            'difficulty_filters' => ['required', 'array', 'min:1'],
            'difficulty_filters.*.difficulty_id' => ['required', 'integer', 'exists:difficulties,id'],
            'difficulty_filters.*.question_count' => ['required', 'integer', 'min:0'],

            'configuration' => ['required', 'array'],
            'configuration.has_monitoring' => ['sometimes', 'boolean'],
            'configuration.allow_copy' => ['sometimes', 'boolean'],
            'configuration.allow_print' => ['sometimes', 'boolean'],
            'configuration.is_enable_resume' => ['sometimes', 'boolean'],
            'configuration.shuffle_questions' => ['sometimes', 'boolean'],
            'configuration.shuffle_answers' => ['sometimes', 'boolean'],
            'configuration.show_score' => ['sometimes', 'boolean'],
            'configuration.show_detail_results' => ['sometimes', 'boolean'],
            'configuration.is_limit_switch_tab' => ['sometimes', 'boolean'],
            'configuration.tab_switch_limit' => ['sometimes', 'integer', 'min:0'],
            'configuration.message_on_warning' => ['sometimes', 'nullable', 'string'],
        ];
    }

    public function messages()
    {
        return [
            'subject_id.required' => ':attribute không được để trống',
            'subject_id.integer' => ':attribute phải là số nguyên',
            'subject_id.exists' => ':attribute không tồn tại trong hệ thống',

            'creator_id.required' => ':attribute không được để trống',
            'creator_id.integer' => ':attribute phải là số nguyên',
            'creator_id.exists' => ':attribute không tồn tại trong hệ thống',

            'exam_name.required' => ':attribute không được để trống',
            'exam_name.string' => ':attribute phải là chuỗi ký tự',
            'exam_name.max' => ':attribute không được vượt quá 255 ký tự',

            'start_time.required' => ':attribute không được để trống',
            'start_time.date' => ':attribute không đúng định dạng ngày giờ',

            'end_time.required' => ':attribute không được để trống',
            'end_time.date' => ':attribute không đúng định dạng ngày giờ',
            'end_time.after' => ':attribute phải sau thời gian bắt đầu',

            'duration_minutes.required' => ':attribute không được để trống',
            'duration_minutes.integer' => ':attribute phải là số nguyên',
            'duration_minutes.min' => ':attribute phải lớn hơn hoặc bằng 1',

            'course_group_ids.array' => ':attribute phải là mảng',
            'course_group_ids.*.integer' => ':attribute phải là số nguyên',
            'course_group_ids.*.exists' => ':attribute không tồn tại trong hệ thống',

            'chapter_ids.array' => ':attribute phải là mảng',
            'chapter_ids.*.integer' => ':attribute phải là số nguyên',
            'chapter_ids.*.exists' => ':attribute không tồn tại trong hệ thống',

            'difficulty_filters.required' => ':attribute không được để trống',
            'difficulty_filters.array' => ':attribute phải là mảng',
            'difficulty_filters.min' => ':attribute phải có ít nhất 1 phần tử',
            'difficulty_filters.*.difficulty_id.required' => ':attribute không được để trống',
            'difficulty_filters.*.difficulty_id.integer' => ':attribute phải là số nguyên',
            'difficulty_filters.*.difficulty_id.exists' => ':attribute không tồn tại trong hệ thống',
            'difficulty_filters.*.question_count.required' => ':attribute không được để trống',
            'difficulty_filters.*.question_count.integer' => ':attribute phải là số nguyên',
            'difficulty_filters.*.question_count.min' => ':attribute phải lớn hơn hoặc bằng 0',

            'configuration.required' => ':attribute không được để trống',
            'configuration.array' => ':attribute phải là mảng',
            'configuration.has_monitoring.boolean' => ':attribute phải là kiểu đúng/sai',
            'configuration.allow_copy.boolean' => ':attribute phải là kiểu đúng/sai',
            'configuration.allow_print.boolean' => ':attribute phải là kiểu đúng/sai',
            'configuration.is_enable_resume.boolean' => ':attribute phải là kiểu đúng/sai',
            'configuration.shuffle_questions.boolean' => ':attribute phải là kiểu đúng/sai',
            'configuration.shuffle_answers.boolean' => ':attribute phải là kiểu đúng/sai',
            'configuration.show_score.boolean' => ':attribute phải là kiểu đúng/sai',
            'configuration.show_detail_results.boolean' => ':attribute phải là kiểu đúng/sai',
            'configuration.is_limit_switch_tab.boolean' => ':attribute phải là kiểu đúng/sai',
            'configuration.tab_switch_limit.integer' => ':attribute phải là số nguyên',
            'configuration.tab_switch_limit.min' => ':attribute phải lớn hơn hoặc bằng 0',
            'configuration.message_on_warning.string' => ':attribute phải là chuỗi ký tự',
        ];
    }

    public function attributes()
    {
        return [
            'subject_id' => 'Mã môn thi',
            'creator_id' => 'Mã người tạo',
            'exam_name' => 'Tên đề',
            'start_time' => 'Thời gian bắt đầu',
            'end_time' => 'Thời gian kết thúc',
            'duration_minutes' => 'Thời gian làm bài',
            'course_group_ids' => 'Danh sách nhóm học phần',
            'course_group_ids.*' => 'Mã nhóm học phần',
            'chapter_ids' => 'Danh sách chương',
            'chapter_ids.*' => 'Mã chương',
            'difficulty_filters' => 'Danh sách bộ lọc độ khó',
            'difficulty_filters.*.difficulty_id' => 'Mã độ khó',
            'difficulty_filters.*.question_count' => 'Số lượng câu',
            'configuration' => 'Cấu hình đề thi',
            'configuration.has_monitoring' => 'Giám sát thi',
            'configuration.allow_copy' => 'Cho phép sao chép',
            'configuration.allow_print' => 'Cho phép in',
            'configuration.is_enable_resume' => 'Cho phép tiếp tục bài thi',
            'configuration.shuffle_questions' => 'Trộn câu hỏi',
            'configuration.shuffle_answers' => 'Trộn đáp án',
            'configuration.show_score' => 'Hiển thị điểm',
            'configuration.show_detail_results' => 'Hiển thị chi tiết kết quả',
            'configuration.is_limit_switch_tab' => 'Giới hạn chuyển tab',
            'configuration.tab_switch_limit' => 'Số lần chuyển tab tối đa',
            'configuration.message_on_warning' => 'Thông báo cảnh báo',
        ];
    }
}