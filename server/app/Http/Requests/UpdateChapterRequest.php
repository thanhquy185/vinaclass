<?php

namespace App\Http\Requests;

use App\Models\Subject;
use App\Models\User;
use App\Policies\ChapterPolicy;
use Illuminate\Foundation\Http\FormRequest;

class UpdateChapterRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize(ChapterPolicy $policy): bool
    {
        $actor = $this->user();
        $subject = $this->route('subject');

        return $actor instanceof User
            && $subject instanceof Subject
            && $policy->manageSubject($actor, $subject, 'update');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules()
    {
        return [
            'chapters' => ['present', 'array'],
            'chapters.*.chapter_name' => ['required', 'string', 'max:100'],
            'chapters.*.id' => ['sometimes', 'integer', 'distinct', 'exists:chapters,id'],
        ];
    }

    public function messages()
    {
        return [
            'chapters.present' => 'Danh sách chương là bắt buộc.',
            'chapters.array' => 'Danh sách chương phải là một mảng hợp lệ.',

            'chapters.*.chapter_name.required' => 'Tên chương không được để trống.',
            'chapters.*.chapter_name.string' => 'Tên chương phải là chuỗi ký tự.',
            'chapters.*.chapter_name.max' => 'Tên chương không được vượt quá 100 ký tự.',
        ];
    }

    public function attributes()
    {
        return [
            'chapters' => 'Danh sách chương',
            'chapters.*.chapter_name' => 'Tên chương',
        ];
    }
}
