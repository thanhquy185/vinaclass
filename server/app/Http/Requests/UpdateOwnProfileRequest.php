<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateOwnProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();

        return $user !== null && $user->can('updateOwnProfile', $user);
    }

    public function rules(): array
    {
        return [
            'profile' => ['sometimes', 'array:full_name,phone,date_of_birth,is_female'],
            'full_name' => ['required_without:profile.full_name', 'string', 'max:255'],
            'profile.full_name' => ['required_without:full_name', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:20'],
            'profile.phone' => ['sometimes', 'nullable', 'string', 'max:20'],
            'date_of_birth' => ['nullable', 'date_format:Y-m-d', 'before:today'],
            'profile.date_of_birth' => ['sometimes', 'nullable', 'date_format:Y-m-d', 'before:today'],
            'is_female' => ['required_without:profile.is_female', 'boolean'],
            'profile.is_female' => ['required_without:is_female', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'full_name.required' => 'Họ và tên không được để trống.',
            'full_name.required_without' => 'Họ và tên không được để trống.',
            'full_name.max' => 'Họ và tên không được vượt quá 255 ký tự.',
            'profile.full_name.required_without' => 'Họ và tên không được để trống.',
            'profile.full_name.max' => 'Họ và tên không được vượt quá 255 ký tự.',
            'phone.max' => 'Số điện thoại không được vượt quá 20 ký tự.',
            'profile.phone.max' => 'Số điện thoại không được vượt quá 20 ký tự.',
            'date_of_birth.date_format' => 'Ngày sinh phải có định dạng YYYY-MM-DD.',
            'date_of_birth.before' => 'Ngày sinh phải trước ngày hiện tại.',
            'profile.date_of_birth.date_format' => 'Ngày sinh phải có định dạng YYYY-MM-DD.',
            'profile.date_of_birth.before' => 'Ngày sinh phải trước ngày hiện tại.',
            'is_female.required' => 'Vui lòng chọn giới tính.',
            'is_female.boolean' => 'Giới tính không hợp lệ.',
            'profile.is_female.required_without' => 'Vui lòng chọn giới tính.',
            'profile.is_female.boolean' => 'Giới tính không hợp lệ.',
        ];
    }
}
