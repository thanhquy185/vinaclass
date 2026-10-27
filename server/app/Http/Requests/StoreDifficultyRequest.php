<?php
namespace App\Http\Requests;

use App\Models\User;
use App\Policies\DifficultyPolicy;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreDifficultyRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize(DifficultyPolicy $policy): bool
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
            'difficulty_name' => [
                'required',
                'string',
                'max:100',
                Rule::unique('difficulties', 'difficulty_name'),
            ],
        ];
    }

    public function messages()
    {
        return [
            'difficulty_name.string' => ':attribute phải là chuỗi',
            'difficulty_name.max' => ':attribute có độ dài tối đa là 100',
            'difficulty_name.required' => ':attribute không được để trống',
            'difficulty_name.unique' => ':attribute đã tồn tại trên hệ thống',
        ];
    }

    public function attributes()
    {
        return [
            'difficulty_name' => 'Tên độ khó',
        ];
    }
}
