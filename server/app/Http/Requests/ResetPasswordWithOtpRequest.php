<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class ResetPasswordWithOtpRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'public_id' => ['required', 'uuid'],
            'verification_token' => ['required', 'string', 'size:64'],
            'new_password' => [
                'required',
                Password::min(6)->letters()->numbers()->mixedCase(),
                'confirmed',
            ],
        ];
    }
}
