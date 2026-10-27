<?php

namespace App\Policies;

use App\Models\User;

class PermissionAdministrationPolicy
{
    public function manage(User $actor): bool
    {
        return !$actor->is_locked
            && !$actor->is_deleted
            && $actor->hasRoleCode('ADMIN');
    }
}
