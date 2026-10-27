<?php

namespace App\Services;

use App\Exceptions\BusinessException;
use App\Models\FunctionModel;
use App\Models\Role;
use App\Models\RoleDetail;
use App\Models\User;
use App\Policies\RolePolicy;
use App\Services\Authorization\RolePermissionCompatibilityService;
use App\Services\IdentityV2\IdentityV2Definitions;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class RoleService
{
    private const LEGACY_ACTIONS = [
        'can_view' => 'VIEW',
        'can_create' => 'ADD',
        'can_update' => 'UPDATE',
        'can_delete' => 'DELETE',
    ];

    public function __construct(
        private RolePolicy $rolePolicy,
        private RolePermissionCompatibilityService $permissionCompatibility,
        private RoleQueryService $roleQueryService
    ) {
    }

    public function getAll(User $actor, ?string $nameSortDirection = null)
    {
        return $this->roleQueryService->getAll($actor, $nameSortDirection);
    }

    public function getRoleDetail(Role $role, User $actor): array
    {
        return $this->roleQueryService->getRoleDetail($role, $actor);
    }

    public function getRoleDetailById(int $id): ?array
    {
        return $this->roleQueryService->getRoleDetailById($id);
    }

    public function createRoleWithPermissions(array $data, User $actor): Role
    {
        $actorId = (int) $actor->id;

        return DB::transaction(function () use ($data, $actorId): Role {
            $actor = $this->lockActor($actorId);
            abort_unless($this->rolePolicy->create($actor), 403);

            $role = Role::query()->create([
                'role_name' => trim($data['role_name']),
            ]);

            $roleDetails = $this->buildRoleDetailRows($role->id, $data['role_details'] ?? []);
            if ($roleDetails !== []) {
                RoleDetail::query()->insert($roleDetails);
            }

            if (array_key_exists('role_details', $data)) {
                $this->permissionCompatibility->syncV2PermissionsFromLegacy($role);
            }

            return $role->load('roleDetails.function');
        });
    }

    public function updateRoleWithPermissions(array $data, int $id, User $actor): Role
    {
        $actorId = (int) $actor->id;
        $roleId = (int) $id;

        return DB::transaction(function () use ($data, $actorId, $roleId): Role {
            $actor = $this->lockActor($actorId);
            $lockedRole = Role::query()->lockForUpdate()->findOrFail($roleId);
            abort_unless($this->rolePolicy->update($actor, $lockedRole), 403);
            abort_if($lockedRole->is_deleted, 404);
            if (array_key_exists('role_name', $data)) {
                $this->assertSystemRoleCanBeUpdated($lockedRole, trim($data['role_name']));
                $lockedRole->update(['role_name' => trim($data['role_name'])]);
            }

            if (array_key_exists('role_details', $data)) {
                $roleDetails = $this->buildRoleDetailRows($lockedRole->id, $data['role_details']);
                RoleDetail::query()->where('role_id', $lockedRole->id)->delete();

                if ($roleDetails !== []) {
                    RoleDetail::query()->insert($roleDetails);
                }

                $this->permissionCompatibility->syncV2PermissionsFromLegacy($lockedRole);
            }

            return $lockedRole->load('roleDetails.function');
        });
    }

    public function deleteRoleWithPermissions(int $id, User $actor): bool
    {
        $actorId = (int) $actor->id;
        $roleId = (int) $id;

        return DB::transaction(function () use ($actorId, $roleId): bool {
            $actor = $this->lockActor($actorId);
            $lockedRole = Role::query()->lockForUpdate()->findOrFail($roleId);
            abort_unless($this->rolePolicy->delete($actor, $lockedRole), 403);
            abort_if($lockedRole->is_deleted, 404);
            $this->assertRoleCanBeDeleted($lockedRole);

            if ($lockedRole->users()->where('is_deleted', false)->exists()) {
                throw new BusinessException('Không thể xóa nhóm quyền đang được tài khoản sử dụng.', 409);
            }

            $lockedRole->is_deleted = true;
            $lockedRole->save();

            return true;
        });
    }

    public function hasRole(int $id, string $permission): bool
    {
        return $this->roleQueryService->hasRole($id, $permission);
    }

    private function buildRoleDetailRows(int $roleId, array $roleDetails): array
    {
        $functionNames = array_map(
            fn (array $detail) => $detail['function_name'],
            $roleDetails
        );

        if (count($functionNames) !== count(array_unique($functionNames))) {
            throw new BusinessException('Mỗi chức năng chỉ được khai báo một lần trong nhóm quyền.', 422);
        }

        $functions = FunctionModel::query()
            ->where('is_deleted', false)
            ->whereIn('function_name', $functionNames)
            ->get()
            ->keyBy('function_name');

        if ($functions->count() !== count($functionNames)) {
            throw new BusinessException('Danh sách có chức năng không tồn tại hoặc đã ngừng hoạt động.', 422);
        }

        $rows = [];
        $timestamp = now();
        foreach ($roleDetails as $detail) {
            $function = $functions->get($detail['function_name']);
            foreach (self::LEGACY_ACTIONS as $field => $action) {
                if (filter_var($detail[$field] ?? false, FILTER_VALIDATE_BOOLEAN)) {
                    $actionCode = $action === 'ADD' ? 'CREATE' : $action;
                    $supportedActions = IdentityV2Definitions::FUNCTION_ACTIONS[$detail['function_name']] ?? [];
                    if (!in_array($actionCode, $supportedActions, true)) {
                        throw new BusinessException(
                            sprintf(
                                'Chức năng "%s" không hỗ trợ thao tác "%s".',
                                $detail['function_name'],
                                IdentityV2Definitions::ACTION_LABELS[$actionCode][0] ?? $actionCode
                            ),
                            422
                        );
                    }

                    $rows[] = [
                        'role_id' => $roleId,
                        'function_id' => $function->id,
                        'action' => $action,
                        'created_at' => $timestamp,
                        'updated_at' => $timestamp,
                    ];
                }
            }
        }

        return $rows;
    }

    private function assertSystemRoleCanBeUpdated(Role $role, string $newName): void
    {
        $roleCode = $this->systemRoleCode($role);
        if ($roleCode === 'ADMIN') {
            throw new BusinessException('Không thể chỉnh sửa vai trò quản trị hệ thống.', 409);
        }

        $isNamedSystemRole = in_array($roleCode, ['TEACHER', 'STUDENT'], true);
        if ($isNamedSystemRole && $this->normalizeRoleName($newName) !== $this->normalizeRoleName($role->role_name)) {
            throw new BusinessException('Không thể đổi tên vai trò hệ thống.', 409);
        }
    }

    private function assertRoleCanBeDeleted(Role $role): void
    {
        if (in_array($this->systemRoleCode($role), ['ADMIN', 'TEACHER', 'STUDENT'], true)) {
            throw new BusinessException('Không thể xóa vai trò hệ thống.', 409);
        }
    }

    private function systemRoleCode(Role $role): ?string
    {
        $code = $role->canonicalCode();

        return in_array($code, ['ADMIN', 'TEACHER', 'STUDENT'], true) ? $code : null;
    }

    private function normalizeRoleName(string $name): string
    {
        return Str::slug(Str::ascii(trim($name)), '_');
    }

    private function lockActor(int $actorId): User
    {
        return User::query()
            ->with('role')
            ->lockForUpdate()
            ->findOrFail($actorId);
    }
}
