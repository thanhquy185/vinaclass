<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreChapterRequest extends FormRequest
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
            'chapter_name' => ['required', 'string', 'max:100'],
            'subject_id' => ['required', 'integer', 'exists:subjects,id'],
            'is_deleted' => ['nullable', 'boolean'],
        ];
    }

    public function messages()
    {
        return [
            'chapter_name.required' => ':attribute là bắt buộc',
            'chapter_name.string' => ':attribute phải là chuỗi ký tự',
            'chapter_name.max' => ':attribute không được vượt quá 100 ký tự',
            'subject_id.required' => ':attribute là bắt buộc',
            'subject_id.integer' => ':attribute phải là số nguyên',
            'subject_id.exists' => ':attribute không tồn tại trong hệ thống',
            'is_deleted.boolean' => ':attribute phải là kiểu đúng/sai',
        ];
    }

    public function attributes()
    {
        return [
            'chapter_name' => 'Tên chương',
            'subject_id' => 'Mã môn học',
            'is_deleted' => 'Trạng thái xóa',
        ];
    }
}
