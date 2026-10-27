<?php

namespace App\Http\Controllers;

use App\Http\Requests\SyncRolePermissionsRequest;
use App\Http\Requests\SyncUserPermissionOverridesRequest;
use App\Models\Role;
use App\Models\User;
use App\Services\Authorization\PermissionAdministrationService;
use App\Services\Authorization\PermissionAdministrationQueryService;
use App\Traits\ApiResponseTrait;

class PermissionAdministrationController extends Controller
{
    use ApiResponseTrait;

    public function __construct(
        private PermissionAdministrationService $service,
        private PermissionAdministrationQueryService $queryService
    ) {
    }

    public function myNavigation()
    {
        return $this->success(
            $this->queryService->getNavigation(request()->user())
        );
    }

    public function catalog()
    {
        return $this->success($this->queryService->getCatalog(request()->user()));
    }

    public function roleMatrix(Role $role)
    {
        return $this->success($this->queryService->getRoleMatrix($role, request()->user()));
    }

    public function syncRolePermissions(SyncRolePermissionsRequest $request, Role $role)
    {
        $updatedRole = $this->service->syncRolePermissions(
            $role,
            $request->validated('permission_ids'),
            $request->user()
        );

        return $this->updated([
            'roleId' => $updatedRole->id,
            'permissionIds' => $updatedRole->permissions->pluck('id')->values(),
        ]);
    }

    public function userOverrideMatrix(User $user)
    {
        return $this->success(
            $this->queryService->getUserOverrideMatrix($user, request()->user())
        );
    }

    public function syncUserOverrides(SyncUserPermissionOverridesRequest $request, User $user)
    {
        $this->service->syncUserOverrides(
            $user,
            $request->validated('overrides'),
            $request->user()
        );

        return $this->updated([
            'userId' => $user->id,
            'overrides' => $user->permissionDetails()
                ->orderBy('permission_id')
                ->get(['permission_id', 'effect', 'changed_by']),
        ]);
    }
}
