<?php

namespace App\Services;

use App\Models\Role;
use App\Models\User;
use App\Policies\UserPolicy;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\ValidationException;

class UserService
{
    public function __construct(
        private UserPolicy $userPolicy,
        private UserProfileService $userProfileService
    ) {
    }

    public function add(array $data, User $actor): User
    {
        if (empty($data['role_id'])) {
            throw ValidationException::withMessages([
                'role_id' => ['Vui lòng chọn vai trò.'],
            ]);
        }

        $actorId = (int) $actor->id;
        $roleId = (int) $data['role_id'];
        unset($data['is_student']);

        return DB::transaction(function () use ($data, $actorId, $roleId): User {
            [$actor] = $this->lockActorAndTarget($actorId);
            $assignedRole = Role::query()
                ->where('is_deleted', false)
                ->lockForUpdate()
                ->findOrFail($roleId);

            abort_unless($this->userPolicy->create($actor), 403);

            $legacyStudentFlag = $this->roleIsStudent($assignedRole);
            $dataParts = $this->userProfileService->splitPersonalData($data);
            $personalData = $this->userProfileService->personalDataForCreate(
                $dataParts['personal']
            );
            $accountData = array_merge(
                $dataParts['account'],
                $this->userProfileService->legacyIdentityAttributesForCreate($personalData),
                $this->userProfileService->legacyStudentFlagAttributesForCreate($legacyStudentFlag)
            );

            $user = User::query()->forceCreate($accountData);
            $this->userProfileService->sync(
                $user,
                $personalData,
                $dataParts['role_profiles']
            );
            $user->loadMissing('role');
            $this->userProfileService->loadPersonalProfiles($user);

            return $user;
        });
    }

    public function update(array $data, User $user, User $actor): User
    {
        $actorId = (int) $actor->id;
        $targetId = (int) $user->id;

        return DB::transaction(function () use ($data, $actorId, $targetId): User {
            [$actor, $user] = $this->lockActorAndTarget($actorId, $targetId);
            $assignedRole = array_key_exists('role_id', $data) && !empty($data['role_id'])
                ? Role::query()
                    ->where('is_deleted', false)
                    ->lockForUpdate()
                    ->findOrFail($data['role_id'])
                : null;
            abort_unless($this->userPolicy->update($actor, $user, $data), 403);
            unset($data['is_student']);

            if (
                array_key_exists('role_id', $data)
                && $data['role_id'] === null
                && (
                    !Schema::hasColumn('users', 'is_student')
                    || $user->role_id !== null
                )
            ) {
                throw ValidationException::withMessages([
                    'role_id' => ['Vui lòng chọn vai trò.'],
                ]);
            }

            $roleWasChanged = array_key_exists('role_id', $data)
                && (int) $data['role_id'] !== (int) $user->role_id;
            $legacyStudentFlag = null;
            if ($roleWasChanged) {
                $legacyStudentFlag = $assignedRole
                    ? $this->roleIsStudent($assignedRole)
                    : false;
            } elseif ($user->role_id && $user->role) {
                $legacyStudentFlag = $this->roleIsStudent($user->role);
            }

            $dataParts = $this->userProfileService->splitPersonalData($data);

            if ($dataParts['account'] !== []) {
                $user->update($dataParts['account']);
                $user->refresh();
            }

            if ($legacyStudentFlag !== null) {
                $this->userProfileService->syncLegacyStudentFlag($user, $legacyStudentFlag);
            }

            $this->userProfileService->sync(
                $user,
                $dataParts['personal'],
                $dataParts['role_profiles']
            );
            $user->loadMissing('role');
            $this->userProfileService->loadPersonalProfiles($user);

            return $user;
        });
    }

    public function updateLockStatus(User $user, bool $isLocked, User $actor): bool
    {
        $actorId = (int) $actor->id;
        $targetId = (int) $user->id;

        return DB::transaction(function () use ($actorId, $targetId, $isLocked): bool {
            [$actor, $user] = $this->lockActorAndTarget($actorId, $targetId);
            abort_unless(
                $this->userPolicy->update($actor, $user, ['is_locked' => $isLocked]),
                403
            );

            $user->is_locked = $isLocked;

            return (bool) $user->save();
        });
    }

    public function delete(User $user, User $actor): bool
    {
        $actorId = (int) $actor->id;
        $targetId = (int) $user->id;

        return DB::transaction(function () use ($actorId, $targetId): bool {
            [$actor, $user] = $this->lockActorAndTarget($actorId, $targetId);
            abort_if($user->is_deleted, 404);
            abort_unless($this->userPolicy->delete($actor, $user), 403);

            $user->is_deleted = true;

            return (bool) $user->save();
        });
    }

    public function changePassword(array $data, User $user, User $actor): bool
    {
        $actorId = (int) $actor->id;
        $targetId = (int) $user->id;

        return DB::transaction(function () use ($data, $actorId, $targetId): bool {
            [$actor, $user] = $this->lockActorAndTarget($actorId, $targetId);
            abort_unless($this->userPolicy->changePassword($actor, $user), 403);

            if (!Hash::check($data['current_password'], (string) $user->password)) {
                throw ValidationException::withMessages([
                    'current_password' => ['Mật khẩu hiện tại không chính xác.'],
                ]);
            }

            return (bool) $user->update(['password' => $data['new_password']]);
        });
    }

    public function updateOwnProfile(array $data, User $actor): User
    {
        $actorId = (int) $actor->id;

        return DB::transaction(function () use ($actorId, $data): User {
            [$actor] = $this->lockActorAndTarget($actorId);
            abort_unless($this->userPolicy->updateOwnProfile($actor, $actor), 403);
            $this->userProfileService->syncPersonal($actor, $data);
            $actor->refresh()->loadMissing('role');
            $this->userProfileService->loadPersonalProfiles($actor);

            return $actor;
        });
    }

    public function resetPassword(array $data, User $user, User $actor): bool
    {
        $actorId = (int) $actor->id;
        $targetId = (int) $user->id;

        return DB::transaction(function () use ($data, $actorId, $targetId): bool {
            [$actor, $user] = $this->lockActorAndTarget($actorId, $targetId);
            abort_unless($this->userPolicy->resetPassword($actor, $user), 403);

            return (bool) $user->update(['password' => $data['new_password']]);
        });
    }

    private function roleIsStudent(Role $role): bool
    {
        return $role->canonicalCode() === 'STUDENT';
    }

    /**
     * @return array{0: User, 1: ?User}
     */
    private function lockActorAndTarget(int $actorId, ?int $targetId = null): array
    {
        $userIds = array_values(array_unique(array_filter([$actorId, $targetId])));
        sort($userIds);

        $lockedUsers = [];
        foreach ($userIds as $userId) {
            $lockedUsers[$userId] = User::query()
                ->with('role')
                ->lockForUpdate()
                ->findOrFail($userId);
        }

        return [
            $lockedUsers[$actorId],
            $targetId === null ? null : $lockedUsers[$targetId],
        ];
    }

}
