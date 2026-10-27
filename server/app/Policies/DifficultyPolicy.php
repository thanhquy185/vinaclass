<?php

namespace App\Policies;

use App\Models\Difficulty;
use App\Models\User;
use App\Services\Authorization\PermissionAuthorizer;
use App\Services\RoleService;

class DifficultyPolicy
{
    public function __construct(
        private PermissionAuthorizer $authorizer,
        private RoleService $roleService
    ) {
    }

    public function viewCatalog(User $user): bool
    {
        if ($user->is_locked || $user->is_deleted) {
            return false;
        }

        if ($user->hasRoleCode('ADMIN', 'STUDENT')) {
            return true;
        }

        if ($user->hasRoleCode('TEACHER')) {
            if (
                config('authorization.driver', 'legacy') === 'v2'
                && $this->authorizer->explicitlyDeniesFunctionAction($user, 'do_kho', 'view')
            ) {
                return false;
            }

            return $this->allowsAction($user, 'do_kho', 'view')
                || $this->allowsAction($user, 'cau_hoi', 'view')
                || $this->allowsAction($user, 'de_thi', 'view');
        }

        return $this->allowsAction($user, 'do_kho', 'view')
            || $this->allowsAction($user, 'cau_hoi', 'view')
            || $this->allowsAction($user, 'de_thi', 'view');
    }

    public function view(User $user, Difficulty $difficulty): bool
    {
        return $this->viewCatalog($user);
    }

    public function manage(User $user, string $action): bool
    {
        if (
            $user->is_locked
            || $user->is_deleted
            || $user->hasRoleCode('STUDENT')
        ) {
            return false;
        }

        return $user->hasRoleCode('ADMIN')
            || $this->allowsAction($user, 'do_kho', $action);
    }

    private function allowsAction(User $user, string $function, string $action): bool
    {
        if (config('authorization.driver', 'legacy') === 'v2') {
            return $this->authorizer->allowsFunctionAction($user, $function, $action);
        }

        return $user->role_id
            && $this->roleService->hasRole(
                (int) $user->role_id,
                $action . '_' . $function
            );
    }
}
