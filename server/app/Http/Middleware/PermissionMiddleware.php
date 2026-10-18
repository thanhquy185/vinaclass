<?php

namespace App\Http\Middleware;

use App\Services\RoleService;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PermissionMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Illuminate\Http\Response|\Illuminate\Http\RedirectResponse)  $next
     * @return \Illuminate\Http\Response|\Illuminate\Http\RedirectResponse
     */
    public function handle(Request $request, Closure $next, $permission)
    {
        $roleService = new RoleService();

        $user = Auth::user(); // trả về user đang đăng nhập

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $permissions = explode('|', $permission);

        $hasPermission = true;

        foreach ($permissions as $permission) { //Phải pass hết các role yêu cầu 
            if (!$roleService->hasRole($user->role_id, $permission)) {
                $hasPermission = false;
                break;
            }
        }

        if (!$hasPermission) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        return $next($request);
    }
}
