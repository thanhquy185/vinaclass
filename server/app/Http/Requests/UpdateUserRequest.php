<?php

namespace App\Http\Requests;

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\Rule;

class UpdateUserRequest extends FormRequest
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
            && $actor->can('update', [
                $target,
                $this->only([
                    'full_name',
                    'profile',
                    'email',
                    'role_id',
                    'phone',
                    'date_of_birth',
                    'is_female',
                    'is_locked',
                    'username',
                    'ggid',
                    'avatar_url',
                    'teacher_profile',
                    'student_profile',
                ]),
            ]);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $rules = [
            "full_name" => ["sometimes", "string", "max:255"],
            "profile" => ["sometimes", "array:full_name,phone,date_of_birth,is_female,avatar_url"],
            "profile.full_name" => ["sometimes", "string", "max:255"],
            "profile.phone" => ["sometimes", "nullable", "string", "max:20"],
            "profile.date_of_birth" => ["sometimes", "nullable", "date_format:Y-m-d", "before:today"],
            "profile.is_female" => ["sometimes", "boolean"],
            "profile.avatar_url" => ["sometimes", "nullable", "string"],

            "email" => [
                "sometimes",
                "string",
                "email",
                "max:255",
                Rule::unique('users', 'email')->ignore($this->route('user')),
            ],

            "role_id" => [
                "sometimes",
                Schema::hasColumn('users', 'is_student') ? "nullable" : "required",
                "integer",
                Rule::exists('roles', 'id')->where(
                    fn ($query) => $query->where('is_deleted', false)
                ),
            ],
            "phone" => ["sometimes", "nullable", "string", "max:20"],

            "date_of_birth" => ["sometimes", "nullable", "date_format:Y-m-d", "before:today"],

            "is_female" => ["sometimes", "boolean"],
            "is_locked" => ["sometimes", "boolean"],

            "username" => [
                "sometimes",
                "string",
                "max:255",
                Rule::unique('users', 'username')->ignore($this->route('user')),
            ],

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

        $roleCode = $this->selectedOrCurrentRoleCode();
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

    private function selectedOrCurrentRoleCode(): ?string
    {
        if ($this->except(['is_locked']) === []) {
            return null;
        }

        $roleId = $this->input('role_id');
        if ($roleId !== null) {
            if (!is_int($roleId) && (!is_string($roleId) || !ctype_digit($roleId))) {
                return null;
            }

            return Role::query()
                ->where('is_deleted', false)
                ->find($roleId)
                ?->canonicalCode();
        }

        $user = $this->route('user');

        return $user instanceof User ? $user->roleCode() : null;
    }

    public function messages(): array
    {
        return [
            "full_name.string" => ":attribute phải là chuỗi ký tự",
            "full_name.max" => ":attribute không được vượt quá 255 ký tự",
            "profile.full_name.string" => ":attribute phải là chuỗi ký tự",
            "profile.full_name.max" => ":attribute không được vượt quá 255 ký tự",
            "profile.phone.max" => ":attribute không được vượt quá 20 ký tự",
            "profile.date_of_birth.date_format" => ":attribute phải có định dạng YYYY-MM-DD",
            "profile.date_of_birth.before" => ":attribute phải trước ngày hiện tại",
            "email.email" => ":attribute không đúng định dạng",
            "email.max" => ":attribute không được vượt quá 255 ký tự",
            "email.unique" => ":attribute đã tồn tại",
            "role_id.integer" => ":attribute phải là số nguyên",
            "role_id.required" => "Vui lòng chọn vai trò.",
            "role_id.exists" => ":attribute không tồn tại trong hệ thống",
            "phone.max" => ":attribute không được vượt quá 20 ký tự",
            "date_of_birth.date_format" => ":attribute phải có định dạng YYYY-MM-DD",
            "date_of_birth.before" => ":attribute phải trước ngày hiện tại",
            "username.max" => ":attribute không được vượt quá 255 ký tự",
            "username.unique" => ":attribute đã tồn tại",
            "teacher_profile.*.max" => ":attribute không được vượt quá 255 ký tự",
            "student_profile.*.max" => ":attribute không được vượt quá 255 ký tự",
            "teacher_profile.teacher_code.required" => ":attribute không được để trống",
            "teacher_profile.department_name.required" => ":attribute không được để trống",
            "teacher_profile.academic_title.required" => ":attribute không được để trống",
            "student_profile.student_code.required" => ":attribute không được để trống",
            "student_profile.program_name.required" => ":attribute không được để trống",
            "student_profile.cohort.required" => ":attribute không được để trống",
        ];
    }

    public function attributes(): array
    {
        return [
            "full_name" => "Họ và tên",
            "profile.full_name" => "Họ và tên",
            "profile.phone" => "Số điện thoại",
            "profile.date_of_birth" => "Ngày sinh",
            "profile.is_female" => "Giới tính nữ",
            "profile.avatar_url" => "Đường dẫn ảnh đại diện",
            "email" => "Email",
            "role_id" => "Mã vai trò",
            "phone" => "Số điện thoại",
            "date_of_birth" => "Ngày sinh",
            "username" => "Tên đăng nhập",
            "teacher_profile.teacher_code" => "Mã giảng viên",
            "teacher_profile.department_name" => "Khoa/đơn vị",
            "teacher_profile.academic_title" => "Học hàm/học vị",
            "student_profile.student_code" => "Mã sinh viên",
            "student_profile.program_name" => "Chương trình đào tạo",
            "student_profile.cohort" => "Khóa",
        ];
    }
}
