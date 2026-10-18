<?php

namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use App\Services\AuthService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Throwable;

class AuthController extends Controller
{
    use ApiResponseTrait;

    protected AuthService $authService;

    public function __construct(AuthService $authService)
    {
        $this->authService = $authService;
    }

    public function login(LoginRequest $request)
    {
        return $this->success($this->authService->login($request->validated()));
    }

    public function me()
    {
        return $this->success($this->authService->me());
    }


    public function logout()
    {
        return $this->authService->logout();
    }

    public function redirectToGoogle(Request $request): RedirectResponse
    {
        // session(['frontend_redirect_url' => $request->query()["redirect_url"]]);
        // Log::info(session()->all());
        return $this->authService->redirectToGoogle($request, $request->query()["redirect_url"]);
    }

    public function handleGoogleCallback(Request $request)
    {
        $state = $request->input('state');

        parse_str($state, $result);
        $frontendUrl = $result['frontend_url'];

        if (!$request->filled('code') && !$request->filled('error')) {
            if ($request->expectsJson()) {
                return $this->error(null, 'Thiếu mã xác thực Google. Hãy bắt đầu từ endpoint /auth/google/redirect', 400);
            }

            return $this->authService->redirectToGoogle($request, $frontendUrl);
        }

        try {
            $data = $this->authService->handleGoogleCallback();

            if (isset($data['error'])) {
                return redirect($frontendUrl . '?error=' . $data['error']);
            }
            return redirect($frontendUrl . "?token=" . $data['access_token']);
        } catch (HttpException $e) {
            return $this->error(null, $e->getMessage(), $e->getStatusCode());
        } catch (Throwable $e) {
            Log::error('Google callback failed', [
                'message' => $e->getMessage(),
            ]);

            return $this->serverError();
        }
    }

    public function setAuthCookie(Request $request)
    {
        $data = $this->authService->setAuthCookie($request);
        return $data;
    }
}
