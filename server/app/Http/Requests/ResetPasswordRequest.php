<?php

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class ResetPasswordRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize(): bool
    {
        $actor = $this->user();
        $target = $this->route('user');

        return $actor instanceof User
            && $target instanceof User
            && $actor->can('resetPassword', $target);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'new_password' => [
                'required',
                Password::min(6)
                    ->letters()
                    ->numbers()
                    ->mixedCase(),
                'confirmed',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'new_password.required' => 'Vui lòng nhập mật khẩu mới.',
            'new_password.min' => 'Mật khẩu mới phải có ít nhất 6 ký tự.',
            'new_password.letters' => 'Mật khẩu mới phải chứa ít nhất một chữ cái.',
            'new_password.numbers' => 'Mật khẩu mới phải chứa ít nhất một số.',
            'new_password.mixed' => 'Mật khẩu mới phải có cả chữ hoa và chữ thường.',
            'new_password.confirmed' => 'Xác nhận mật khẩu không khớp.',
        ];
    }

    public function attributes(): array
    {
        return [
            'new_password' => 'Mật khẩu mới',
            'new_password_confirmation' => 'Xác nhận mật khẩu mới',
        ];
    }
}
