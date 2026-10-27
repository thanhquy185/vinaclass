<?php

namespace App\Http\Requests;

use App\Models\User;
use App\Policies\PermissionAdministrationPolicy;
use Illuminate\Foundation\Http\FormRequest;

class SyncRolePermissionsRequest extends FormRequest
{
    public function authorize(PermissionAdministrationPolicy $policy): bool
    {
        $actor = $this->user();

        return $actor instanceof User && $policy->manage($actor);
    }

    public function rules(): array
    {
        return [
            'permission_ids' => ['present', 'array'],
            'permission_ids.*' => ['required', 'integer', 'distinct', 'exists:permissions,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'permission_ids.present' => 'Vui lòng gửi danh sách quyền.',
            'permission_ids.array' => 'Danh sách quyền không hợp lệ.',
            'permission_ids.*.required' => 'Mã quyền không được để trống.',
            'permission_ids.*.integer' => 'Mã quyền phải là số nguyên.',
            'permission_ids.*.distinct' => 'Danh sách không được chứa quyền trùng lặp.',
            'permission_ids.*.exists' => 'Quyền được chọn không tồn tại.',
        ];
    }
}
