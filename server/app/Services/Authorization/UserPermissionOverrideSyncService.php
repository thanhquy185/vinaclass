<?php

namespace App\Services\Authorization;

use App\Models\PermissionDetail;
use App\Models\User;
use App\Policies\PermissionAdministrationPolicy;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class UserPermissionOverrideSyncService
{
    public function __construct(
        private PermissionAdministrationPolicy $policy,
        private PermissionAdministrationRules $rules
    ) {
    }

    public function sync(User $user, array $overrides, User $actor): User
    {
        $actorId = (int) $actor->id;
        $userId = (int) $user->id;
        $permissionIds = array_map(
            'intval',
            array_column($overrides, 'permission_id')
        );
        if (count($permissionIds) !== count(array_unique($permissionIds))) {
            throw ValidationException::withMessages([
                'overrides' => ['Mỗi quyền chỉ được khai báo một lần.'],
            ]);
        }

        return DB::transaction(function () use (
            $actorId,
            $userId,
            $overrides,
            $permissionIds
        ): User {
            $lockedUsers = $this->lockUsers($actorId, $userId);
            $currentActor = $lockedUsers[$actorId];
            $lockedUser = $lockedUsers[$userId];

            abort_unless($this->policy->manage($currentActor), 403);
            $this->rules->assertCanHaveOverrides($lockedUser);
            $this->rules->assertActivePermissionIds($permissionIds, 'overrides');
            $this->rules->assertUserOverridePolicy($lockedUser, $overrides);
            $lockedUser->permissionDetails()->delete();

            foreach ($overrides as $override) {
                PermissionDetail::query()->create([
                    'user_id' => $lockedUser->id,
                    'permission_id' => (int) $override['permission_id'],
                    'effect' => $override['effect'],
                    'changed_by' => $currentActor->id,
                ]);
            }

            return $lockedUser->refresh();
        });
    }

    /**
     * @return array<int, User>
     */
    private function lockUsers(int $actorId, int $userId): array
    {
        $userIds = array_values(array_unique([$actorId, $userId]));
        sort($userIds);

        $lockedUsers = [];
        foreach ($userIds as $id) {
            $lockedUsers[$id] = User::query()
                ->with('role')
                ->lockForUpdate()
                ->findOrFail($id);
        }

        return $lockedUsers;
    }
}
