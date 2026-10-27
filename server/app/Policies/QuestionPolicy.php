<?php

namespace App\Policies;

use App\Models\Question;
use App\Models\Subject;
use App\Models\User;
use App\Services\Authorization\PermissionAuthorizer;
use App\Services\RoleService;

class QuestionPolicy
{
    public function __construct(
        private PermissionAuthorizer $authorizer,
        private RoleService $roleService
    ) {
    }

    public function accessBank(User $user): bool
    {
        if ($user->is_locked || $user->is_deleted || $user->hasRoleCode('STUDENT')) {
            return false;
        }

        return $user->hasRoleCode('ADMIN') || $this->allows($user, 'view');
    }

    public function view(User $user, Question $question): bool
    {
        if (
            $question->is_deleted
            || $user->is_locked
            || $user->is_deleted
            || $user->hasRoleCode('STUDENT')
        ) {
            return false;
        }

        if ($user->hasRoleCode('ADMIN')) {
            return true;
        }

        return $this->allows($user, 'view')
            && (!$user->hasRoleCode('TEACHER')
                || $question->status === 'public'
                || (int) $question->creator_id === (int) $user->id);
    }

    public function create(User $user): bool
    {
        if ($user->is_locked || $user->is_deleted || $user->hasRoleCode('STUDENT')) {
            return false;
        }

        return $user->hasRoleCode('ADMIN') || $this->allows($user, 'create');
    }

    public function publish(User $user): bool
    {
        if ($user->is_locked || $user->is_deleted || $user->hasRoleCode('STUDENT')) {
            return false;
        }

        return $user->hasRoleCode('ADMIN') || $this->allows($user, 'publish');
    }

    public function changeStatus(User $user, Question $question, string $status): bool
    {
        $action = $status === 'public' ? 'publish' : 'update';

        return $this->manage($user, $question, $action)
            && ($action !== 'publish' || $this->publish($user));
    }

    public function manage(User $user, Question $question, string $action): bool
    {
        if ($question->is_deleted || !$this->manageBank($user, $action)) {
            return false;
        }

        if ($user->hasRoleCode('ADMIN')) {
            return true;
        }

        return !$user->hasRoleCode('TEACHER')
            || ((int) $question->creator_id === (int) $user->id
                && $this->manageSubject($user, (int) $question->subject_id));
    }

    public function manageBank(User $user, string $action): bool
    {
        if ($user->is_locked || $user->is_deleted || $user->hasRoleCode('STUDENT')) {
            return false;
        }

        return $user->hasRoleCode('ADMIN') || $this->allows($user, $action);
    }

    public function manageSubject(User $user, int $subjectId): bool
    {
        $subjectIsActive = Subject::query()
            ->whereKey($subjectId)
            ->where('is_deleted', false)
            ->exists();

        if (!$subjectIsActive || $user->is_locked || $user->is_deleted) {
            return false;
        }

        if ($user->hasRoleCode('STUDENT')) {
            return false;
        }

        return !$user->hasRoleCode('TEACHER')
            || $user->assignedSubjects()
                ->whereKey($subjectId)
                ->where('subjects.is_deleted', false)
                ->exists();
    }

    public function viewTeacherQuestions(User $actor, User $teacher): bool
    {
        if (
            $actor->is_locked
            || $actor->is_deleted
            || $teacher->is_locked
            || $teacher->is_deleted
            || !$teacher->hasRoleCode('TEACHER')
        ) {
            return false;
        }

        return ($actor->hasRoleCode('ADMIN')
                || $actor->isCustomRole()
                || (int) $actor->id === (int) $teacher->id)
            && ($actor->hasRoleCode('ADMIN') || $this->allows($actor, 'view'));
    }

    private function allows(User $user, string $action): bool
    {
        if (config('authorization.driver', 'legacy') === 'v2') {
            return $this->authorizer->allowsFunctionAction($user, 'cau_hoi', $action);
        }

        if ($user->role_id === null) {
            return false;
        }

        if ($action === 'publish') {
            return $this->roleService->hasRole((int) $user->role_id, 'create_cau_hoi')
                || $this->roleService->hasRole((int) $user->role_id, 'update_cau_hoi');
        }

        return $this->roleService->hasRole(
            (int) $user->role_id,
            $action . '_cau_hoi'
        );
    }
}
