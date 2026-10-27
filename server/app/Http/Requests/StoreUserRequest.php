<?php

namespace App\Http\Requests;

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class StoreUserRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize(): bool
    {
        $actor = $this->user();

        if (!$actor instanceof User || !$actor->can('createAny', User::class)) {
            return false;
        }

        $roleId = $this->input('role_id');
        if (!is_int($roleId) && (!is_string($roleId) || !ctype_digit($roleId))) {
            return true;
        }

        $role = Role::query()
            ->where('is_deleted', false)
            ->find($roleId);

        return !$role || $actor->can('create', [User::class, $role]);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $rules = [
            "full_name" => ["required_without:profile.full_name", "string", "max:255"],
            "profile" => ["sometimes", "array:full_name,phone,date_of_birth,is_female,avatar_url"],
            "profile.full_name" => ["required_without:full_name", "string", "max:255"],
            "profile.phone" => ["sometimes", "nullable", "string", "max:20"],
            "profile.date_of_birth" => ["sometimes", "nullable", "date_format:Y-m-d", "before:today"],
            "profile.is_female" => ["required_without:is_female", "boolean"],
            "profile.avatar_url" => ["sometimes", "nullable", "string"],
            "email" => ["required", "string", "email", "max:255", "unique:users,email"],
            "password" => [
                "required",
                Password::min(6)
                    ->letters()
                    ->numbers()
                    ->mixedCase(),
            ],
            "role_id" => [
                "required",
                "integer",
                Rule::exists('roles', 'id')->where(
                    fn ($query) => $query->where('is_deleted', false)
                ),
            ],
            "phone" => ["nullable", "string", "max:20"],
            "username" => ["required", "string", "max:255", "unique:users,username"],
            "date_of_birth" => ["nullable", "date_format:Y-m-d", "before:today"],
            "is_female" => ["required_without:profile.is_female", "boolean"],
            "is_locked" => ["sometimes", "boolean"],
            "ggid" => ["sometimes", "nullable", "string"],
            "avatar_url" => ["sometimes", "nullable", "string"],
            "teacher_profile" => ["sometimes", "array"],
            "teacher_profile.teacher_code" => ["sometimes", "nullable", "string", "max:255"],
            "teacher_profile.department_name" => ["sometimes", "nullable", "string", "max:255"],
            "teacher_profile.academic_title" => ["sometimes", "nullable", "string", "max:255"],
            "student_profile" => ["sometimes", "array"],
            "student_profile.student_code" => ["sometimes", "nullable", "string", "max:255"],
            "student_profile.program_name" => ["sometimes", "nullable", "string", "max:255"],
            "student_profile.cohort" => ["sometimes", "nullable", "string", "max:255"],
        ];

        $roleCode = $this->selectedRoleCode();
        if ($roleCode === 'TEACHER') {
            $rules['teacher_profile'] = ['required', 'array'];
            $rules['teacher_profile.teacher_code'] = ['required', 'string', 'max:255'];
            $rules['teacher_profile.department_name'] = ['required', 'string', 'max:255'];
            $rules['teacher_profile.academic_title'] = ['required', 'string', 'max:255'];
        } elseif ($roleCode === 'STUDENT') {
            $rules['student_profile'] = ['required', 'array'];
            $rules['student_profile.student_code'] = ['required', 'string', 'max:255'];
            $rules['student_profile.program_name'] = ['required', 'string', 'max:255'];
            $rules['student_profile.cohort'] = ['required', 'string', 'max:255'];
        }

        return $rules;
    }

    private function selectedRoleCode(): ?string
    {
        $roleId = $this->input('role_id');
        if (!is_int($roleId) && (!is_string($roleId) || !ctype_digit($roleId))) {
            return null;
        }

        return Role::query()
            ->where('is_deleted', false)
            ->find($roleId)
            ?->canonicalCode();
    }

    public function messages()
    {
        return [
            "full_name.required" => ":attribute không được để trống",
            "full_name.required_without" => ":attribute không được để trống",
            "full_name.string" => ":attribute phải là chuỗi ký tự",
            "full_name.max" => ":attribute không được vượt quá 255 ký tự",
            "profile.full_name.required_without" => ":attribute không được để trống",
            "profile.full_name.max" => ":attribute không được vượt quá 255 ký tự",
            "profile.phone.max" => ":attribute không được vượt quá 20 ký tự",
            "profile.date_of_birth.date_format" => ":attribute phải có định dạng YYYY-MM-DD",
            "profile.date_of_birth.before" => ":attribute phải trước ngày hiện tại",
            "profile.is_female.required_without" => "Vui lòng chọn giới tính",
            "profile.is_female.boolean" => ":attribute phải là kiểu đúng/sai",
            "teacher_profile.teacher_code.required" => ":attribute không được để trống",
            "teacher_profile.department_name.required" => ":attribute không được để trống",
            "teacher_profile.academic_title.required" => ":attribute không được để trống",
            "student_profile.student_code.required" => ":attribute không được để trống",
            "student_profile.program_name.required" => ":attribute không được để trống",
            "student_profile.cohort.required" => ":attribute không được để trống",

            "email.required" => ":attribute không được để trống",
            "email.email" => ":attribute không đúng định dạng",
            "email.max" => ":attribute không được vượt quá 255 ký tự",
            "email.unique" => ":attribute đã tồn tại",

            "password.required" => ":attribute không được để trống",
            "password.min" => ":attribute phải có ít nhất 6 ký tự",
            "password.letters" => ":attribute phải chứa chữ cái",
            "password.numbers" => ":attribute phải chứa số",
            "password.mixed" => ":attribute phải có cả chữ hoa và chữ thường",

            "role_id.integer" => ":attribute phải là số nguyên",
            "role_id.required" => "Vui lòng chọn vai trò",
            "role_id.exists" => ":attribute không tồn tại trong hệ thống",

            "phone.string" => ":attribute phải là chuỗi ký tự",
            "phone.max" => ":attribute không được vượt quá 20 ký tự",

            "username.required" => ":attribute không được để trống",
            "username.string" => ":attribute phải là chuỗi ký tự",
            "username.max" => ":attribute không được vượt quá 255 ký tự",
            "username.unique" => ":attribute đã tồn tại",

            "date_of_birth.date_format" => ":attribute phải có định dạng YYYY-MM-DD",
            "date_of_birth.before" => ":attribute phải trước ngày hiện tại",

            "is_female.required" => ":attribute không được để trống",
            "is_female.boolean" => ":attribute phải là kiểu đúng/sai",
            "is_locked.boolean" => ":attribute phải là kiểu đúng/sai",
            "ggid.string" => ":attribute phải là chuỗi ký tự",
            "avatar_url.string" => ":attribute phải là chuỗi ký tự",
        ];
    }

    public function attributes()
    {
        return [
            "full_name" => "Họ và tên",
            "profile.full_name" => "Họ và tên",
            "profile.phone" => "Số điện thoại",
            "profile.date_of_birth" => "Ngày sinh",
            "profile.is_female" => "Giới tính nữ",
            "profile.avatar_url" => "Đường dẫn ảnh đại diện",
            "email" => "Email",
            "password" => "Mật khẩu",
            "role_id" => "Mã vai trò",
            "phone" => "Số điện thoại",
            "username" => "Tên đăng nhập",
            "date_of_birth" => "Ngày sinh",
            "is_female" => "Giới tính nữ",
            "is_locked" => "Trạng thái khóa",
            "ggid" => "Google ID",
            "avatar_url" => "Đường dẫn ảnh đại diện",
            "teacher_profile.teacher_code" => "Mã giảng viên",
            "teacher_profile.department_name" => "Khoa/đơn vị",
            "teacher_profile.academic_title" => "Học hàm/học vị",
            "student_profile.student_code" => "Mã sinh viên",
            "student_profile.program_name" => "Chương trình đào tạo",
            "student_profile.cohort" => "Khóa",
        ];
    }
}
