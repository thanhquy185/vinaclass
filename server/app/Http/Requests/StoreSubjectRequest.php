<?php

namespace App\Http\Requests;

use App\Models\User;
use App\Policies\SubjectPolicy;
use Illuminate\Foundation\Http\FormRequest;

class StoreSubjectRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize(SubjectPolicy $policy): bool
    {
        $actor = $this->user();

        return $actor instanceof User && $policy->manage($actor, 'create');
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
            'subject_code' => ['required', 'string', 'max:50', 'unique:subjects,subject_code'],
            'credit_count' => ['required', 'integer', 'min:1'],
            'theory_hours' => ['required', 'integer', 'min:0'],
            'practice_hours' => ['required', 'integer', 'min:0'],
            'chapters' => ['sometimes', 'array'],
            'chapters.*.chapter_name' => ['required', 'string', 'max:100'],
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
            'subject_code.max' => ':attribute không được vượt quá 50 ký tự',
            'subject_code.unique' => ':attribute đã tồn tại',

            'credit_count.required' => ':attribute không được để trống',
            'credit_count.integer' => ':attribute phải là số nguyên',
            'credit_count.min' => ':attribute phải lớn hơn hoặc bằng 1',

            'theory_hours.required' => ':attribute không được để trống',
            'theory_hours.integer' => ':attribute phải là số nguyên',
            'theory_hours.min' => ':attribute không hợp lệ',
            'practice_hours.required' => ':attribute không được để trống',
            'practice_hours.integer' => ':attribute phải là số nguyên',
            'practice_hours.min' => ':attribute không hợp lệ',
            'chapters.array' => 'Danh sách chương phải là một mảng hợp lệ.',
            'chapters.*.chapter_name.required' => 'Tên chương không được để trống.',
            'chapters.*.chapter_name.string' => 'Tên chương phải là chuỗi ký tự.',
            'chapters.*.chapter_name.max' => 'Tên chương không được vượt quá 100 ký tự.',

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
            'chapters' => 'Danh sách chương',
            'chapters.*.chapter_name' => 'Tên chương',
        ];
    }
}
