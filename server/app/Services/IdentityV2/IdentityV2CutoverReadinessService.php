<?php

namespace App\Services\IdentityV2;

use App\Models\Role;
use Illuminate\Database\Query\Builder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class IdentityV2CutoverReadinessService
{
    private const PERSONAL_FIELDS = [
        'full_name',
        'phone',
        'date_of_birth',
        'is_female',
        'avatar_url',
    ];

    public function inspect(): array
    {
        $schemaCheck = $this->schemaCheck();
        if (!$schemaCheck['passed']) {
            return [
                'ready' => false,
                'checks' => [$schemaCheck],
            ];
        }

        $checks = [
            $this->activeSystemRolesCheck(),
            $this->legacyStudentFlagCheck(),
            $this->sharedProfilesCheck(),
            $this->roleProfilesCheck('TEACHER', 'teacher_profiles', 'Teacher profiles'),
            $this->roleProfilesCheck('STUDENT', 'student_profiles', 'Student profiles'),
            $this->permissionCatalogCheck(),
            $this->assignableRoleGrantsCheck(),
            $this->assignableUserOverridesCheck(),
            $this->personalDataCheck(),
        ];

        return [
            'ready' => collect($checks)->every(fn (array $check): bool => $check['passed']),
            'checks' => [$schemaCheck, ...$checks],
        ];
    }

    private function schemaCheck(): array
    {
        $requiredTables = [
            'roles',
            'users',
            'functions',
            'permissions',
            'role_permissions',
            'permission_details',
            'user_profiles',
            'teacher_profiles',
            'student_profiles',
        ];
        $requiredColumns = [
            'roles.code',
            'roles.is_deleted',
            'users.role_id',
            'role_permissions.role_id',
            'role_permissions.permission_id',
            'permission_details.user_id',
            'permission_details.permission_id',
            'permission_details.effect',
            'permissions.id',
            'permissions.function_id',
            'permissions.code',
            'permissions.action_code',
            'permissions.status',
            'user_profiles.id',
            'user_profiles.user_id',
            'user_profiles.full_name',
            'user_profiles.phone',
            'user_profiles.date_of_birth',
            'user_profiles.is_female',
            'user_profiles.avatar_url',
            'teacher_profiles.id',
            'teacher_profiles.user_id',
            'student_profiles.id',
            'student_profiles.user_id',
            'functions.code',
            'functions.function_name',
            'functions.name_vi',
            'functions.name_en',
            'functions.status',
            'functions.route_key',
            'functions.icon_key',
            'functions.sort_order',
            'functions.parent_function_id',
        ];
        $missing = [];

        foreach ($requiredTables as $table) {
            if (!Schema::hasTable($table)) {
                $missing[] = $table;
            }
        }

        foreach ($requiredColumns as $tableColumn) {
            [$table, $column] = explode('.', $tableColumn, 2);
            if (Schema::hasTable($table) && !Schema::hasColumn($table, $column)) {
                $missing[] = $tableColumn;
            }
        }

        return [
            'name' => 'Identity v2 schema',
            'passed' => $missing === [],
            'affected' => count($missing),
            'examples' => $missing,
            'details' => $missing === []
                ? 'Required identity, profile, and permission tables are available.'
                : 'Install the missing tables or columns before running the cutover migrations.',
        ];
    }

    private function activeSystemRolesCheck(): array
    {
        $query = DB::table('users')
            ->leftJoin('roles', 'roles.id', '=', 'users.role_id')
            ->where(function (Builder $query): void {
                $query->whereNull('roles.id')
                    ->orWhere('roles.is_deleted', true)
                    ->orWhereNull('roles.code')
                    ->orWhereNotIn('roles.code', IdentityV2Definitions::ROLE_CODES);
            });

        return $this->userCheck(
            'Active system roles',
            $query,
            'Every account must reference an active ADMIN, TEACHER, or STUDENT role.'
        );
    }

    private function legacyStudentFlagCheck(): array
    {
        if (!Schema::hasColumn('users', 'is_student')) {
            return [
                'name' => 'Legacy student flag',
                'passed' => true,
                'affected' => 0,
                'examples' => [],
                'details' => 'The legacy column is already removed; role_id is the source of truth.',
            ];
        }

        $query = DB::table('users')
            ->join('roles', 'roles.id', '=', 'users.role_id')
            ->where(function (Builder $query): void {
                $query->where(function (Builder $student): void {
                    $student->where('users.is_student', true)
                        ->where('roles.code', '!=', 'STUDENT');
                })->orWhere(function (Builder $staff): void {
                    $staff->where('users.is_student', false)
                        ->where('roles.code', 'STUDENT');
                });
            });

        return $this->userCheck(
            'Legacy student flag',
            $query,
            'Resolve accounts whose legacy student flag conflicts with their role.'
        );
    }

    private function sharedProfilesCheck(): array
    {
        $query = DB::table('users')
            ->leftJoin('user_profiles', 'user_profiles.user_id', '=', 'users.id')
            ->whereNull('user_profiles.id');

        return $this->userCheck(
            'Shared user profiles',
            $query,
            'Create a user_profiles record for every account before removing personal columns.'
        );
    }

    private function roleProfilesCheck(string $roleCode, string $profileTable, string $name): array
    {
        $query = DB::table('users')
            ->join('roles', 'roles.id', '=', 'users.role_id')
            ->leftJoin($profileTable, "{$profileTable}.user_id", '=', 'users.id')
            ->where('roles.code', $roleCode)
            ->whereNull("{$profileTable}.id");

        return $this->userCheck(
            $name,
            $query,
            "Create a {$roleCode} profile for every account with the {$roleCode} role."
        );
    }

    private function permissionCatalogCheck(): array
    {
        $missing = [];

        foreach (IdentityV2Definitions::FUNCTION_ACTIONS as $functionName => $actions) {
            foreach ($actions as $actionCode) {
                $exists = DB::table('functions')
                    ->join('permissions', 'permissions.function_id', '=', 'functions.id')
                    ->where('functions.function_name', $functionName)
                    ->where('permissions.action_code', $actionCode)
                    ->exists();

                if (!$exists) {
                    $missing[] = "{$functionName}." . strtolower($actionCode);
                }
            }
        }

        return [
            'name' => 'Standard permission catalog',
            'passed' => $missing === [],
            'affected' => count($missing),
            'examples' => array_slice($missing, 0, 10),
            'details' => $missing === []
                ? 'Every standard function/action pair has a permission record.'
                : 'Create the missing standard permission records before enabling authorization v2.',
        ];
    }

    private function assignableRoleGrantsCheck(): array
    {
        $query = DB::table('role_permissions as grants')
            ->join('roles', 'roles.id', '=', 'grants.role_id')
            ->join('permissions', 'permissions.id', '=', 'grants.permission_id')
            ->join('functions', 'functions.id', '=', 'permissions.function_id')
            ->select([
                'roles.id as role_id',
                'roles.code as role_code',
                'roles.role_name',
                'functions.function_name',
                'permissions.action_code',
            ])
            ->orderBy('grants.role_id')
            ->orderBy('grants.permission_id');
        $affected = 0;
        $examples = [];

        foreach ($query->cursor() as $grant) {
            $role = (new Role())->forceFill([
                'code' => $grant->role_code,
                'role_name' => $grant->role_name,
            ]);

            if (IdentityV2Definitions::roleCanReceiveFunctionAction(
                $role,
                (string) $grant->function_name,
                (string) $grant->action_code
            )) {
                continue;
            }

            $affected++;
            if (count($examples) < 10) {
                $examples[] = sprintf(
                    '%d:%s.%s',
                    (int) $grant->role_id,
                    $grant->function_name,
                    strtolower((string) $grant->action_code)
                );
            }
        }

        return [
            'name' => 'Assignable role permissions',
            'passed' => $affected === 0,
            'affected' => $affected,
            'examples' => $examples,
            'details' => $affected === 0
                ? 'Every stored role grant is allowed by the role permission policy.'
                : 'Remove grants for actions that the assigned role cannot use before cutover.',
        ];
    }

    private function assignableUserOverridesCheck(): array
    {
        $query = DB::table('permission_details as details')
            ->join('users', 'users.id', '=', 'details.user_id')
            ->leftJoin('roles', 'roles.id', '=', 'users.role_id')
            ->join('permissions', 'permissions.id', '=', 'details.permission_id')
            ->join('functions', 'functions.id', '=', 'permissions.function_id')
            ->select([
                'users.id as user_id',
                'roles.code as role_code',
                'roles.role_name',
                'functions.function_name',
                'permissions.action_code',
            ])
            ->orderBy('details.id');
        $affected = 0;
        $examples = [];

        foreach ($query->cursor() as $override) {
            $role = (new Role())->forceFill([
                'code' => $override->role_code,
                'role_name' => $override->role_name,
            ]);

            if (IdentityV2Definitions::roleCanReceiveFunctionAction(
                $role,
                (string) $override->function_name,
                (string) $override->action_code
            )) {
                continue;
            }

            $affected++;
            if (count($examples) < 10) {
                $examples[] = sprintf(
                    '%d:%s.%s',
                    (int) $override->user_id,
                    $override->function_name,
                    strtolower((string) $override->action_code)
                );
            }
        }

        return [
            'name' => 'Assignable user permission overrides',
            'passed' => $affected === 0,
            'affected' => $affected,
            'examples' => $examples,
            'details' => $affected === 0
                ? 'Every stored user override targets an action allowed by the assigned role.'
                : 'Remove overrides for actions that the assigned role cannot use before cutover.',
        ];
    }

    private function personalDataCheck(): array
    {
        $fields = array_values(array_filter(
            self::PERSONAL_FIELDS,
            fn (string $field): bool => Schema::hasColumn('users', $field)
                && Schema::hasColumn('user_profiles', $field)
        ));

        if ($fields === []) {
            return [
                'name' => 'Legacy personal data',
                'passed' => true,
                'affected' => 0,
                'examples' => [],
                'details' => 'No matching legacy personal columns remain to compare.',
            ];
        }

        $query = DB::table('users')
            ->leftJoin('user_profiles', 'user_profiles.user_id', '=', 'users.id')
            ->select('users.id as user_id');

        foreach ($fields as $field) {
            $query->addSelect("users.{$field} as legacy_{$field}");
            $query->addSelect("user_profiles.{$field} as profile_{$field}");
        }

        $mismatchedUserIds = [];
        $mismatchCount = 0;
        foreach ($query->orderBy('users.id')->cursor() as $row) {
            foreach ($fields as $field) {
                if ($this->normalize($field, $row->{"legacy_{$field}"})
                    !== $this->normalize($field, $row->{"profile_{$field}"})) {
                    $mismatchCount++;
                    if (count($mismatchedUserIds) < 10) {
                        $mismatchedUserIds[] = (int) $row->user_id;
                    }
                    break;
                }
            }
        }

        return [
            'name' => 'Legacy personal data',
            'passed' => $mismatchCount === 0,
            'affected' => $mismatchCount,
            'examples' => $mismatchedUserIds,
            'details' => $mismatchCount === 0
                ? 'Legacy values match user_profiles.'
                : 'Review the listed accounts and resolve mismatches before dropping legacy columns.',
        ];
    }

    private function userCheck(string $name, Builder $query, string $details): array
    {
        $affected = (clone $query)->count('users.id');
        $examples = (clone $query)
            ->orderBy('users.id')
            ->limit(10)
            ->pluck('users.id')
            ->map(fn ($id): int => (int) $id)
            ->all();

        return [
            'name' => $name,
            'passed' => $affected === 0,
            'affected' => $affected,
            'examples' => $examples,
            'details' => $affected === 0
                ? 'No blocking accounts found.'
                : $details,
        ];
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
}
