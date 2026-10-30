<?php

namespace App\Http\Middleware;

use App\Services\AuthSessionService;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpKernel\Exception\HttpException;

class EnsureActiveAuthSession
{
    public function __construct(private AuthSessionService $authSessionService)
    {
    }

    public function handle(Request $request, Closure $next)
    {
        try {
            $sessionId = Auth::guard('api')->payload()->get('sid');
        } catch (\Throwable) {
            $sessionId = null;
        }

        $userId = $request->user()?->getAuthIdentifier();
        if (!is_string($sessionId)
            || !$userId
            || !$this->authSessionService->isActive($sessionId, (int) $userId)) {
            throw new HttpException(401, 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        }

        return $next($request);
    }
}
