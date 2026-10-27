<?php

namespace App\Console\Commands;

use App\Models\Permission;
use App\Services\IdentityV2\IdentityV2CatalogBackfillService;
use App\Services\IdentityV2\IdentityV2PreviewService;
use App\Services\IdentityV2\IdentityV2ProfileBackfillService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class PrepareIdentityV2 extends Command
{
    protected $signature = 'app:prepare-identity-v2 {--apply : Apply the role, permission, and profile backfill}';

    protected $description = 'Preview or apply the additive identity/profile/RBAC v2 backfill';

    public function handle(
        IdentityV2PreviewService $previewService,
        IdentityV2CatalogBackfillService $catalogBackfill,
        IdentityV2ProfileBackfillService $profileBackfill
    ): int {
        if (!Schema::hasColumn('users', 'is_student')) {
            $this->error('The legacy student flag has already been removed; identity v2 backfill is no longer needed.');
            return self::FAILURE;
        }

        if (!$this->hasRequiredSchema()) {
            $this->error('The v2 schema is missing. Run php artisan migrate first.');
            return self::FAILURE;
        }

        $preview = $previewService->build();
        $this->table(['Item', 'Count'], collect($preview['counts'])
            ->map(fn ($count, $label) => [$label, $count])
            ->values()
            ->all());

        if (!empty($preview['conflicts'])) {
            $this->warn('Accounts with conflicting role data (IDs only):');
            $this->table(['User ID', 'Reason'], $preview['conflicts']);
        }

        if (!empty($preview['profileMismatches'])) {
            $this->warn('Existing profiles with values different from legacy user data (IDs and fields only):');
            $this->table(['User ID', 'Fields'], $preview['profileMismatches']);
        }

        if (!empty($preview['roleDuplicates'])) {
            $this->warn('Multiple legacy roles resolve to the same canonical role (IDs only):');
            $this->table(['Canonical role', 'Role IDs'], $preview['roleDuplicates']);
        }

        if (!empty($preview['roleCatalogConflicts'])) {
            $this->warn('Inactive roles reserve system role codes needed by the backfill:');
            $this->table(['Role code', 'Inactive role ID'], $preview['roleCatalogConflicts']);
        }

        if (!empty($preview['rolePolicyExclusions'])) {
            $this->warn('Legacy role grants excluded by the target permission policy (role IDs only):');
            $this->table(
                ['Role ID', 'Role code', 'Function', 'Legacy action'],
                $preview['rolePolicyExclusions']
            );
        }

        if (!empty($preview['rolePermissionDefaults'])) {
            $this->warn('Explicit default grants included in the backfill plan:');
            $this->table(
                ['Role code', 'Function', 'Action'],
                $preview['rolePermissionDefaults']
            );
        }

        if (!empty($preview['rolePermissionPlan'])) {
            $this->warn('Mapped grants by role and function (ADMIN receives all active permissions at runtime):');
            $this->table(
                ['Role ID', 'Role code', 'Function', 'Actions', 'Source'],
                $preview['rolePermissionPlan']
            );
        }

        if (!$this->option('apply')) {
            $this->info('Preview only: no data was written. Review the report before using --apply.');
            return self::SUCCESS;
        }

        if (!empty($preview['roleCatalogConflicts'])) {
            $this->error('Cannot apply identity v2 backfill until the inactive system role code conflicts are resolved.');
            return self::FAILURE;
        }

        if (!$preview['defaultRoleGrantsWillBeSeeded']) {
            $this->info('An existing permission catalog was found; configured role grants will be preserved.');
        }

        DB::transaction(function () use ($catalogBackfill, $profileBackfill, $preview): void {
            $seedDefaultRoleGrants = $preview['defaultRoleGrantsWillBeSeeded']
                && !Permission::query()->exists();
            $rolesByCode = $catalogBackfill->prepareRoles();
            $functionsById = $catalogBackfill->prepareFunctions();
            $catalogBackfill->preparePermissions($functionsById, $seedDefaultRoleGrants);
            $profileBackfill->backfillUsers($rolesByCode);
            $catalogBackfill->removeDisallowedUserPermissionOverrides();
        });

        $this->info('The v2 backfill was applied to valid records. Conflicting accounts retain their legacy role_id/is_student values.');
        $this->warn('Keep the preview conflict report and resolve those account IDs before switching the application to the new schema.');
        if (!empty($preview['profileMismatches'])) {
            $this->warn('Existing profile values were left unchanged. Review the listed fields against the legacy data before switching the application to the new schema.');
        }
        if (!empty($preview['roleDuplicates'])) {
            $this->warn('Duplicate legacy role records were kept separate. Review the listed role IDs before switching the application to the new schema.');
        }

        return self::SUCCESS;
    }

    private function hasRequiredSchema(): bool
    {
        foreach (['permissions', 'role_permissions', 'permission_details', 'user_profiles', 'teacher_profiles', 'student_profiles'] as $table) {
            if (!Schema::hasTable($table)) {
                return false;
            }
        }

        return Schema::hasColumn('roles', 'code')
            && Schema::hasColumn('functions', 'code')
            && Schema::hasColumn('functions', 'name_vi')
            && Schema::hasColumn('functions', 'name_en')
            && Schema::hasColumn('functions', 'status')
            && Schema::hasColumn('functions', 'route_key')
            && Schema::hasColumn('functions', 'icon_key')
            && Schema::hasColumn('functions', 'sort_order')
            && Schema::hasColumn('functions', 'parent_function_id');
    }
}
