<?php

namespace App\Http\Requests;

use App\Models\Role;
use App\Models\User;
use App\Policies\RolePolicy;
use Illuminate\Validation\Rule;

class UpdateRoleRequest extends RoleFormRequest
{
    public function authorize(RolePolicy $policy): bool
    {
        $actor = $this->user();
        $role = $this->route('role');

        return $actor instanceof User
            && $role instanceof Role
            && $policy->update($actor, $role);
    }

    protected function roleNameRules(): array
    {
        return [
            'sometimes',
            'required',
            'string',
            'max:255',
            Rule::unique('roles', 'role_name')->ignore($this->route('role')->id),
        ];
    }
}
