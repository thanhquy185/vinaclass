<?php

namespace App\Policies;

use App\Models\User;
use App\Services\Authorization\PermissionAuthorizer;
use App\Services\RoleService;

class UserPolicy
{
    public function __construct(
        private PermissionAuthorizer $authorizer,
        private RoleService $roleService
    ) {
    }

    public function viewAny(User $actor): bool
    {
        return $this->isActive($actor) && $this->allowsAction($actor, 'view');
    }

    public function createAny(User $actor): bool
    {
        return $this->isActive($actor) && $this->allowsAction($actor, 'create');
    }

    public function view(User $actor, User $target): bool
    {
        return $this->isActive($actor)
            && !$target->is_deleted
            && $this->canManageTarget($actor, $target)
            && $this->allowsAction($actor, 'view');
    }

    public function create(User $actor): bool
    {
        return $this->createAny($actor);
    }

    public function update(
        User $actor,
        User $target,
        array $changes = []
    ): bool
    {
        if (
            !$this->isActive($actor)
            || $target->is_deleted
            || !$this->canManageTarget($actor, $target)
        ) {
            return false;
        }

        $changesLock = array_key_exists('is_locked', $changes)
            && filter_var($changes['is_locked'], FILTER_VALIDATE_BOOLEAN) !== (bool) $target->is_locked;
        $changesOnlyLock = $changesLock
            && array_diff(array_keys($changes), ['is_locked']) === [];
        $hasLockPermission = !$changesLock
            || $actor->hasRoleCode('ADMIN')
            || $this->allowsAction($actor, 'lock');
        $hasRequiredActionPermission = $changesOnlyLock
            ? $hasLockPermission
            : $this->allowsAction($actor, 'update');

        if (!$hasRequiredActionPermission || !$hasLockPermission) {
            return false;
        }

        $selfLockout = (int) $actor->id === (int) $target->id
            && (!empty($changes['is_locked']) || !empty($changes['is_deleted']));

        return !$selfLockout;
    }

    public function delete(User $actor, User $target): bool
    {
        return $this->isActive($actor)
            && !$target->is_deleted
            && (int) $actor->id !== (int) $target->id
            && $this->canManageTarget($actor, $target)
            && $this->allowsAction($actor, 'delete');
    }

    public function changePassword(User $actor, User $target): bool
    {
        return $this->isActive($actor)
            && !$target->is_deleted
            && (int) $actor->id === (int) $target->id;
    }

    public function updateOwnProfile(User $actor, User $target): bool
    {
        return $this->isActive($actor)
            && !$target->is_deleted
            && (int) $actor->id === (int) $target->id;
    }

    public function resetPassword(User $actor, User $target): bool
    {
        return $this->isActive($actor)
            && !$target->is_deleted
            && $this->canManageTarget($actor, $target)
            && $this->allowsAction($actor, 'update');
    }

    private function canManageTarget(User $actor, User $target): bool
    {
        return !$this->isAdministrator($target) || $actor->hasRoleCode('ADMIN');
    }

    private function allowsAction(User $user, string $action): bool
    {
        if ($user->hasRoleCode('ADMIN')) {
            return true;
        }

        if (config('authorization.driver', 'legacy') === 'v2') {
            return $this->authorizer->allowsFunctionAction($user, 'nguoi_dung', $action);
        }

        $legacyAction = $action === 'lock' ? 'update' : $action;

        return $user->role_id
            && $this->roleService->hasRole((int) $user->role_id, $legacyAction . '_nguoi_dung');
    }

    private function isActive(User $user): bool
    {
        return !$user->is_locked && !$user->is_deleted;
    }

    private function isAdministrator(User $user): bool
    {
        return $user->hasRoleCode('ADMIN');
    }

}
