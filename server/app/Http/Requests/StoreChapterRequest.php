<?php

namespace App\Http\Requests;

use App\Models\User;
use App\Policies\ChapterPolicy;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreChapterRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize(ChapterPolicy $policy): bool
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
            'chapter_name' => ['required', 'string', 'max:100'],
            'subject_id' => [
                'required',
                'integer',
                Rule::exists('subjects', 'id')->where('is_deleted', false),
            ],
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
            'subject_id.exists' => ':attribute không tồn tại hoặc đã ngừng hoạt động',
        ];
    }

    public function attributes()
    {
        return [
            'chapter_name' => 'Tên chương',
            'subject_id' => 'Mã môn học',
        ];
    }
}
