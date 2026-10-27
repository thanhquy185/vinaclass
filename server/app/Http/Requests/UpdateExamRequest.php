<?php

namespace App\Http\Requests;

use App\Models\Exam;
use App\Models\User;
use App\Policies\ExamPolicy;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class UpdateExamRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize(ExamPolicy $policy): bool
    {
        $actor = $this->user();
        $exam = $this->route('exam');

        if (
            !$actor instanceof User
            || !$exam instanceof Exam
            || !$policy->manage($actor, $exam, 'update')
        ) {
            return false;
        }

        return !$this->hasCourseGroupAssignmentChanges($exam)
            || $policy->assignCourseGroups($actor);
    }

    private function hasCourseGroupAssignmentChanges(Exam $exam): bool
    {
        if (!$this->exists('course_group_ids') || !is_array($this->input('course_group_ids'))) {
            return false;
        }

        $currentIds = $exam->courseGroups()
            ->pluck('course_groups.id')
            ->map(fn ($id): int => (int) $id)
            ->unique()
            ->sort()
            ->values()
            ->all();
        $requestedIds = collect($this->input('course_group_ids'))
            ->map(fn ($id) => filter_var($id, FILTER_VALIDATE_INT))
            ->filter(fn ($id): bool => $id !== false)
            ->map(fn ($id): int => (int) $id)
            ->unique()
            ->sort()
            ->values()
            ->all();

        return $currentIds !== $requestedIds;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules()
    {
        return [
            'subject_id' => ['sometimes', 'integer', 'exists:subjects,id'],
            'exam_name' => ['sometimes', 'required', 'string', 'max:255'],

            'start_time' => ['sometimes', 'date'],
            'end_time' => ['sometimes', 'date'],

            'duration_minutes' => ['sometimes', 'integer', 'min:1'],

            'course_group_ids' => ['sometimes', 'array'],
            'course_group_ids.*' => ['integer', 'distinct', 'exists:course_groups,id'],

            'questions' => ['sometimes', 'array', 'min:1', 'max:1000'],
            'questions.*.id' => ['required_with:questions', 'integer', 'distinct', 'exists:questions,id'],
            'questions.*.order' => ['required_with:questions', 'integer', 'min:1', 'distinct'],
            'questions.*.score' => ['required_with:questions', 'numeric', 'min:0', 'max:10'],

            'configuration' => ['sometimes', 'array'],
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
            'configuration.limit_questions_per_page' => ['sometimes', 'integer', 'min:-1', 'not_in:0'],
            'configuration.allow_back_last_question' => ['sometimes', 'boolean'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            if (!$validator->errors()->has('start_time') && !$validator->errors()->has('end_time')) {
                $exam = $this->route('exam');
                $startTime = $this->input('start_time', $exam?->start_time);
                $endTime = $this->input('end_time', $exam?->end_time);
                if ($startTime && $endTime && strtotime((string) $endTime) <= strtotime((string) $startTime)) {
                    $validator->errors()->add('end_time', 'Thời gian kết thúc phải sau thời gian bắt đầu.');
                }
            }

            if ($validator->errors()->isNotEmpty() || !$this->exists('questions')) {
                return;
            }

            $questions = $this->input('questions', []);
            if (!is_array($questions) || empty($questions)) {
                return;
            }

            $totalScore = array_sum(array_map(
                fn ($question) => (float) ($question['score'] ?? 0),
                $questions
            ));

            if (abs($totalScore - 10) > 0.001) {
                $validator->errors()->add('questions', 'Tổng điểm các câu hỏi phải bằng 10.');
            }
        });
    }

    public function messages()
    {
        return [
            'subject_id.integer' => ':attribute phải là số nguyên',
            'subject_id.exists' => ':attribute không tồn tại trong hệ thống',

            'exam_name.string' => ':attribute phải là chuỗi ký tự',
            'exam_name.max' => ':attribute không được vượt quá 255 ký tự',

            'start_time.date' => ':attribute không đúng định dạng ngày giờ',
            'end_time.date' => ':attribute không đúng định dạng ngày giờ',
            'end_time.after' => ':attribute phải sau thời gian bắt đầu',

            'duration_minutes.integer' => ':attribute phải là số nguyên',
            'duration_minutes.min' => ':attribute phải lớn hơn hoặc bằng 1',

            'course_group_ids.array' => ':attribute phải là mảng',
            'course_group_ids.*.integer' => ':attribute phải là số nguyên',
            'course_group_ids.*.exists' => ':attribute không tồn tại trong hệ thống',

            'questions.array' => ':attribute phải là mảng',
            'questions.max' => ':attribute không được vượt quá 1000 câu',

            'questions.*.id.required_with' => ':attribute không được để trống',
            'questions.*.id.integer' => ':attribute phải là số nguyên',
            'questions.*.id.exists' => ':attribute không tồn tại trong hệ thống',

            'questions.*.order.required_with' => ':attribute không được để trống',
            'questions.*.order.integer' => ':attribute phải là số nguyên',

            'questions.*.score.required_with' => ':attribute không được để trống',
            'questions.*.score.numeric' => ':attribute phải là số',
            'questions.*.score.min' => ':attribute phải lớn hơn hoặc bằng 0',
            'questions.*.score.max' => ':attribute không được vượt quá 10',

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
            'configuration.limit_questions_per_page.integer' => ':attribute phải là số nguyên',
            'configuration.allow_back_last_question.boolean' => ':attribute phải là kiểu đúng/sai',
        ];
    }

    public function attributes()
    {
        return [
            'subject_id' => 'Mã môn thi',
            'exam_name' => 'Tên đề',
            'start_time' => 'Thời gian bắt đầu',
            'end_time' => 'Thời gian kết thúc',
            'duration_minutes' => 'Thời gian làm bài',
            'course_group_ids' => 'Danh sách nhóm học phần',
            'course_group_ids.*' => 'Mã nhóm học phần',
            'questions' => 'Danh sách câu hỏi',
            'questions.*.id' => 'Mã câu hỏi',
            'questions.*.order' => 'Thứ tự câu hỏi',
            'questions.*.score' => 'Điểm câu hỏi',
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
            'configuration.limit_questions_per_page' => 'Số câu hỏi mỗi trang',
            'configuration.allow_back_last_question' => 'Cho phép quay lại câu trước',
        ];
    }
}
