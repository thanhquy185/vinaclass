<?php

namespace App\Policies;

use App\Models\Role;
use App\Models\RoleDetail;
use App\Models\User;
use App\Services\Authorization\PermissionAuthorizer;

class RolePolicy
{
    public function __construct(
        private PermissionAuthorizer $authorizer
    ) {
    }

    public function viewAny(User $actor): bool
    {
        return $this->isActive($actor) && $this->allowsView($actor);
    }

    public function view(User $actor, Role $role): bool
    {
        return $this->isActive($actor) && $this->allowsView($actor);
    }

    public function create(User $actor): bool
    {
        return $this->isActive($actor) && $actor->hasRoleCode('ADMIN');
    }

    public function update(User $actor, Role $role): bool
    {
        return $this->isActive($actor) && $actor->hasRoleCode('ADMIN');
    }

    public function delete(User $actor, Role $role): bool
    {
        return $this->isActive($actor) && $actor->hasRoleCode('ADMIN');
    }

    private function allowsView(User $actor): bool
    {
        if ($actor->hasRoleCode('ADMIN')) {
            return true;
        }

        if (config('authorization.driver', 'legacy') === 'v2') {
            return $this->authorizer->allowsFunctionAction($actor, 'nhom_quyen', 'view');
        }

        return $actor->role_id && RoleDetail::query()
            ->where('role_id', $actor->role_id)
            ->where('action', 'VIEW')
            ->whereHas('function', fn ($query) => $query
                ->where('function_name', 'nhom_quyen')
                ->where('is_deleted', false))
            ->exists();
    }

    private function isActive(User $user): bool
    {
        return !$user->is_locked && !$user->is_deleted;
    }
}
