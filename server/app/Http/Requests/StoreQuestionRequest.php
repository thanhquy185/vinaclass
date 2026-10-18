<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreQuestionRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'subject_id' => ['required', 'integer', 'exists:subjects,id'],
            'chapter_id' => ['nullable', 'integer', 'exists:chapters,id'],
            'difficulty_id' => ['nullable', 'integer', 'exists:difficulties,id'],
            'creator_id' => ['required', 'integer', 'exists:users,id'],
            'question_content' => ['required', 'string'],
            'image_url' => ['nullable', 'string'],
            'answer_explanation' => ['nullable', 'string'],
            'default_score' => ['nullable', 'numeric', 'min:0'],
            'status' => ['nullable', 'in:public,private,archive'],
            'is_deleted' => ['nullable', 'boolean'],
            'answerOptions' => ['required', 'array', 'min:2'],
            'answerOptions.*.option_content' => ['required', 'string'],
            'answerOptions.*.is_correct_answer' => ['required', 'boolean'],
        ];
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

            'creator_id.required' => ':attribute không được để trống',
            'creator_id.integer' => ':attribute phải là số nguyên',
            'creator_id.exists' => ':attribute không tồn tại trong hệ thống',

            'question_content.required' => ':attribute không được để trống',
            'question_content.string' => ':attribute phải là chuỗi ký tự',

            'image_url.string' => ':attribute phải là chuỗi ký tự',
            'answer_explanation.string' => ':attribute phải là chuỗi ký tự',

            'default_score.numeric' => ':attribute phải là số',
            'default_score.min' => ':attribute phải lớn hơn hoặc bằng 0',

            'status.in' => ':attribute chỉ nhận một trong các giá trị: public, private, archive',
            'is_deleted.boolean' => ':attribute phải là kiểu đúng/sai',

            'answerOptions.required' => ':attribute không được để trống',
            'answerOptions.array' => ':attribute phải là mảng',
            'answerOptions.min' => ':attribute phải có ít nhất 2 lựa chọn',

            'answerOptions.*.option_content.required' => ':attribute không được để trống',
            'answerOptions.*.option_content.string' => ':attribute phải là chuỗi ký tự',

            'answerOptions.*.is_correct_answer.required' => ':attribute không được để trống',
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
            'answerOptions.*.option_content' => 'Nội dung lựa chọn',
            'answerOptions.*.is_correct_answer' => 'Trạng thái đáp án đúng',
        ];
    }
}
