<?php

namespace App\Http\Middleware;

use App\Models\Permission;
use App\Services\Authorization\PermissionAuthorizer;
use App\Services\RoleService;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PermissionMiddleware
{
    public function __construct(
        private PermissionAuthorizer $authorizer,
        private RoleService $roleService
    ) {
    }

    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Illuminate\Http\Response|\Illuminate\Http\RedirectResponse)  $next
     * @return \Illuminate\Http\Response|\Illuminate\Http\RedirectResponse
     */
    public function handle(Request $request, Closure $next, $permission)
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $permissions = explode('|', $permission);

        if (config('authorization.driver', 'legacy') === 'v2') {
            foreach ($permissions as $permissionToken) {
                $permissionCode = $this->toPermissionCode($permissionToken);
                if (!$permissionCode || !$this->authorizer->allows($user, $permissionCode)) {
                    return response()->json(['error' => 'Forbidden'], 403);
                }
            }

            return $next($request);
        }

        if (!$user->role_id) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $hasPermission = true;

        foreach ($permissions as $permission) {
            $hasPermission = $this->roleService->hasRole($user->role_id, $permission);
            if (!$hasPermission && strtolower(trim($permission)) === 'assign_phan_cong') {
                $hasPermission = $this->roleService->hasRole($user->role_id, 'create_phan_cong')
                    || $this->roleService->hasRole($user->role_id, 'update_phan_cong');
            }

            if (!$hasPermission) {
                break;
            }
        }

        if (!$hasPermission) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        return $next($request);
    }

    private function toPermissionCode(string $token): ?string
    {
        $token = trim($token);
        if (preg_match('/^[a-z0-9_]+\.[a-z0-9_]+$/i', $token)) {
            return $token;
        }

        $legacyTokenPattern = '/^(view|create|add|update|edit|delete|remove|lock|publish|assign|grade)_' .
            '([a-z0-9_]+)$/i';

        if (!preg_match($legacyTokenPattern, $token, $matches)) {
            return null;
        }

        $action = match (strtolower($matches[1])) {
            'view' => 'view',
            'create', 'add' => 'create',
            'update', 'edit' => 'update',
            'delete', 'remove' => 'delete',
            'lock' => 'lock',
            'publish' => 'publish',
            'assign' => 'assign',
            'grade' => 'grade',
        };

        $permissionCode = Permission::query()
            ->where('action_code', strtoupper($action))
            ->whereHas('function', fn ($query) => $query->where(
                'function_name',
                strtolower($matches[2])
            ))
            ->value('code');

        if (!is_string($permissionCode) || trim($permissionCode) === '') {
            return null;
        }

        return $permissionCode;
    }
}
