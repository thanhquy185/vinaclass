<?php

namespace App\Http\Requests;

use App\Models\Question;
use App\Models\User;
use App\Policies\QuestionPolicy;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class UpdateQuestionRequest extends FormRequest
{
    public function authorize(QuestionPolicy $policy): bool
    {
        $actor = $this->user();
        $question = $this->route('question');

        if (!$actor instanceof User || !$question instanceof Question) {
            return false;
        }

        return $policy->manage($actor, $question, 'update');
    }

    public function rules()
    {
        return [
            'subject_id' => ['sometimes', 'integer', 'exists:subjects,id'],
            'chapter_id' => ['sometimes', 'nullable', 'integer', 'exists:chapters,id'],
            'difficulty_id' => ['sometimes', 'nullable', 'integer', 'exists:difficulties,id'],
            'question_content' => ['sometimes', 'string'],
            'image_url' => ['sometimes', 'nullable', 'string'],
            'answer_explanation' => ['sometimes', 'nullable', 'string'],
            'default_score' => ['sometimes', 'numeric', 'min:0'],
            'status' => ['prohibited'],
            'answer_options' => ['sometimes', 'array', 'min:2'],
            'answer_options.*.id' => ['sometimes', 'integer', 'distinct', 'exists:answer_options,id'],
            'answer_options.*.option_content' => ['required_with:answer_options', 'string'],
            'answer_options.*.is_correct_answer' => ['required_with:answer_options', 'boolean'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            if ($validator->errors()->isNotEmpty() || !array_key_exists('answer_options', $this->all())) {
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
            'subject_id.integer' => ':attribute phải là số nguyên',
            'subject_id.exists' => ':attribute không tồn tại trong hệ thống',

            'chapter_id.integer' => ':attribute phải là số nguyên',
            'chapter_id.exists' => ':attribute không tồn tại trong hệ thống',

            'difficulty_id.integer' => ':attribute phải là số nguyên',
            'difficulty_id.exists' => ':attribute không tồn tại trong hệ thống',


            'question_content.string' => ':attribute phải là chuỗi ký tự',
            'image_url.string' => ':attribute phải là chuỗi ký tự',
            'answer_explanation.string' => ':attribute phải là chuỗi ký tự',

            'default_score.numeric' => ':attribute phải là số',
            'default_score.min' => ':attribute phải lớn hơn hoặc bằng 0',

            'status.prohibited' => 'Hãy dùng thao tác trạng thái riêng để chuyển nơi chứa câu hỏi.',
            'answer_options.array' => ':attribute phải là mảng',
            'answer_options.min' => ':attribute phải có ít nhất 2 lựa chọn',

            'answer_options.*.id.integer' => ':attribute phải là số nguyên',
            'answer_options.*.id.distinct' => 'Mỗi đáp án chỉ được chọn một lần.',
            'answer_options.*.id.exists' => ':attribute không tồn tại trong hệ thống',

            'answer_options.*.option_content.required_with' => ':attribute không được để trống khi cập nhật danh sách câu trả lời',
            'answer_options.*.option_content.string' => ':attribute phải là chuỗi ký tự',

            'answer_options.*.is_correct_answer.required_with' => ':attribute không được để trống khi cập nhật danh sách câu trả lời',
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
            'answer_options.*.id' => 'Mã câu trả lời',
            'answer_options.*.option_content' => 'Nội dung lựa chọn',
            'answer_options.*.is_correct_answer' => 'Trạng thái đáp án đúng',
        ];
    }
}
