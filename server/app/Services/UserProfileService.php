<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\ValidationException;

class UserProfileService
{
    private array $tableExistence = [];
    private ?array $userColumns = null;

    private const PERSONAL_FIELDS = [
        'full_name',
        'phone',
        'date_of_birth',
        'is_female',
        'avatar_url',
    ];

    private const ROLE_PROFILE_FIELDS = [
        'teacher_profile' => [
            'teacher_code',
            'department_name',
            'academic_title',
        ],
        'student_profile' => [
            'student_code',
            'program_name',
            'cohort',
        ],
    ];

    public function loadPersonalProfiles(User|Collection $subject): User|Collection
    {
        $subject->loadMissing('role');

        if ($this->tableExists('user_profiles')) {
            $subject->loadMissing('profile');
        }

        if ($this->tableExists('teacher_profiles')) {
            $subject->loadMissing('teacherProfile');
        }

        if ($this->tableExists('student_profiles')) {
            $subject->loadMissing('studentProfile');
        }

        return $subject;
    }

    public function personalValue(User $user, string $field): mixed
    {
        if (!in_array($field, self::PERSONAL_FIELDS, true)) {
            throw new \InvalidArgumentException("Unsupported personal field: {$field}");
        }

        $profile = null;
        if ($this->tableExists('user_profiles')) {
            $user->loadMissing('profile');
            $profile = $user->getRelation('profile');
        }

        return $profile !== null
            ? $profile->getAttribute($field)
            : $user->getAttribute($field);
    }

    public function hasPersonalProfileTable(): bool
    {
        return $this->tableExists('user_profiles');
    }

    public function hasStudentProfileTable(): bool
    {
        return $this->tableExists('student_profiles');
    }

    public function hasLegacyPersonalColumn(string $field): bool
    {
        if (!in_array($field, self::PERSONAL_FIELDS, true)) {
            return false;
        }

        return $this->userHasColumn($field);
    }

    public function legacyStudentFlagAttributesForCreate(bool $isStudent): array
    {
        return $this->userHasColumn('is_student')
            ? ['is_student' => $isStudent]
            : [];
    }

    public function syncLegacyStudentFlag(User $user, bool $isStudent): void
    {
        if ($this->userHasColumn('is_student')) {
            $user->forceFill(['is_student' => $isStudent])->save();
        }
    }

    public function splitPersonalData(array $data): array
    {
        $personalData = array_replace(
            Arr::only($data, self::PERSONAL_FIELDS),
            Arr::only($data['profile'] ?? [], self::PERSONAL_FIELDS)
        );

        return [
            'personal' => $personalData,
            'role_profiles' => Arr::only($data, array_keys(self::ROLE_PROFILE_FIELDS)),
            'account' => Arr::except(
                $data,
                array_merge(self::PERSONAL_FIELDS, array_keys(self::ROLE_PROFILE_FIELDS), ['profile'])
            ),
        ];
    }

    public function personalDataForCreate(array $data): array
    {
        return array_replace(
            ['avatar_url' => 'example.png'],
            Arr::only($data, self::PERSONAL_FIELDS)
        );
    }

    public function legacyIdentityAttributesForCreate(array $personalData): array
    {
        $requiredLegacyFields = array_filter(
            ['full_name', 'is_female'],
            fn (string $field): bool => $this->userHasColumn($field)
        );

        $legacyIdentityData = Arr::only($personalData, $requiredLegacyFields);

        // Older users tables require a gender flag. Public student sign-up does not
        // collect it, so keep the nullable profile value empty while supplying the
        // legacy column's required compatibility value when that column exists.
        if (in_array('is_female', $requiredLegacyFields, true)
            && !array_key_exists('is_female', $legacyIdentityData)) {
            $legacyIdentityData['is_female'] = false;
        }

        return $legacyIdentityData;
    }

    public function sync(User $user, array $data, array $roleProfiles = []): void
    {
        if ($data !== []) {
            $this->syncPersonal($user, $data);
        }

        if ($roleProfiles !== []) {
            $this->syncRoleProfile($user, $roleProfiles);
        }
    }

