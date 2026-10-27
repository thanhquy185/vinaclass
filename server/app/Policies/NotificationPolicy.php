<?php

namespace App\Policies;

use App\Models\CourseGroup;
use App\Models\Notification;
use App\Models\User;
use App\Services\Authorization\PermissionAuthorizer;
use App\Services\RoleService;

class NotificationPolicy
{
    public function __construct(
        private PermissionAuthorizer $authorizer,
        private RoleService $roleService
    ) {
    }

    public function create(User $user): bool
    {
        if ($user->is_locked || $user->is_deleted || $user->hasRoleCode('STUDENT')) {
            return false;
        }

        return $user->hasRoleCode('ADMIN') || $this->allows($user, 'create');
    }

    public function viewCatalog(User $user): bool
    {
        if ($user->is_locked || $user->is_deleted) {
            return false;
        }

        return $user->hasRoleCode('ADMIN') || $this->allows($user, 'view');
    }

    public function publish(User $user): bool
    {
        if ($user->is_locked || $user->is_deleted || $user->hasRoleCode('STUDENT')) {
            return false;
        }

        return $user->hasRoleCode('ADMIN') || $this->allows($user, 'publish');
    }

    public function view(User $user, Notification $notification): bool
    {
        if ($user->is_locked || $user->is_deleted) {
            return false;
        }

        if ($user->hasRoleCode('ADMIN')) {
            return true;
        }

        if ($user->hasRoleCode('STUDENT')) {
            return $this->allows($user, 'view')
                && $notification->status
                && $notification->courseGroups()
                    ->where('course_groups.is_deleted', false)
                    ->whereHas('students', fn ($students) => $students
                        ->where('users.id', $user->id)
                        ->where('users.is_locked', false)
                        ->where('users.is_deleted', false))
                    ->exists();
        }

        if ($user->isCustomRole()) {
            return $this->allows($user, 'view');
        }

        if (!$user->hasRoleCode('TEACHER') || !$this->allows($user, 'view')) {
            return false;
        }

        return (int) $notification->sender_id === (int) $user->id
            || $notification->courseGroups()
                ->where('course_groups.teacher_id', $user->id)
                ->where('course_groups.is_deleted', false)
                ->exists();
    }

    public function manage(User $user, Notification $notification, string $action): bool
    {
        if ($user->is_locked || $user->is_deleted || $user->hasRoleCode('STUDENT')) {
            return false;
        }

        if ($user->hasRoleCode('ADMIN')) {
            return true;
        }

        if ($user->isCustomRole()) {
            return $this->allows($user, $action);
        }

        if (
            (int) $notification->sender_id !== (int) $user->id
            || !$this->allows($user, $action)
        ) {
            return false;
        }

        $activeGroups = $notification->courseGroups()->where('course_groups.is_deleted', false);
        $groupCount = (clone $activeGroups)->count();

        return $groupCount > 0
            && (clone $activeGroups)->where('course_groups.teacher_id', $user->id)->count() === $groupCount;
    }

    public function update(User $user, Notification $notification, array $changes = []): bool
    {
        $action = $this->updateAction($changes);
        if (!$this->manage($user, $notification, $action)) {
            return false;
        }

        return $action === 'publish'
            || !array_key_exists('status', $changes)
            || !filter_var($changes['status'], FILTER_VALIDATE_BOOLEAN)
            || $this->publish($user);
    }

    private function updateAction(array $changes): string
    {
        if (config('authorization.driver', 'legacy') !== 'v2') {
            return 'update';
        }

        $isPublishOnly = count($changes) === 1
            && array_key_exists('status', $changes)
            && filter_var($changes['status'], FILTER_VALIDATE_BOOLEAN);

        return $isPublishOnly ? 'publish' : 'update';
    }

    public function manageGroups(User $user, array $groupIds, string $action): bool
    {
        if (
            $user->is_locked
            || $user->is_deleted
            || $user->hasRoleCode('STUDENT')
            || (!$user->hasRoleCode('ADMIN') && !$this->allows($user, $action))
        ) {
            return false;
        }

        $uniqueIds = array_values(array_unique(array_map('intval', $groupIds)));
        $groups = CourseGroup::query()
            ->whereIn('id', $uniqueIds)
            ->where('is_deleted', false);

        if ($user->hasRoleCode('TEACHER')) {
            $groups->where('teacher_id', $user->id);
        }

        return $uniqueIds !== [] && $groups->count() === count($uniqueIds);
    }

    private function allows(User $user, string $action): bool
    {
        if ($user->hasRoleCode('ADMIN')) {
            return true;
        }

        if (config('authorization.driver', 'legacy') === 'v2') {
            return $this->authorizer->allowsFunctionAction($user, 'thong_bao', $action);
        }

        if ($user->role_id === null) {
            return $user->hasRoleCode('STUDENT') && $action === 'view';
        }

        if ($action === 'publish') {
            return $this->roleService->hasRole((int) $user->role_id, 'create_thong_bao')
                || $this->roleService->hasRole((int) $user->role_id, 'update_thong_bao');
        }

        return $this->roleService->hasRole((int) $user->role_id, $action . '_thong_bao');
    }
}
