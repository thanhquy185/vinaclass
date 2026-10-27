<?php

namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterStudentRequest;
use App\Http\Resources\UserResource;
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
        $data = $this->authService->login($request->validated());
        $data['me'] = new UserResource($data['me']);

        return $this->success($data);
    }

    public function register(RegisterStudentRequest $request)
    {
        $data = $this->authService->registerStudent($request->validated());
        $data['me'] = new UserResource($data['me']);

        return $this->created($data, 'Tạo tài khoản sinh viên thành công.');
    }

    public function me()
    {
        $data = $this->authService->me();
        $data['me'] = new UserResource($data['me']);

        return $this->success($data);
    }


    public function logout()
    {
        return $this->authService->logout();
    }

    public function redirectToGoogle(Request $request): RedirectResponse
    {
        $frontendUrl = $this->authService->resolveGoogleFrontendRedirectUrl(
            $request,
            (string) config('app.frontend_url')
        );

        return $this->authService->redirectToGoogle($request, $frontendUrl);
    }

    public function handleGoogleCallback(Request $request)
    {
        $frontendUrl = $request->session()->pull('google_frontend_redirect', (string) config('app.frontend_url'));

        if (!$request->filled('code') && !$request->filled('error')) {
            if ($request->expectsJson()) {
                return $this->error(null, 'Thiếu mã xác thực Google. Hãy bắt đầu từ endpoint /auth/google/redirect', 400);
            }

            return $this->authService->redirectToGoogle($request, $frontendUrl);
        }

        try {
            $data = $this->authService->handleGoogleCallback();

            if (isset($data['error'])) {
                return redirect($frontendUrl . '?error=' . urlencode($data['error']));
            }
            return redirect($frontendUrl . '#token=' . urlencode($data['access_token']));
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
