<?php

namespace App\Services\IdentityV2;

use App\Models\Role;
use App\Models\StudentProfile;
use App\Models\TeacherProfile;
use App\Models\User;
use App\Models\UserProfile;

class IdentityV2ProfileBackfillService
{
    public function backfillUsers(array $rolesByCode): void
    {
        User::query()
            ->orderBy('id')
            ->lockForUpdate()
            ->chunkById(500, function ($users) use ($rolesByCode): void {
                foreach ($users as $user) {
                    UserProfile::query()->firstOrCreate(
                        ['user_id' => $user->id],
                        [
                            'full_name' => $user->full_name,
                            'phone' => $user->phone,
                            'date_of_birth' => $user->date_of_birth,
                            'is_female' => $user->is_female,
                            'avatar_url' => $user->avatar_url,
                        ]
                    );

                    $legacyRole = $user->role_id
                        ? Role::query()
                            ->where('is_deleted', false)
                            ->find($user->role_id)
                        : null;
                    $roleCode = $legacyRole ? IdentityV2Definitions::canonicalRoleCode($legacyRole) : null;
                    $isStudent = (bool) $user->is_student;

                    if ($isStudent && $roleCode === null && $user->role_id === null) {
                        $user->role_id = $rolesByCode['STUDENT']->id;
                        $user->save();
                        $roleCode = 'STUDENT';
                    }

                    if ($isStudent && $roleCode === 'STUDENT') {
                        StudentProfile::query()->firstOrCreate(['user_id' => $user->id]);
                    } elseif (!$isStudent && $roleCode === 'TEACHER') {
                        TeacherProfile::query()->firstOrCreate(['user_id' => $user->id]);
                    }
                }
            });
    }
}
