<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class RegisterStudentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'full_name' => is_string($this->input('full_name'))
                ? trim($this->input('full_name'))
                : $this->input('full_name'),
            'student_code' => is_string($this->input('student_code'))
                ? trim($this->input('student_code'))
                : $this->input('student_code'),
            'email' => is_string($this->input('email'))
                ? mb_strtolower(trim($this->input('email')))
                : $this->input('email'),
        ]);
    }

    public function rules(): array
    {
        return [
            'full_name' => ['required', 'string', 'max:255'],
            'student_code' => [
                'required',
                'string',
                'min:4',
                'max:50',
                'regex:/^[A-Za-z0-9._-]+$/',
                'unique:users,username',
            ],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => [
                'required',
                'confirmed',
                Password::min(8)->letters()->numbers()->mixedCase(),
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'full_name.required' => 'Vui lòng nhập họ và tên.',
            'full_name.max' => 'Họ và tên không được vượt quá 255 ký tự.',
            'student_code.required' => 'Vui lòng nhập mã sinh viên.',
            'student_code.min' => 'Mã sinh viên cần có ít nhất 4 ký tự.',
            'student_code.max' => 'Mã sinh viên không được vượt quá 50 ký tự.',
            'student_code.regex' => 'Mã sinh viên chỉ được gồm chữ cái, chữ số, dấu chấm, gạch dưới hoặc gạch ngang.',
            'student_code.unique' => 'Mã sinh viên đã được sử dụng.',
            'email.required' => 'Vui lòng nhập email.',
            'email.email' => 'Email chưa đúng định dạng.',
            'email.max' => 'Email không được vượt quá 255 ký tự.',
            'email.unique' => 'Email đã được sử dụng.',
            'password.required' => 'Vui lòng nhập mật khẩu.',
            'password.confirmed' => 'Mật khẩu xác nhận chưa khớp.',
            'password.min' => 'Mật khẩu cần có ít nhất 8 ký tự.',
            'password.letters' => 'Mật khẩu cần có chữ cái.',
            'password.numbers' => 'Mật khẩu cần có chữ số.',
            'password.mixed' => 'Mật khẩu cần có cả chữ hoa và chữ thường.',
        ];
    }
}
