<?php

namespace App\Services;

use App\Models\Role;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpException;

class StudentRegistrationService
{
    public function __construct(
        private UserProfileService $userProfileService,
        private AuthOtpService $authOtpService
    ) {
    }

    public function createFromCredentials(array $data): User
    {
        $studentCode = trim((string) $data['student_code']);
        $email = mb_strtolower(trim((string) $data['email']));

        return DB::transaction(function () use ($data, $studentCode, $email): User {
            $studentRole = $this->lockStudentRole();

            if (User::query()->where('username', $studentCode)->exists()) {
                throw ValidationException::withMessages([
                    'student_code' => ['Mã sinh viên đã được sử dụng.'],
                ]);
            }

            if (User::query()->where('email', $email)->exists()) {
                throw ValidationException::withMessages([
                    'email' => ['Email đã được sử dụng.'],
                ]);
            }

            $this->authOtpService->completeRegistration(
                (string) $data['otp_public_id'],
                $email,
                (string) $data['otp_verification_token']
            );

            return $this->createAccount(
                $studentRole,
                $studentCode,
                $email,
                trim((string) $data['full_name']),
                (string) $data['password']
            );
        });
    }

    public function createFromGoogle(string $email, ?string $fullName, ?string $googleId): User
    {
        $email = mb_strtolower(trim($email));

        return DB::transaction(function () use ($email, $fullName, $googleId): User {
            $existingUser = User::query()->where('email', $email)->first();
            if ($existingUser) {
                $this->userProfileService->loadPersonalProfiles($existingUser);
                return $existingUser;
            }

            $studentRole = $this->lockStudentRole();

            // Recheck after taking the shared role lock so concurrent Google
            // callbacks for the same email reuse the account created first.
            $existingUser = User::query()->where('email', $email)->first();
            if ($existingUser) {
                $this->userProfileService->loadPersonalProfiles($existingUser);
                return $existingUser;
            }

            $username = $this->googleUsername($email);

            return $this->createAccount(
                $studentRole,
                null,
                $email,
                trim((string) $fullName) !== '' ? trim((string) $fullName) : Str::before($email, '@'),
                Str::random(48),
                $googleId,
                $username
            );
        });
    }

    private function lockStudentRole(): Role
    {
        $studentRole = Role::query()
            ->where('is_deleted', false)
            ->orderBy('id')
            ->lockForUpdate()
            ->get()
            ->first(fn (Role $role): bool => $role->canonicalCode() === 'STUDENT');

        if (!$studentRole) {
            throw new HttpException(503, 'Đăng ký sinh viên hiện chưa được cấu hình.');
        }

        return $studentRole;
    }

    private function createAccount(
        Role $studentRole,
        ?string $studentCode,
        string $email,
        string $fullName,
        string $password,
        ?string $googleId = null,
        ?string $username = null
    ): User {
        $personalData = $this->userProfileService->personalDataForCreate([
            'full_name' => $fullName,
        ]);
        $accountData = array_merge(
            [
                'username' => $username ?? $studentCode,
                'email' => $email,
                'password' => $password,
                'role_id' => $studentRole->id,
                'is_locked' => false,
                'is_deleted' => false,
                'ggid' => $googleId,
                'email_verified_at' => now(),
            ],
            $this->userProfileService->legacyIdentityAttributesForCreate($personalData),
            $this->userProfileService->legacyStudentFlagAttributesForCreate(true)
        );

        $user = User::query()->forceCreate($accountData);
        $studentProfile = [];
        if ($studentCode !== null && $this->userProfileService->hasStudentProfileTable()) {
            $studentProfile['student_code'] = $studentCode;
        }
        $roleProfiles = $this->userProfileService->hasStudentProfileTable()
            ? ['student_profile' => $studentProfile]
            : [];
        $this->userProfileService->sync($user, $personalData, $roleProfiles);

        if ($this->userProfileService->hasPersonalProfileTable()
            && $this->userProfileService->hasLegacyPersonalColumn('is_female')) {
            $user->profile()->update(['is_female' => null]);
            $user->unsetRelation('profile');
        }

        $user->loadMissing('role');
        $this->userProfileService->loadPersonalProfiles($user);

        return $user;
    }

    private function googleUsername(string $email): string
    {
        if (!User::query()->where('username', $email)->exists()) {
            return $email;
        }

        do {
            $username = 'google_' . Str::lower(Str::random(24));
        } while (User::query()->where('username', $username)->exists());

        return $username;
    }
}
