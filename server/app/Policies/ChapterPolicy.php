<?php

namespace App\Policies;

use App\Models\Chapter;
use App\Models\Subject;
use App\Models\User;
use App\Services\Authorization\PermissionAuthorizer;
use App\Services\RoleService;

class ChapterPolicy
{
    public function __construct(
        private PermissionAuthorizer $authorizer,
        private RoleService $roleService
    ) {
    }

    public function viewCatalog(User $user): bool
    {
        if (
            $user->is_locked
            || $user->is_deleted
        ) {
            return false;
        }

        return $user->hasRoleCode('ADMIN', 'STUDENT')
            || $this->allowsAction($user, 'chuong', 'view');
    }

    public function view(User $user, Chapter $chapter): bool
    {
        if (!$this->viewCatalog($user) || $chapter->is_deleted) {
            return false;
        }

        $subject = $chapter->subject;
        if (!$subject || $subject->is_deleted) {
            return false;
        }

        if ($user->hasRoleCode('ADMIN', 'STUDENT')) {
            return true;
        }

        if ($user->isCustomRole()) {
            return true;
        }

        return $user->hasRoleCode('TEACHER')
            && $user->assignedSubjects()
                ->whereKey($subject->id)
                ->where('subjects.is_deleted', false)
                ->exists();
    }

    public function viewForSubject(User $user, Subject $subject): bool
    {
        if ($subject->is_deleted || !$this->viewCatalog($user)) {
            return false;
        }

        if ($user->hasRoleCode('ADMIN', 'STUDENT')) {
            return true;
        }

        if ($user->isCustomRole()) {
            return true;
        }

        return $user->hasRoleCode('TEACHER')
            && $user->assignedSubjects()
                ->whereKey($subject->id)
                ->where('subjects.is_deleted', false)
                ->exists();
    }

    public function manageSubject(User $user, Subject $subject, string $action): bool
    {
        if ($subject->is_deleted || !$this->manage($user, $action)) {
            return false;
        }

        if ($user->hasRoleCode('ADMIN')) {
            return true;
        }

        if ($user->isCustomRole()) {
            return true;
        }

        $isAssigned = $user->assignedSubjects()
            ->whereKey($subject->id)
            ->where('subjects.is_deleted', false)
            ->exists();

        return $isAssigned;
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
            || $this->allowsAction($user, 'chuong', $action);
    }

    private function allowsAction(User $user, string $function, string $action): bool
    {
        if (config('authorization.driver', 'legacy') === 'v2') {
            return $this->authorizer->allowsFunctionAction($user, $function, $action);
        }

        return $user->role_id
            && $this->roleService->hasRole((int) $user->role_id, $action . '_' . $function);
    }
}
