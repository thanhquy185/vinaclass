<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateQuestionRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'subject_id' => ['sometimes', 'integer', 'exists:subjects,id'],
            'chapter_id' => ['sometimes', 'nullable', 'integer', 'exists:chapters,id'],
            'difficulty_id' => ['sometimes', 'nullable', 'integer', 'exists:difficulties,id'],
            'creator_id' => ['sometimes', 'integer', 'exists:users,id'],
            'question_content' => ['sometimes', 'string'],
            'image_url' => ['sometimes', 'nullable', 'string'],
            'answer_explanation' => ['sometimes', 'nullable', 'string'],
            'default_score' => ['sometimes', 'numeric', 'min:0'],
            'status' => ['sometimes', 'in:public,private,archive'],
            'is_deleted' => ['sometimes', 'boolean'],
            'answerOptions' => ['sometimes', 'array', 'min:2'],
            'answerOptions.*.id' => ['sometimes', 'integer', 'exists:answer_options,id'],
            'answerOptions.*.option_content' => ['required_with:answerOptions', 'string'],
            'answerOptions.*.is_correct_answer' => ['required_with:answerOptions', 'boolean'],
        ];
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

            'creator_id.integer' => ':attribute phải là số nguyên',
            'creator_id.exists' => ':attribute không tồn tại trong hệ thống',

            'question_content.string' => ':attribute phải là chuỗi ký tự',
            'image_url.string' => ':attribute phải là chuỗi ký tự',
            'answer_explanation.string' => ':attribute phải là chuỗi ký tự',

            'default_score.numeric' => ':attribute phải là số',
            'default_score.min' => ':attribute phải lớn hơn hoặc bằng 0',

            'status.in' => ':attribute chỉ nhận một trong các giá trị: public, private, archive',
            'is_deleted.boolean' => ':attribute phải là kiểu đúng/sai',

            'answerOptions.array' => ':attribute phải là mảng',
            'answerOptions.min' => ':attribute phải có ít nhất 2 lựa chọn',

            'answerOptions.*.id.integer' => ':attribute phải là số nguyên',
            'answerOptions.*.id.exists' => ':attribute không tồn tại trong hệ thống',

            'answerOptions.*.option_content.required_with' => ':attribute không được để trống khi cập nhật danh sách câu trả lời',
            'answerOptions.*.option_content.string' => ':attribute phải là chuỗi ký tự',

            'answerOptions.*.is_correct_answer.required_with' => ':attribute không được để trống khi cập nhật danh sách câu trả lời',
            'answerOptions.*.is_correct_answer.boolean' => ':attribute phải là kiểu đúng/sai',
        ];
    }

    public function attributes()
    {
        return [
            'subject_id' => 'Mã môn học',
            'chapter_id' => 'Mã chương',
            'difficulty_id' => 'Mã độ khó',
            'creator_id' => 'Mã người tạo',
            'question_content' => 'Nội dung câu hỏi',
            'image_url' => 'Đường dẫn ảnh',
            'answer_explanation' => 'Giải thích đáp án',
            'default_score' => 'Điểm mặc định',
            'status' => 'Trạng thái',
            'is_deleted' => 'Trạng thái xóa',
            'answerOptions' => 'Danh sách câu trả lời',
            'answerOptions.*.id' => 'Mã câu trả lời',
            'answerOptions.*.option_content' => 'Nội dung lựa chọn',
            'answerOptions.*.is_correct_answer' => 'Trạng thái đáp án đúng',
        ];
    }
}
