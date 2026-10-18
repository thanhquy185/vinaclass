<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreSubjectRequest extends FormRequest
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
            'subject_name' => ['required', 'string', 'max:150'],
            'subject_code' => ['required', 'string', 'unique:subjects,subject_code'],
            'credit_count' => ['required', 'integer', 'min:1'],
            'theory_hours' => ['nullable', 'integer', 'min:0'],
            'practice_hours' => ['nullable', 'integer', 'min:0'],
            'is_deleted' => ['sometimes', 'boolean'],
        ];
    }

    public function messages()
    {
        return [
            'subject_name.required' => ':attribute không được để trống',
            'subject_name.string' => ':attribute phải là chuỗi ký tự',
            'subject_name.max' => ':attribute không được vượt quá 150 ký tự',

            'subject_code.required' => ':attribute không được để trống',
            'subject_code.string' => ':attribute phải là chuỗi ký tự',
            'subject_code.unique' => ':attribute đã tồn tại',

            'credit_count.required' => ':attribute không được để trống',
            'credit_count.integer' => ':attribute phải là số nguyên',
            'credit_count.min' => ':attribute phải lớn hơn hoặc bằng 1',

            'theory_hours.integer' => ':attribute phải là số nguyên',
            'theory_hours.min' => ':attribute không hợp lệ',
            'practice_hours.integer' => ':attribute phải là số nguyên',
            'practice_hours.min' => ':attribute không hợp lệ',

            'is_deleted.boolean' => ':attribute phải là kiểu đúng/sai',
        ];
    }

    public function attributes()
    {
        return [
            'subject_name' => 'Tên môn học',
            'subject_code' => 'Mã môn học',
            'credit_count' => 'Số tín chỉ',
            'theory_hours' => 'Số tiết lý thuyết',
            'practice_hours' => 'Số tiết thực hành',
            'is_deleted' => 'Trạng thái xóa',
        ];
    }
}
