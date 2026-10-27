<?php

namespace App\Http\Requests;

use App\Models\User;
use App\Policies\PermissionAdministrationPolicy;
use Illuminate\Foundation\Http\FormRequest;

class SyncUserPermissionOverridesRequest extends FormRequest
{
    public function authorize(PermissionAdministrationPolicy $policy): bool
    {
        $actor = $this->user();

        return $actor instanceof User && $policy->manage($actor);
    }

    public function rules(): array
    {
        return [
            'overrides' => ['present', 'array'],
            'overrides.*.permission_id' => ['required', 'integer', 'distinct', 'exists:permissions,id'],
            'overrides.*.effect' => ['required', 'in:GRANT,DENY'],
        ];
    }

    public function messages(): array
    {
        return [
            'overrides.present' => 'Vui lòng gửi danh sách quyền ngoại lệ.',
            'overrides.array' => 'Danh sách quyền ngoại lệ không hợp lệ.',
            'overrides.*.permission_id.required' => 'Mã quyền không được để trống.',
            'overrides.*.permission_id.integer' => 'Mã quyền phải là số nguyên.',
            'overrides.*.permission_id.distinct' => 'Mỗi quyền chỉ được khai báo một lần.',
            'overrides.*.permission_id.exists' => 'Quyền được chọn không tồn tại.',
            'overrides.*.effect.required' => 'Vui lòng chọn cấp hoặc từ chối quyền.',
            'overrides.*.effect.in' => 'Giá trị quyền chỉ được là GRANT hoặc DENY.',
        ];
    }
}
