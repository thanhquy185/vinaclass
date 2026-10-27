<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Services\IdentityV2\IdentityV2CatalogBackfillService;
use App\Services\IdentityV2\IdentityV2Definitions;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run(IdentityV2CatalogBackfillService $catalogBackfill): void
    {
        DB::transaction(function () use ($catalogBackfill): void {
            if (Schema::hasColumn('roles', 'code')) {
                $catalogBackfill->prepareRoles();
                return;
            }

            $roles = Role::query()->orderBy('id')->get();
            $roleTargets = IdentityV2Definitions::activeSystemRoleTargets($roles);

            foreach (IdentityV2Definitions::ROLE_CODES as $code) {
                if (isset($roleTargets[$code])) {
                    continue;
                }

                $roleTargets[$code] = Role::query()->create([
                    'role_name' => Str::lower($code),
                ]);
            }
        });
    }
}
