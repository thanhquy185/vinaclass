<?php

namespace Database\Seeders;

use App\Models\FunctionModel;
use App\Models\Permission;
use App\Models\Role;
use App\Models\RoleDetail;
use App\Services\IdentityV2\IdentityV2Definitions;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;
use RuntimeException;

class RoleDetailSeeder extends Seeder
{
    public function run(): void
    {
        if (Schema::hasTable('permissions') && Permission::query()->exists()) {
            return;
        }

        $rolesByCode = IdentityV2Definitions::activeSystemRoleTargets(
            Role::query()->orderBy('id')->get()
        );
        $adminRole = $rolesByCode['ADMIN'] ?? null;
        $teacherRole = $rolesByCode['TEACHER'] ?? null;
        $studentRole = $rolesByCode['STUDENT'] ?? null;

        if (!$adminRole || !$teacherRole || !$studentRole) {
            throw new RuntimeException('Seed the ADMIN, TEACHER, and STUDENT roles before role permissions.');
        }

        $adminFunctions = FunctionModel::all();
        $roleDetails = [];

        $actions = ["VIEW", "ADD", "UPDATE", "DELETE"];

        foreach ($adminFunctions as $adminFunction) {
            foreach ($actions as $action) {
                $roleDetails[] = [
                    "role_id" => $adminRole->id,
                    "function_id" => $adminFunction->id,
                    "action" => $action
                ];
            }
        }

        $legacyActionNames = [
            'VIEW' => 'VIEW',
            'CREATE' => 'ADD',
            'UPDATE' => 'UPDATE',
            'DELETE' => 'DELETE',
        ];
        $systemRoleGrants = [
            'TEACHER' => [$teacherRole, IdentityV2Definitions::ROLE_PERMISSION_DEFAULTS['TEACHER']],
            'STUDENT' => [$studentRole, IdentityV2Definitions::ROLE_PERMISSION_DEFAULTS['STUDENT']],
        ];

        foreach ($systemRoleGrants as [$role, $functionGrants]) {
            $functions = FunctionModel::query()
                ->whereIn('function_name', array_keys($functionGrants))
                ->get()
                ->keyBy('function_name');

            foreach ($functionGrants as $functionName => $actionCodes) {
                $function = $functions->get($functionName);
                if (!$function) {
                    continue;
                }

                foreach ($actionCodes as $actionCode) {
                    $roleDetails[] = [
                        'role_id' => $role->id,
                        'function_id' => $function->id,
                        'action' => $legacyActionNames[$actionCode],
                    ];
                }
            }
        }

        RoleDetail::insertOrIgnore($roleDetails);
    }
}
