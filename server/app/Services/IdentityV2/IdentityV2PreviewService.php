<?php

namespace App\Services\IdentityV2;

use App\Models\Permission;
use App\Models\Role;
use App\Models\RoleDetail;
use App\Models\User;
use App\Models\UserProfile;
use DateTimeInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class IdentityV2PreviewService
{
    public function build(): array
    {
        $roles = Role::query()->orderBy('id')->get();
        $rolesById = $roles->keyBy('id');
        $roleTargets = IdentityV2Definitions::activeSystemRoleTargets($roles);
        $roleCatalogConflicts = IdentityV2Definitions::inactiveSystemRoleCodeConflicts(
            $roles,
            $roleTargets
        );
        $blockedRoleCodes = array_unique(array_column($roleCatalogConflicts, 0));
        $legacyGrantMappings = $this->buildLegacyGrantMappings();
        $defaultRoleGrantsWillBeSeeded = !Permission::query()->exists();
        $rolePermissionDefaults = $defaultRoleGrantsWillBeSeeded
            ? $this->buildRolePermissionDefaults()
            : [];
        $rolePermissionPlan = $this->buildRolePermissionPlan(
            $legacyGrantMappings,
            $rolePermissionDefaults,
            $roleTargets
        );
        $activeRoles = $roles->filter(fn (Role $role): bool => !$role->is_deleted);
        $roleGroups = $activeRoles
            ->groupBy(fn (Role $role): ?string => IdentityV2Definitions::canonicalRoleCode($role));
        $roleDuplicates = $roleGroups
            ->reject(fn ($roles, $roleCode): bool => $roleCode === null || $roleCode === '' || $roles->count() < 2)
            ->map(fn ($roles, $roleCode): array => [
                (string) $roleCode,
                $roles->pluck('id')->implode(', '),
            ])
            ->values()
            ->all();
        $nonCanonicalDuplicateRoleIds = [];
        foreach ($roleGroups as $roleCode => $group) {
            if (!in_array($roleCode, IdentityV2Definitions::ROLE_CODES, true) || $group->count() < 2) {
                continue;
            }

            $targetRoleId = (int) ($roleTargets[$roleCode]->id ?? 0);
            foreach ($group as $role) {
                if ((int) $role->id !== $targetRoleId) {
                    $nonCanonicalDuplicateRoleIds[(int) $role->id] = true;
                }
            }
        }
        $counts = [
            'Existing accounts' => User::query()->count(),
            'Shared profiles to create' => User::query()
                ->whereNotIn('id', UserProfile::query()->select('user_id'))
                ->count(),
            'Legacy role grants to map' => RoleDetail::query()->count(),
            'Legacy role grants excluded by target policy' => count(array_filter(
                $legacyGrantMappings,
                fn (array $mapping): bool => $mapping['mappedAction'] === null
            )),
            'Existing v2 role grants excluded by target policy' => $this->countExistingRoleGrantExclusions($roles),
            'Existing user overrides excluded by target policy' => $this->countExistingUserOverrideExclusions($roles),
            'Explicit TEACHER defaults to ensure' => count(array_filter(
                $rolePermissionDefaults,
                fn (array $grant): bool => $grant[0] === 'TEACHER'
            )),
            'Existing STUDENT roles' => Role::query()
                ->where('is_deleted', false)
                ->where(function ($query) {
                    $query->whereRaw('UPPER(code) = ?', ['STUDENT'])
                        ->orWhereRaw('LOWER(role_name) = ?', ['student']);
                })
                ->count(),
            'Active system role targets' => count($roleTargets),
            'System roles to create' => count(array_diff(
                IdentityV2Definitions::ROLE_CODES,
                array_keys($roleTargets),
                $blockedRoleCodes
            )),
            'System role creation conflicts' => count($roleCatalogConflicts),
            'Existing profiles with legacy data differences' => 0,
            'Duplicate canonical role groups' => count($roleDuplicates),
        ];
        $conflicts = [];
        $profileMismatches = [];

        User::query()->orderBy('id')->chunkById(500, function ($users) use (
            $rolesById,
            $nonCanonicalDuplicateRoleIds,
            &$counts,
            &$conflicts,
            &$profileMismatches
        ): void {
            $profilesByUserId = UserProfile::query()
                ->whereIn('user_id', $users->pluck('id'))
                ->get()
                ->keyBy('user_id');

            foreach ($users as $user) {
                $profile = $profilesByUserId->get($user->id);
                if ($profile) {
                    $mismatchedFields = $this->profileMismatchFields($user, $profile);
                    if ($mismatchedFields !== []) {
                        $profileMismatches[] = [
                            (int) $user->id,
                            implode(', ', $mismatchedFields),
                        ];
                    }
                }

                $role = $user->role_id ? $rolesById->get($user->role_id) : null;
                $roleCode = $role && !$role->is_deleted
                    ? IdentityV2Definitions::canonicalRoleCode($role)
                    : null;
                $isStudent = (bool) $user->is_student;
                $hasDuplicateRole = isset($nonCanonicalDuplicateRoleIds[(int) $user->role_id]);

                if (!$hasDuplicateRole
                    && $isStudent
                    && ($roleCode === 'STUDENT' || ($roleCode === null && $user->role_id === null))) {
                    $counts['Valid student accounts / eligible for role assignment'] = ($counts['Valid student accounts / eligible for role assignment'] ?? 0) + 1;
                    continue;
                }

                if (!$hasDuplicateRole && !$isStudent && in_array($roleCode, ['ADMIN', 'TEACHER'], true)) {
                    $counts['Valid staff accounts'] = ($counts['Valid staff accounts'] ?? 0) + 1;
                    continue;
                }

                $conflictReason = $role?->is_deleted
                    ? 'inactive_role'
                    : ($hasDuplicateRole
                        ? 'duplicate_role'
                        : $this->roleConflictReason($roleCode, $isStudent));
                $conflicts[] = [(int) $user->id, $conflictReason];
            }
        });

        $counts['Accounts requiring manual review'] = count($conflicts);
        $counts['Existing profiles with legacy data differences'] = count($profileMismatches);

        $rolePolicyExclusions = array_values(array_map(
            fn (array $mapping): array => [
                $mapping['roleId'],
                $mapping['roleCode'],
                $mapping['functionName'],
                $mapping['legacyAction'],
            ],
            array_filter(
                $legacyGrantMappings,
                fn (array $mapping): bool => $mapping['mappedAction'] === null
            )
        ));

        return compact(
            'counts',
            'conflicts',
            'profileMismatches',
            'roleDuplicates',
            'roleCatalogConflicts',
            'rolePolicyExclusions',
            'rolePermissionDefaults',
            'rolePermissionPlan',
            'defaultRoleGrantsWillBeSeeded'
        );
    }

    private function buildRolePermissionDefaults(): array
    {
        $defaults = [];

        foreach (IdentityV2Definitions::ROLE_PERMISSION_DEFAULTS as $roleCode => $functionDefaults) {
            foreach ($functionDefaults as $functionName => $actionCodes) {
                foreach ($actionCodes as $actionCode) {
                    $defaults[] = [$roleCode, $functionName, $actionCode];
                }
            }
        }

        return $defaults;
    }

    private function countExistingRoleGrantExclusions(Collection $roles): int
    {
        $rolesById = $roles->keyBy('id');
        $permissionsById = Permission::query()
            ->with('function')
            ->get()
            ->keyBy('id');

        return DB::table('role_permissions')
            ->get(['role_id', 'permission_id'])
            ->filter(function (object $grant) use ($rolesById, $permissionsById): bool {
                $role = $rolesById->get($grant->role_id);
                $permission = $permissionsById->get($grant->permission_id);
                $functionName = $permission?->function?->function_name;

                return $role instanceof Role
                    && $functionName !== null
                    && !IdentityV2Definitions::roleCanReceiveFunctionAction(
                        $role,
                        $functionName,
                        $permission->action_code
                    );
            })
            ->count();
    }

    private function countExistingUserOverrideExclusions(Collection $roles): int
    {
        $rolesById = $roles->keyBy('id');
        $roleTargets = IdentityV2Definitions::activeSystemRoleTargets($roles);
        $studentFallbackRole = $roleTargets['STUDENT'] ?? new Role(['code' => 'STUDENT']);

        return DB::table('permission_details as details')
            ->join('users', 'users.id', '=', 'details.user_id')
            ->leftJoin('roles', 'roles.id', '=', 'users.role_id')
            ->join('permissions', 'permissions.id', '=', 'details.permission_id')
            ->join('functions', 'functions.id', '=', 'permissions.function_id')
            ->get([
                'users.role_id',
                'users.is_student',
                'roles.code as role_code',
                'roles.role_name',
                'functions.function_name',
                'permissions.action_code',
            ])
            ->filter(function (object $override) use ($rolesById, $studentFallbackRole): bool {
                $role = $override->role_id
                    ? $rolesById->get($override->role_id)
                    : ((bool) $override->is_student ? $studentFallbackRole : null);

                return $role instanceof Role
                    && !IdentityV2Definitions::roleCanReceiveFunctionAction(
                        $role,
                        $override->function_name,
                        $override->action_code
                    );
            })
            ->count();
    }

    private function buildRolePermissionPlan(
        array $legacyMappings,
        array $roleDefaults,
        array $roleTargets
    ): array {
        $grants = [];

        foreach ($legacyMappings as $mapping) {
            if ($mapping['mappedAction'] === null) {
                continue;
            }

            $this->addPlannedGrant(
                $grants,
                (string) $mapping['roleId'],
                $mapping['roleCode'],
                $mapping['functionName'],
                $mapping['mappedAction'],
                'legacy'
            );
        }

        foreach ($roleDefaults as [$roleCode, $functionName, $actionCode]) {
            $role = $roleTargets[$roleCode] ?? null;

            $this->addPlannedGrant(
                $grants,
                $role ? (string) $role->id : 'new',
                $roleCode,
                $functionName,
                $actionCode,
                'default'
            );
        }

        $rows = [];
        foreach ($grants as $grant) {
            $actions = array_keys($grant['actions']);
            $functionActions = IdentityV2Definitions::FUNCTION_ACTIONS[$grant['functionName']] ?? [];
            usort($actions, fn (string $left, string $right): int =>
                array_search($left, $functionActions, true) <=> array_search($right, $functionActions, true)
            );

            $sources = array_unique(array_merge(...array_values($grant['actions'])));
            $rows[] = [
                $grant['roleId'],
                $grant['roleCode'],
                $grant['functionName'],
                implode(', ', $actions),
                implode(' + ', $sources),
            ];
        }

        usort($rows, fn (array $left, array $right): int =>
            [$left[1], $left[2], $left[0]] <=> [$right[1], $right[2], $right[0]]
        );

        return $rows;
    }

    private function addPlannedGrant(
        array &$grants,
        string $roleId,
        string $roleCode,
        string $functionName,
        string $actionCode,
        string $source
    ): void {
        $key = $roleId . ':' . $functionName;
        $grants[$key] ??= [
            'roleId' => $roleId,
            'roleCode' => $roleCode,
            'functionName' => $functionName,
            'actions' => [],
        ];
        $grants[$key]['actions'][$actionCode][] = $source;
    }

    private function buildLegacyGrantMappings(): array
    {
        return RoleDetail::query()
            ->with(['role', 'function'])
            ->orderBy('id')
            ->get()
            ->map(function (RoleDetail $detail): ?array {
                if (!$detail->role || !$detail->function) {
                    return null;
                }

                return [
                    'roleId' => (int) $detail->role_id,
                    'roleCode' => IdentityV2Definitions::canonicalRoleCode($detail->role) ?? 'CUSTOM',
                    'functionName' => (string) $detail->function->function_name,
                    'legacyAction' => (string) $detail->action,
                    'mappedAction' => IdentityV2Definitions::mapLegacyRoleAction(
                        $detail->role,
                        $detail->function->function_name,
                        $detail->action
                    ),
                ];
            })
            ->filter()
            ->values()
            ->all();
    }

    private function profileMismatchFields(User $user, UserProfile $profile): array
    {
        $fields = ['full_name', 'phone', 'date_of_birth', 'is_female', 'avatar_url'];

        return array_values(array_filter($fields, function (string $field) use ($user, $profile): bool {
            return $this->normalizeProfileValue($user->{$field}, $field)
                !== $this->normalizeProfileValue($profile->{$field}, $field);
        }));
    }

    private function normalizeProfileValue(mixed $value, string $field): mixed
    {
        if ($value instanceof DateTimeInterface) {
            return $value->format('Y-m-d');
        }

        if ($field === 'is_female' && $value !== null) {
            return (bool) $value;
        }

        return $value;
    }

    private function roleConflictReason(?string $roleCode, bool $isStudent): string
    {
        if ($isStudent && in_array($roleCode, ['ADMIN', 'TEACHER'], true)) {
            return 'student_flag_but_staff_role';
        }

        if (!$isStudent && $roleCode === 'STUDENT') {
            return 'staff_flag_but_student_role';
        }

        return $roleCode === null ? 'missing_or_custom_role' : 'unsupported_role_combination';
    }
}
