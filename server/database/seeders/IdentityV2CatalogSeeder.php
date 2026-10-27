<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Services\IdentityV2\IdentityV2CatalogBackfillService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class IdentityV2CatalogSeeder extends Seeder
{
    public function run(IdentityV2CatalogBackfillService $catalogBackfill): void
    {
        if (!Schema::hasTable('permissions') || !Schema::hasTable('role_permissions')) {
            return;
        }

        DB::transaction(function () use ($catalogBackfill): void {
            $seedDefaultRoleGrants = !Permission::query()->exists();
            $functionsById = $catalogBackfill->prepareFunctions();
            $catalogBackfill->preparePermissions($functionsById, $seedDefaultRoleGrants);
        });
    }
}
