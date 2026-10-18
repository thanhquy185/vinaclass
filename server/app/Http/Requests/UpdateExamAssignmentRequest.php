<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateExamAssignmentRequest extends FormRequest
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
            'exam_id' => [
                'sometimes',
                'required',
                'integer',
                'exists:exams,id',
                Rule::unique('exam_assignments')->where(function ($query) {
                    $current = $this->route('examAssignment');
                    $courseGroupId = $this->input(
                        'course_group_id',
                        is_object($current) ? $current->course_group_id : null
                    );

                    $query->where('course_group_id', $courseGroupId);

                    if (is_object($current)) {
                        $query->where(function ($currentPair) use ($current) {
                            $currentPair
                                ->where('exam_id', '!=', $current->exam_id)
                                ->orWhere('course_group_id', '!=', $current->course_group_id);
                        });
                    }
                }),
            ],
            'course_group_id' => [
                'sometimes',
                'required',
                'integer',
                'exists:course_groups,id',
            ],
            'start_time' => ['sometimes', 'required', 'date'],
            'end_time' => ['sometimes', 'required', 'date', 'after:start_time'],
        ];
    }

    public function messages()
    {
        return [
            'exam_id.required' => 'Vui lòng chọn đề thi.',
            'exam_id.integer' => 'Mã đề thi không hợp lệ.',
            'exam_id.exists' => 'Đề thi không tồn tại.',
            'exam_id.unique' => 'Đề thi đã được phân công cho nhóm học phần này.',
            'course_group_id.required' => 'Vui lòng chọn nhóm học phần.',
            'course_group_id.integer' => 'Mã nhóm học phần không hợp lệ.',
            'course_group_id.exists' => 'Nhóm học phần không tồn tại.',
            'start_time.required' => 'Vui lòng nhập thời gian bắt đầu.',
            'start_time.date' => 'Thời gian bắt đầu không hợp lệ.',
            'end_time.required' => 'Vui lòng nhập thời gian kết thúc.',
            'end_time.date' => 'Thời gian kết thúc không hợp lệ.',
            'end_time.after' => 'Thời gian kết thúc phải sau thời gian bắt đầu.',
        ];
    }

    public function attributes()
    {
        return [
            'exam_id' => 'Đề thi',
            'course_group_id' => 'Nhóm học phần',
            'start_time' => 'Thời gian bắt đầu',
            'end_time' => 'Thời gian kết thúc',
        ];
    }
}
