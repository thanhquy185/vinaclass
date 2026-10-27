<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    private const PERSONAL_FIELDS = [
        'full_name',
        'phone',
        'date_of_birth',
        'is_female',
        'avatar_url',
    ];

    public function up(): void
    {
        if (Schema::hasColumn('users', 'is_student')) {
            throw new RuntimeException('Remove users.is_student before dropping legacy personal fields.');
        }

        $legacyFields = array_values(array_filter(
            self::PERSONAL_FIELDS,
            fn (string $field): bool => Schema::hasColumn('users', $field)
        ));
        if ($legacyFields === []) {
            return;
        }

        if (!Schema::hasTable('user_profiles')) {
            throw new RuntimeException('The user_profiles table is required before dropping legacy personal fields.');
        }

        $this->assertEveryUserHasProfile();
        $this->assertLegacyProfileValuesMatch($legacyFields);

        Schema::table('users', function (Blueprint $table) use ($legacyFields): void {
            $table->dropColumn($legacyFields);
        });
    }

    public function down(): void
    {
        $missingFields = array_values(array_filter(
            self::PERSONAL_FIELDS,
            fn (string $field): bool => !Schema::hasColumn('users', $field)
        ));
        if ($missingFields === []) {
            return;
        }

        if (!Schema::hasTable('user_profiles')) {
            throw new RuntimeException('Cannot restore legacy personal fields without the user_profiles table.');
        }

        $missingUserIds = DB::table('users')
            ->leftJoin('user_profiles', 'user_profiles.user_id', '=', 'users.id')
            ->whereNull('user_profiles.user_id')
            ->orderBy('users.id')
            ->limit(10)
            ->pluck('users.id')
            ->all();

        if ($missingUserIds !== []) {
            throw new RuntimeException(
                'Cannot restore personal data for accounts without profiles. User IDs: '
                . implode(', ', $missingUserIds)
            );
        }

        if (in_array('is_female', $missingFields, true)) {
            $nullGenderUserIds = DB::table('user_profiles')
                ->whereNull('is_female')
                ->orderBy('user_id')
                ->limit(10)
                ->pluck('user_id')
                ->all();

            if ($nullGenderUserIds !== []) {
                throw new RuntimeException(
                    'Cannot restore required users.is_female from null profile values. User IDs: '
                    . implode(', ', $nullGenderUserIds)
                );
            }
        }

        $requiredFieldsToFinalize = array_values(array_intersect(
            $missingFields,
            ['full_name', 'is_female']
        ));

        Schema::table('users', function (Blueprint $table) use ($missingFields): void {
            if (in_array('full_name', $missingFields, true)) {
                $table->string('full_name')->nullable();
            }
            if (in_array('phone', $missingFields, true)) {
                $table->string('phone', 20)->nullable();
            }
            if (in_array('date_of_birth', $missingFields, true)) {
                $table->date('date_of_birth')->nullable();
            }
            if (in_array('is_female', $missingFields, true)) {
                $table->boolean('is_female')->nullable();
            }
            if (in_array('avatar_url', $missingFields, true)) {
                $table->text('avatar_url')->nullable();
            }
        });

        DB::table('user_profiles')
            ->orderBy('user_id')
            ->chunkById(500, function ($profiles) use ($missingFields): void {
                foreach ($profiles as $profile) {
                    $values = [];
                    foreach ($missingFields as $field) {
                        $value = $profile->{$field};
                        $values[$field] = $field === 'is_female' ? (bool) $value : $value;
                    }

                    DB::table('users')->where('id', $profile->user_id)->update($values);
                }
            }, 'user_id');

        if ($requiredFieldsToFinalize !== []) {
            Schema::table('users', function (Blueprint $table) use ($requiredFieldsToFinalize): void {
                if (in_array('full_name', $requiredFieldsToFinalize, true)) {
                    $table->string('full_name')->nullable(false)->change();
                }
                if (in_array('is_female', $requiredFieldsToFinalize, true)) {
                    $table->boolean('is_female')->nullable(false)->change();
                }
            });
        }
    }

    private function assertEveryUserHasProfile(): void
    {
        $userIds = DB::table('users')
            ->leftJoin('user_profiles', 'user_profiles.user_id', '=', 'users.id')
            ->whereNull('user_profiles.user_id')
            ->orderBy('users.id')
            ->limit(10)
            ->pluck('users.id')
            ->all();

        if ($userIds !== []) {
            throw new RuntimeException(
                'Accounts without shared profiles remain. User IDs: ' . implode(', ', $userIds)
            );
        }
    }

    private function assertLegacyProfileValuesMatch(array $fields): void
    {
        $query = DB::table('users')
            ->leftJoin('user_profiles', 'user_profiles.user_id', '=', 'users.id')
            ->select('users.id as user_id');

        foreach ($fields as $field) {
            $query->addSelect("users.{$field} as legacy_{$field}");
            $query->addSelect("user_profiles.{$field} as profile_{$field}");
        }

        $mismatchedUserIds = [];
        foreach ($query->orderBy('users.id')->cursor() as $row) {
            foreach ($fields as $field) {
                if ($this->normalize($field, $row->{"legacy_{$field}"})
                    !== $this->normalize($field, $row->{"profile_{$field}"})) {
                    $mismatchedUserIds[] = $row->user_id;
                    break;
                }
            }

            if (count($mismatchedUserIds) >= 10) {
                break;
            }
        }

        if ($mismatchedUserIds !== []) {
            throw new RuntimeException(
                'Legacy personal fields differ from user_profiles. Resolve data mismatches before cutover. User IDs: '
                . implode(', ', $mismatchedUserIds)
            );
        }
    }

    private function normalize(string $field, mixed $value): mixed
    {
        if ($value === null) {
            return null;
        }

        if ($field === 'date_of_birth') {
            return substr((string) $value, 0, 10);
        }

        if ($field === 'is_female') {
            return (bool) $value;
        }

        return (string) $value;
    }
};
