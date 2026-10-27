<?php

namespace App\Services;

use App\Models\Role;
use App\Models\RoleDetail;
use App\Models\User;
use App\Policies\RolePolicy;
use App\Services\IdentityV2\IdentityV2Definitions;

class RoleQueryService
{
    public function __construct(private RolePolicy $rolePolicy)
    {
    }

    public function getAll(User $actor, ?string $nameSortDirection = null)
    {
        abort_unless($this->rolePolicy->viewAny($actor), 403);

        $query = Role::query()
            ->where('is_deleted', false)
            ->withCount([
                'users as total_users' => fn ($query) => $query->where('is_deleted', false),
            ]);

        if (in_array($nameSortDirection, ['asc', 'desc'], true)) {
            return $query
                ->orderBy('role_name', $nameSortDirection)
                ->orderByDesc('id')
                ->get();
        }

        return $query->orderByDesc('id')->get();
    }

    public function getRoleDetail(Role $role, User $actor): array
    {
        abort_unless($this->rolePolicy->view($actor, $role), 403);
        abort_if($role->is_deleted, 404);

        return $this->formatRoleDetail($role->load('roleDetails.function'));
    }

    public function getRoleDetailById(int $id): ?array
    {
        $role = Role::query()->with('roleDetails.function')->find($id);

        return $role && !$role->is_deleted
            ? $this->formatRoleDetail($role)
            : null;
    }

    public function hasRole(int $id, string $permission): bool
    {
        $separator = strpos($permission, '_');
        if ($separator === false) {
            return false;
        }

        $action = strtolower(substr($permission, 0, $separator));
        $functionName = substr($permission, $separator + 1);
        $actionMapping = match ($action) {
            'view' => ['VIEW', ['VIEW']],
            'create', 'add' => ['CREATE', ['ADD', 'CREATE']],
            'update' => ['UPDATE', ['UPDATE']],
            'delete' => ['DELETE', ['DELETE']],
            default => null,
        };

        if (!$actionMapping || $functionName === '') {
            return false;
        }

        [$actionCode, $legacyActions] = $actionMapping;
        $role = Role::query()->find($id);
        if (
            !$role
            || $role->is_deleted
            || !IdentityV2Definitions::roleCanReceiveFunctionAction($role, $functionName, $actionCode)
        ) {
            return false;
        }

        return RoleDetail::query()
            ->where('role_id', $id)
            ->whereIn('action', $legacyActions)
            ->whereHas('function', fn ($query) => $query
                ->where('function_name', $functionName)
                ->where('is_deleted', false))
            ->exists();
    }

    private function formatRoleDetail(Role $role): array
    {
        $permissions = $role->roleDetails
            ->filter(fn (RoleDetail $detail) => $detail->function !== null
                && IdentityV2Definitions::roleCanReceiveFunctionAction(
                    $role,
                    $detail->function->function_name,
                    IdentityV2Definitions::normalizeActionCode($detail->action)
                ))
            ->groupBy('function_id')
            ->map(function ($items): array {
                $actions = $items->pluck('action');

                return [
                    'function_name' => $items->first()->function->function_name,
                    'can_view' => $actions->contains('VIEW'),
                    'can_create' => $actions->contains('ADD') || $actions->contains('CREATE'),
                    'can_update' => $actions->contains('UPDATE'),
                    'can_delete' => $actions->contains('DELETE'),
                ];
            })
            ->values();

        return [
            'id' => $role->id,
            'role_name' => $role->role_name,
            'code' => $role->canonicalCode(),
            'roleDetails' => $permissions,
        ];
    }
}
