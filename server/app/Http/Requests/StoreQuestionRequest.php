<?php

namespace App\Http\Requests;

use App\Models\User;
use App\Policies\QuestionPolicy;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StoreQuestionRequest extends FormRequest
{
    public function authorize(QuestionPolicy $policy): bool
    {
        $actor = $this->user();

        return $actor instanceof User && $policy->create($actor);
    }

    public function rules()
    {
        return [
            'subject_id' => ['required', 'integer', 'exists:subjects,id'],
            'chapter_id' => ['nullable', 'integer', 'exists:chapters,id'],
            'difficulty_id' => ['nullable', 'integer', 'exists:difficulties,id'],
            'question_content' => ['required', 'string'],
            'image_url' => ['nullable', 'string'],
            'answer_explanation' => ['nullable', 'string'],
            'default_score' => ['nullable', 'numeric', 'min:0'],
            'status' => ['prohibited'],
            'answer_options' => ['required', 'array', 'min:2'],
            'answer_options.*.option_content' => ['required', 'string'],
            'answer_options.*.is_correct_answer' => ['required', 'boolean'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            if ($validator->errors()->isNotEmpty()) {
                return;
            }

            $correctAnswerCount = collect($this->input('answer_options', []))
                ->filter(fn ($option) => filter_var($option['is_correct_answer'] ?? false, FILTER_VALIDATE_BOOLEAN))
                ->count();
            if ($correctAnswerCount !== 1) {
                $validator->errors()->add('answer_options', 'Câu hỏi phải có chính xác một đáp án đúng.');
            }
        });
    }

    public function messages()
    {
        return [
            'subject_id.required' => ':attribute không được để trống',
            'subject_id.integer' => ':attribute phải là số nguyên',
            'subject_id.exists' => ':attribute không tồn tại trong hệ thống',

            'chapter_id.integer' => ':attribute phải là số nguyên',
            'chapter_id.exists' => ':attribute không tồn tại trong hệ thống',

            'difficulty_id.integer' => ':attribute phải là số nguyên',
            'difficulty_id.exists' => ':attribute không tồn tại trong hệ thống',

            'question_content.required' => ':attribute không được để trống',
            'question_content.string' => ':attribute phải là chuỗi ký tự',

            'image_url.string' => ':attribute phải là chuỗi ký tự',
            'answer_explanation.string' => ':attribute phải là chuỗi ký tự',

            'default_score.numeric' => ':attribute phải là số',
            'default_score.min' => ':attribute phải lớn hơn hoặc bằng 0',

            'status.prohibited' => 'Câu hỏi mới luôn được lưu trong Cá nhân. Hãy dùng thao tác Công khai câu hỏi để chia sẻ.',
            'answer_options.required' => ':attribute không được để trống',
            'answer_options.array' => ':attribute phải là mảng',
            'answer_options.min' => ':attribute phải có ít nhất 2 lựa chọn',

            'answer_options.*.option_content.required' => ':attribute không được để trống',
            'answer_options.*.option_content.string' => ':attribute phải là chuỗi ký tự',

            'answer_options.*.is_correct_answer.required' => ':attribute không được để trống',
            'answer_options.*.is_correct_answer.boolean' => ':attribute phải là kiểu đúng/sai',
        ];
    }

    public function attributes()
    {
        return [
            'subject_id' => 'Mã môn học',
            'chapter_id' => 'Mã chương',
            'difficulty_id' => 'Mã độ khó',
            'question_content' => 'Nội dung câu hỏi',
            'image_url' => 'Đường dẫn ảnh',
            'answer_explanation' => 'Giải thích đáp án',
            'default_score' => 'Điểm mặc định',
            'status' => 'Trạng thái',
            'answer_options' => 'Danh sách câu trả lời',
            'answer_options.*.option_content' => 'Nội dung lựa chọn',
            'answer_options.*.is_correct_answer' => 'Trạng thái đáp án đúng',
        ];
    }
}
