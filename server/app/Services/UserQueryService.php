<?php

namespace App\Services;

use App\Models\User;
use App\Models\Role;
use App\Policies\UserPolicy;
use Illuminate\Support\Facades\Schema;

class UserQueryService
{
    public function __construct(
        private UserPolicy $userPolicy,
        private UserProfileService $userProfileService
    ) {
    }

    public function getAll(User $actor)
    {
        abort_unless($this->userPolicy->viewAny($actor), 403);

        $users = User::query()
            ->where('is_deleted', false)
            ->with('role')
            ->get();

        return $this->userProfileService->loadPersonalProfiles($users);
    }

    public function getAssignableRoles(User $actor)
    {
        abort_unless($this->userPolicy->viewAny($actor), 403);

        return Role::query()
            ->where('is_deleted', false)
            ->orderByDesc('id')
            ->get();
    }

    public function getOne(User $user, User $actor): User
    {
        abort_unless($this->userPolicy->view($actor, $user), 403);

        $user->loadMissing('role');
        $this->userProfileService->loadPersonalProfiles($user);

        return $user;
    }

    public function getTeachers(User $actor)
    {
        abort_unless($this->userPolicy->viewAny($actor), 403);

        $hasRoleCode = Schema::hasColumn('roles', 'code');

        $teachers = User::query()
            ->where('is_locked', false)
            ->where('is_deleted', false)
            ->whereHas('role', function ($query) use ($hasRoleCode): void {
                $query->where('is_deleted', false)
                    ->where(function ($roleQuery) use ($hasRoleCode): void {
                        $roleQuery->whereRaw('LOWER(role_name) IN (?, ?, ?, ?, ?, ?, ?)', [
                            'teacher',
                            'giang vien',
                            'giang_vien',
                            'giao vien',
                            'giao_vien',
                            'giảng viên',
                            'giáo viên',
                        ]);

                        if ($hasRoleCode) {
                            $roleQuery->orWhere('code', 'TEACHER');
                        }
                    });
            })
            ->with('role')
            ->get();

        return $this->userProfileService->loadPersonalProfiles($teachers);
    }
}
