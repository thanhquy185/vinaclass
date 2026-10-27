<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCourseGroupMaterialRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('update', $this->route('material')) ?? false;
    }

    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'required', 'string', 'max:180'],
            'description' => ['sometimes', 'nullable', 'string', 'max:5000'],
            'file' => [
                'sometimes',
                'required',
                'file',
                'max:25600',
                'mimes:pdf,doc,docx,ppt,pptx,xls,xlsx,csv,txt,zip,png,jpg,jpeg',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'title.required' => 'Vui lòng nhập tiêu đề tài liệu.',
            'title.max' => 'Tiêu đề tài liệu không được vượt quá 180 ký tự.',
            'description.max' => 'Mô tả không được vượt quá 5.000 ký tự.',
            'file.max' => 'Tệp tài liệu không được vượt quá 25 MB.',
            'file.mimes' => 'Định dạng tệp không được hỗ trợ.',
        ];
    }
}
