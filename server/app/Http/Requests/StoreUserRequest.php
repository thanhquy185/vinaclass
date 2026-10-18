<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class StoreUserRequest extends FormRequest
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
            "full_name" => ["required", "string", "max:255"],
            "email" => ["required", "string", "email", "unique:users,email"],
            "password" => [
                "required",
                Password::min(6)
                    ->letters()
                    ->numbers()
                    ->mixedCase(),
            ],
            "role_id" => ["nullable", "integer", "exists:roles,id"],
            "phone" => ["nullable", "string", "max:20"],
            "username" => ["required", "string", "unique:users,username"],
            "date_of_birth" => ["nullable", "date_format:Y-m-d", "before:today"],
            "is_female" => ["required", "boolean"],
            "is_student" => ["required", "boolean"],
            "is_locked" => ["sometimes", "boolean"],
            "ggid" => ["sometimes", "nullable", "string"],
            "avatar_url" => ["sometimes", "nullable", "string"],
            "is_deleted" => ["sometimes", "boolean"],
        ];
    }

    public function messages()
    {
        return [
            "full_name.required" => ":attribute không được để trống",
            "full_name.string" => ":attribute phải là chuỗi ký tự",
            "full_name.max" => ":attribute không được vượt quá 255 ký tự",

            "email.required" => ":attribute không được để trống",
            "email.email" => ":attribute không đúng định dạng",
            "email.unique" => ":attribute đã tồn tại",

            "password.required" => ":attribute không được để trống",

            "role_id.integer" => ":attribute phải là số nguyên",
            "role_id.exists" => ":attribute không tồn tại trong hệ thống",

            "phone.string" => ":attribute phải là chuỗi ký tự",
            "phone.max" => ":attribute không được vượt quá 20 ký tự",

            "username.required" => ":attribute không được để trống",
            "username.string" => ":attribute phải là chuỗi ký tự",
            "username.unique" => ":attribute đã tồn tại",

            "date_of_birth.date_format" => ":attribute phải có định dạng YYYY-MM-DD",
            "date_of_birth.before" => ":attribute phải trước ngày hiện tại",

            "is_female.required" => ":attribute không được để trống",
            "is_female.boolean" => ":attribute phải là kiểu đúng/sai",
            "is_student.required" => ":attribute không được để trống",
            "is_student.boolean" => ":attribute phải là kiểu đúng/sai",
            "is_locked.boolean" => ":attribute phải là kiểu đúng/sai",
            "ggid.string" => ":attribute phải là chuỗi ký tự",
            "avatar_url.string" => ":attribute phải là chuỗi ký tự",
            "is_deleted.boolean" => ":attribute phải là kiểu đúng/sai",
        ];
    }

    public function attributes()
    {
        return [
            "full_name" => "Họ và tên",
            "email" => "Email",
            "password" => "Mật khẩu",
            "role_id" => "Mã vai trò",
            "phone" => "Số điện thoại",
            "username" => "Tên đăng nhập",
            "date_of_birth" => "Ngày sinh",
            "is_female" => "Giới tính nữ",
            "is_student" => "Là sinh viên",
            "is_locked" => "Trạng thái khóa",
            "ggid" => "Google ID",
            "avatar_url" => "Đường dẫn ảnh đại diện",
            "is_deleted" => "Trạng thái xóa",
        ];
    }
}
