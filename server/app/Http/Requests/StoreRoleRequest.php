<?php

namespace App\Http\Requests;

use App\Models\User;
use App\Policies\RolePolicy;

class StoreRoleRequest extends RoleFormRequest
{
    public function authorize(RolePolicy $policy): bool
    {
        $actor = $this->user();

        return $actor instanceof User && $policy->create($actor);
    }

    protected function roleNameRules(): array
    {
        return ['required', 'string', 'max:255', 'unique:roles,role_name'];
    }
}
