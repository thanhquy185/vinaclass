<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\HttpException;

class EnsureTrustedAuthOrigin
{
    public function handle(Request $request, Closure $next)
    {
        $origin = rtrim((string) $request->headers->get('Origin'), '/');
        $allowedOrigins = array_map(
            static fn ($value) => rtrim((string) $value, '/'),
            (array) config('cors.allowed_origins', [])
        );

        if ($origin === '' || !in_array($origin, $allowedOrigins, true)) {
            throw new HttpException(403, 'Nguồn yêu cầu không được phép làm mới phiên đăng nhập.');
        }

        return $next($request);
    }
}
