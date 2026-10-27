<?php

namespace App\Policies;

use App\Models\User;
use App\Services\Authorization\PermissionAuthorizer;

class DashboardPolicy
{
    public function __construct(private PermissionAuthorizer $authorizer)
    {
    }

    public function viewAdminSummary(User $actor): bool
    {
        return !$actor->is_locked
            && !$actor->is_deleted
            && $actor->hasRoleCode('ADMIN');
    }

    public function viewStatistics(User $actor, string $functionName): bool
    {
        if ($actor->is_locked || $actor->is_deleted) {
            return false;
        }

        return $this->authorizer->allowsFunctionAction($actor, $functionName, 'VIEW');
    }
}
