<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreRoleRequest;
use App\Http\Requests\UpdateRoleRequest;
use App\Http\Resources\RoleResource;
use App\Models\Role;
use App\Services\RoleService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\Request;

class RoleController extends Controller
{
    use ApiResponseTrait;

    public function __construct(private RoleService $roleService)
    {
    }

    public function index(Request $request)
    {
        $sortDirection = $request->query('sort_by') === 'name'
            ? $request->query('sort_direction')
            : null;
        $sortDirection = in_array($sortDirection, ['asc', 'desc'], true)
            ? $sortDirection
            : null;
        $roles = $this->roleService->getAll($request->user(), $sortDirection);

        return $this->success(RoleResource::collection($roles));
    }

    public function store(StoreRoleRequest $request)
    {
        $role = $this->roleService->createRoleWithPermissions(
            $request->validated(),
            $request->user()
        );

        return response()->json($role, 201);
    }

    public function show(Role $role)
    {
        $roleDetails = $this->roleService->getRoleDetail($role, request()->user());

        return $this->success($roleDetails);
    }

    public function update(UpdateRoleRequest $request, Role $role)
    {
        $updatedRole = $this->roleService->updateRoleWithPermissions(
            $request->validated(),
            $role->id,
            $request->user()
        );

        return response()->json($updatedRole);
    }

    public function destroy(Role $role)
    {
        $deleted = $this->roleService->deleteRoleWithPermissions(
            $role->id,
            request()->user()
        );

        return response()->json($deleted);
    }
}