    public function syncPersonal(User $user, array $data): void
    {
        $data = $this->splitPersonalData($data)['personal'];

        if ($this->tableExists('user_profiles')) {
            $this->syncPersonalProfile($user, $data);
        }

        $this->syncLegacyPersonalColumns($user, $data);
    }

    private function syncPersonalProfile(User $user, array $data): void
    {
        $profile = $user->profile()->first();
        $source = $profile ?? $user;
        $profileData = [];
        foreach (self::PERSONAL_FIELDS as $field) {
            $profileData[$field] = $source->getAttribute($field);
        }

        $user->profile()->updateOrCreate([], array_replace(
            $profileData,
            Arr::only($data, self::PERSONAL_FIELDS)
        ));
        $user->unsetRelation('profile');
    }

    private function syncLegacyPersonalColumns(User $user, array $data): void
    {
        $legacyData = Arr::only($data, self::PERSONAL_FIELDS);
        if ($legacyData === []) {
            return;
        }

        $availableFields = array_filter(
            array_keys($legacyData),
            fn (string $field): bool => $this->userHasColumn($field)
        );
        $legacyData = Arr::only($legacyData, $availableFields);

        if ($legacyData !== []) {
            $user->forceFill($legacyData)->save();
        }
    }

    private function syncRoleProfile(User $user, array $roleProfiles): void
    {
        $user->unsetRelation('role')->load('role');

        $teacherData = Arr::only(
            $roleProfiles['teacher_profile'] ?? [],
            self::ROLE_PROFILE_FIELDS['teacher_profile']
        );
        $studentData = Arr::only(
            $roleProfiles['student_profile'] ?? [],
            self::ROLE_PROFILE_FIELDS['student_profile']
        );
        $isTeacher = $user->hasRoleCode('TEACHER');
        $isStudent = $user->hasRoleCode('STUDENT');

        if (!$isTeacher) {
            $this->rejectIncompatibleProfileData(
                $teacherData,
                'teacher_profile',
                'Tài khoản phải có vai trò TEACHER để lưu hồ sơ giảng viên.'
            );
        }
        if (!$isStudent) {
            $this->rejectIncompatibleProfileData(
                $studentData,
                'student_profile',
                'Tài khoản phải có vai trò STUDENT để lưu hồ sơ sinh viên.'
            );
        }

        if ($isTeacher) {
            if (!$this->tableExists('teacher_profiles')) {
                $this->rejectUnsavedProfileData($teacherData, 'teacher_profile', 'giảng viên');
            } else {
                $user->teacherProfile()->updateOrCreate([], $teacherData);
            }
        }

        if ($isStudent) {
            if (!$this->tableExists('student_profiles')) {
                $this->rejectUnsavedProfileData($studentData, 'student_profile', 'sinh viên');
            } else {
                $user->studentProfile()->updateOrCreate([], $studentData);
            }
        }
    }

    private function rejectIncompatibleProfileData(array $data, string $field, string $message): void
    {
        $hasValue = collect($data)->contains(
            fn (mixed $value): bool => $value !== null && $value !== ''
        );

        if ($hasValue) {
            throw ValidationException::withMessages([$field => [$message]]);
        }
    }

    private function rejectUnsavedProfileData(array $data, string $field, string $profileName): void
    {
        $hasValue = collect($data)->contains(
            fn (mixed $value): bool => $value !== null && $value !== ''
        );

        if ($hasValue) {
            throw ValidationException::withMessages([
                $field => ["Chưa thể lưu hồ sơ {$profileName} vì cơ sở dữ liệu chưa được cập nhật."],
            ]);
        }
    }

    private function tableExists(string $table): bool
    {
        return $this->tableExistence[$table] ??= Schema::hasTable($table);
    }

    private function userHasColumn(string $column): bool
    {
        $this->userColumns ??= Schema::getColumnListing('users');

        return in_array($column, $this->userColumns, true);
    }
}
