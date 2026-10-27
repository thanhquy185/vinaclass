<?php

namespace App\Http\Requests;

use App\Models\CourseGroup;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class JoinGroupRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize(): bool
    {
        return $this->user()?->can('join', CourseGroup::class) ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            "join_code" => [
                "required",
                "string",
                "max:20",
                Rule::exists('course_groups', 'join_code')->where('is_deleted', false),
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'join_code.required' => 'Vui lòng nhập mã mời.',
            'join_code.string' => 'Mã mời không hợp lệ.',
            'join_code.max' => 'Mã mời không được vượt quá 20 ký tự.',
            'join_code.exists' => 'Mã mời không tồn tại.',
        ];
    }

    public function attributes(): array
    {
        return [
            'join_code' => 'Mã mời',
        ];
    }
}
