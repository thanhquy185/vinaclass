<?php

namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterStudentRequest;
use App\Http\Requests\RequestAuthOtpEmail;
use App\Http\Requests\ResetPasswordWithOtpRequest;
use App\Http\Requests\VerifyAuthOtpRequest;
use App\Http\Resources\UserResource;
use App\Services\AuthOtpService;
use App\Services\AuthService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Throwable;

class AuthController extends Controller
{
    use ApiResponseTrait;

    protected AuthService $authService;
    protected AuthOtpService $authOtpService;

    public function __construct(AuthService $authService, AuthOtpService $authOtpService)
    {
        $this->authService = $authService;
        $this->authOtpService = $authOtpService;
    }

    public function login(LoginRequest $request)
    {
        $data = $this->authService->login($request->validated(), $request);
        $refreshToken = $data['refresh_token'];
        unset($data['refresh_token']);
        $data['me'] = new UserResource($data['me']);

        return $this->withRefreshCookie($this->success($data), $refreshToken);
    }

    public function register(RegisterStudentRequest $request)
    {
        $data = $this->authService->registerStudent($request->validated(), $request);
        $refreshToken = $data['refresh_token'];
        unset($data['refresh_token']);
        $data['me'] = new UserResource($data['me']);

        return $this->withRefreshCookie(
            $this->created($data, 'Tạo tài khoản sinh viên thành công.'),
            $refreshToken
        );
    }

    public function requestRegistrationOtp(RequestAuthOtpEmail $request)
    {
        $data = $this->authOtpService->requestRegistrationCode($request->validated()['email']);
        return $this->created($data, 'Mã xác minh đã được gửi đến email của bạn.');
    }

    public function requestPasswordResetOtp(RequestAuthOtpEmail $request)
    {
        $data = $this->authOtpService->requestPasswordResetCode($request->validated()['email']);
        return $this->success(
            $data,
            'Nếu email đã đăng ký, mã xác minh sẽ được gửi đến hộp thư của bạn.'
        );
    }

    public function verifyOtp(VerifyAuthOtpRequest $request)
    {
        $data = $this->authOtpService->verify(
            $request->validated()['public_id'],
            $request->validated()['code']
        );

        return $this->success($data, 'Xác minh OTP thành công.');
    }

    public function resendOtp(string $publicId)
    {
        return $this->success($this->authOtpService->resend($publicId), 'Mã OTP mới đã được gửi.');
    }

    public function resetPasswordWithOtp(ResetPasswordWithOtpRequest $request)
    {
        $data = $request->validated();
        $this->authOtpService->resetPassword(
            $data['public_id'],
            $data['verification_token'],
            $data['new_password']
        );
        return $this->clearRefreshCookie(
            $this->success(true, 'Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại.')
        );
    }

    public function refresh(Request $request)
    {
        try {
            $data = $this->authService->refresh(
                (string) $request->cookie('vinaclass_refresh', ''),
                $request
            );
            $refreshToken = $data['refresh_token'];
            unset($data['refresh_token']);

            return $this->withRefreshCookie($this->success($data), $refreshToken);
        } catch (HttpException $exception) {
            $response = $this->error(null, $exception->getMessage(), $exception->getStatusCode());

            return $exception->getStatusCode() === 409
                ? $response
                : $this->clearRefreshCookie($response);
        }
    }

    public function me()
    {
        $data = $this->authService->me();
        $data['me'] = new UserResource($data['me']);

        return $this->success($data);
    }


    public function logout()
    {
        return $this->clearRefreshCookie($this->authService->logout());
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
            $refreshToken = $data['refresh_token'];
            unset($data['refresh_token']);

            return $this->withRefreshCookie(
                redirect($frontendUrl . '#token=' . urlencode($data['access_token'])),
                $refreshToken
            );
        } catch (HttpException $e) {
            return $this->error(null, $e->getMessage(), $e->getStatusCode());
        } catch (Throwable $e) {
            Log::error('Google callback failed', [
                'message' => $e->getMessage(),
            ]);

            return $this->serverError();
        }
    }

    private function withRefreshCookie($response, string $refreshToken)
    {
        return $response->withCookie(cookie(
            'vinaclass_refresh',
            $refreshToken,
            (int) config('jwt.refresh_ttl', 20160),
            '/api/auth',
            config('auth.refresh_cookie_domain') ?: null,
            app()->environment('production') || request()->isSecure(),
            true,
            false,
            (app()->environment('production') || request()->isSecure()) ? 'none' : 'lax'
        ));
    }

    private function clearRefreshCookie($response)
    {
        return $response->withCookie(cookie(
            'vinaclass_refresh',
            '',
            -1,
            '/api/auth',
            config('auth.refresh_cookie_domain') ?: null,
            app()->environment('production') || request()->isSecure(),
            true,
            false,
            (app()->environment('production') || request()->isSecure()) ? 'none' : 'lax'
        ));
    }
}
