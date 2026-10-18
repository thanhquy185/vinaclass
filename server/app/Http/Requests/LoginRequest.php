<?php

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;

class LoginRequest extends FormRequest
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
            'login' => [
                'required',
                'string',
                function ($attribute, $value, $fail) {
                    $exists = User::where('email', $value)
                        ->orWhere('username', $value)
                        ->exists();
                    if (!$exists) {
                        $fail('Email hoặc tên đăng nhập không tồn tại.');
                    }
                },
            ],
            'password' => [
                'required',
                'string',
            ],
        ];
    }

    public function messages()
    {
        return [
            'login.required' => 'Vui lòng nhập email hoặc tên đăng nhập.',
            'login.string' => 'Email hoặc tên đăng nhập không hợp lệ.',
            'password.required' => 'Vui lòng nhập mật khẩu.',
            'password.string' => 'Mật khẩu không hợp lệ.',
        ];
    }

    public function attributes()
    {
        return [
            'login' => 'Email hoặc tên đăng nhập',
            'password' => 'Mật khẩu',
        ];
    }
}
