<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\HttpException;

class EnsureActiveAccount
{
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();
        if (!$user || $user->is_locked || $user->is_deleted) {
            throw new HttpException(403, 'Tài khoản đã bị khóa hoặc ngừng hoạt động');
        }

        return $next($request);
    }
}
