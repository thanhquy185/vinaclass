<?php

namespace App\Services;

use App\Models\FunctionModel;
use App\Models\Role;
use App\Models\RoleDetail;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class RoleService
{

    public function getAll()
    {
        $roles = Role::withCount([
            'users as total_users'
        ])->get();

        return $roles;
    }

    public function getRoleDetail(Role $role)
    {
        $role = Role::with('roleDetails.function')->findOrFail($role->id);
        $roleDetails = $role->roleDetails;

        $permission = $roleDetails
            ->groupBy('function_id')
            ->map(function ($items) {
                return [
                    'function_name' => $items->first()->function->function_name,
                    'can_view'       => $items->contains('action', 'VIEW'),
                    'can_create'     => $items->contains('action', 'ADD'),
                    'can_update'     => $items->contains('action', 'UPDATE'),
                    'can_delete'     => $items->contains('action', 'DELETE')
                ];
            })->values();

        $response = [
            "id"           => $role->id,
            "role_name"    => $role->role_name,
            "roleDetails" => $permission
        ];

        return $response;
    }

    public function getRoleDetailById(int $id)
    {
        $role = Role::with('roleDetails.function')->find($id);
        if (!$role) return null;

        $roleDetails = $role->roleDetails;

        $permission = $roleDetails
            ->groupBy('function_id')
            ->map(function ($items) {
                return [
                    'function_name' => $items->first()->function->function_name,
                    'can_view'       => $items->contains('action', 'VIEW'),
                    'can_create'     => $items->contains('action', 'ADD'),
                    'can_update'     => $items->contains('action', 'UPDATE'),
                    'can_delete'     => $items->contains('action', 'DELETE')
                ];
            })->values();

        $response = [
            "id"           => $role->id,
            "role_name"    => $role->role_name,
            "roleDetails" => $permission
        ];

        return $response;
    }

    // *** format gửi tạo 1 phân quyền
    // {
    //   "tenNhomQuyen": "Nhân viên bán hàng",
    //   "roleDetails": [
    //     {
    //       "tenChucNang": "QL_NHOMHP",
    //       "can_view": true,
    //       "can_create": false,
    //       "can_update": false,
    //       "can_delete": false
    //     },
    //     {
    //       "tenChucNang": "QL_CAUHOI",
    //       "can_view": true,
    //       "can_create": true,
    //       "can_update": false,
    //       "can_delete": false
    //     }
    //   ]
    // }
    public function createRoleWithPermissions(array $data)
    {
        // Transaction to ensure complete rollback in case of error
        return DB::transaction(function () use ($data) {
            // 1. Create role
            $role = Role::create([
                'role_name' => $data['role_name'],
            ]);

            // 2. Prepare roleDetails data
            $roleDetailsData = [];
            foreach ($data['roleDetails'] as $roleDetail) {
                // Find function for each permission set
                $function = FunctionModel::where('function_name', $roleDetail['function_name'])->firstOrFail();

                if ($roleDetail['can_view']) {
                    $roleDetailsData[] = [
                        'role_id'     => $role->id,
                        'function_id' => $function->id,
                        'action'      => 'VIEW',
                    ];
                }

                if ($roleDetail['can_create']) {
                    $roleDetailsData[] = [
                        'role_id'     => $role->id,
                        'function_id' => $function->id,
                        'action'      => 'ADD',
                    ];
                }

                if ($roleDetail['can_update']) {
                    $roleDetailsData[] = [
                        'role_id'     => $role->id,
                        'function_id' => $function->id,
                        'action'      => 'UPDATE',
                    ];
                }

                if ($roleDetail['can_delete']) {
                    $roleDetailsData[] = [
                        'role_id'     => $role->id,
                        'function_id' => $function->id,
                        'action'      => 'DELETE',
                    ];
                }
            }

            // 3. Batch insert
            RoleDetail::insert($roleDetailsData);

            return $role->load('roleDetails.function');
        });
    }

    public function updateRoleWithPermissions(array $data, int $id)
    {
        return DB::transaction(function () use ($data, $id) {

            // 1. Get role to update
            $role = Role::findOrFail($id);

            // 2. Update role info
            $role->update([
                'role_name' => $data['role_name'],
            ]);

            // 3. Delete all old permissions
            RoleDetail::where('role_id', $role->id)->delete();

            // 4. Prepare new permission data
            $roleDetailsData = [];

            foreach ($data['roleDetails'] as $roleDetail) {

                // Find corresponding function
                $functionCategory = FunctionModel::where('function_name', $roleDetail['function_name'])->firstOrFail(); // NOTE: Action/tenChucNang -> FunctionModel/function_name

                if ($roleDetail['can_view']) {
                    $roleDetailsData[] = [
                        'role_id'     => $role->id,
                        'function_id' => $functionCategory->id,
                        'action'      => 'VIEW',
                    ];
                }

                if ($roleDetail['can_create']) {
                    $roleDetailsData[] = [
                        'role_id'     => $role->id,
                        'function_id' => $functionCategory->id,
                        'action'      => 'ADD',
                    ];
                }

                if ($roleDetail['can_update']) {
                    $roleDetailsData[] = [
                        'role_id'     => $role->id,
                        'function_id' => $functionCategory->id,
                        'action'      => 'UPDATE',
                    ];
                }

                if ($roleDetail['can_delete']) {
                    $roleDetailsData[] = [
                        'role_id'     => $role->id,
                        'function_id' => $functionCategory->id,
                        'action'      => 'DELETE',
                    ];
                }
            }

            // 5. Batch insert new permissions
            if (!empty($roleDetailsData)) {
                RoleDetail::insert($roleDetailsData);
            }

            return $role->load('roleDetails.function');
        });
    }

    public function deleteRoleWithPermissions(int $id)
    {
        return DB::transaction(function () use ($id) {

            // 1. Get role to delete
            $role = Role::findOrFail($id);

            // 2. Delete all permissions of the role
            RoleDetail::where('role_id', $role->id)->delete();

            // 3. Delete role
            $role->delete();

            return true;
        });
    }

    public function hasRole(int $id, string $permission): bool
    { // For middleware check
        $role = Role::findOrFail($id);
        if (!$role || !isset($role['roleDetails'])) {
            return false; // Return false if no permissions found
        }

        $parts = explode('_', $permission, 2);

        [$action, $function] = $parts;

        $actionMap = [
            'view'   => 'can_view',
            'create' => 'can_create',
            'update' => 'can_update',
            'delete' => 'can_delete',
        ];

        $field = $actionMap[$action];

        $roleDetailData = $this->getRoleDetail($role);

        foreach ($roleDetailData["roleDetails"] as $detail) {
            if ($detail['function_name'] === $function) {
                return $detail[$field]; // Returns true/false
            }
        }

        // Log required and existing permissions
        Log::info("Permission Check", [
            'role_id'              => $id,
            'permission_checked'   => $permission,
            'user_has_permission'  => $this->getRoleDetail($role),
        ]);

        return false;
    }
}
