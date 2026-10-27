<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpKernel\Exception\HttpException;

class AuthService
{
    protected RoleService $roleService;

    public function __construct(
        RoleService $roleService,
        private UserProfileService $userProfileService,
        private GoogleOAuthService $googleOAuthService,
        private StudentRegistrationService $studentRegistrationService
    ) {
        $this->roleService = $roleService;
    }

    public function login(array $data)
    {
        $login = $data['login'];
        $password = $data['password'];

        $loginField = 'username';
        $user = User::where('username', $login)->first();

        if (!$user) {
            $loginField = 'email';
            $user = User::where('email', $login)->first();
        }

        if (!$user) {
            throw new HttpException(401, 'Invalid credentials');
        }

        if ($user->is_locked || $user->is_deleted) {
            throw new HttpException(403, 'Tài khoản đã bị khóa hoặc ngừng hoạt động');
        }

        $credentials = [
            $loginField => $login,
            'password' => $password
        ];

        if (!$token = Auth::guard('api')->attempt($credentials)) {
            throw ValidationException::withMessages([
                'login' => ['Mật khẩu không đúng'],
            ]);
        }

        $this->userProfileService->loadPersonalProfiles($user);
        $role = $user->role_id ? $this->roleService->getRoleDetailById($user->role_id) : null;
        return [
            'access_token' => $token,
            'token_type'   => 'bearer',
            'me' => $user,
            'role' => $role
        ];
    }

    public function registerStudent(array $data): array
    {
        $user = $this->studentRegistrationService->createFromCredentials($data);

        $token = Auth::guard('api')->login($user);
        if (!$token) {
            throw new HttpException(500, 'Không thể tạo phiên đăng nhập.');
        }

        return [
            'access_token' => $token,
            'token_type' => 'bearer',
            'me' => $user,
            'role' => $this->roleService->getRoleDetailById((int) $user->role_id),
        ];
    }

    public function redirectToGoogle(Request $request, string $frontendUrl): RedirectResponse
    {
        return $this->googleOAuthService->redirectToGoogle($request, $frontendUrl);
    }

    public function resolveGoogleFrontendRedirectUrl(Request $request, string $frontendUrl): string
    {
        return $this->googleOAuthService->resolveFrontendRedirectUrl($request, $frontendUrl);
    }

    public function handleGoogleCallback(): array
    {
        return $this->googleOAuthService->handleGoogleCallback();
    }

    public function me()
    {
        $user = Auth::guard('api')->user();
        $this->userProfileService->loadPersonalProfiles($user);
        $role = $user->role_id ? $this->roleService->getRoleDetailById($user->role_id) : null;
        return [
            'token_type'   => 'bearer',
            'me' => $user,
            'role' => $role
        ];
    }

    public function logout()
    {
        Auth::guard('api')->logout();

        return response()->json([
            'message' => 'Đăng xuất thành công'
        ]);
    }

    public function setAuthCookie(Request $request)
    {
        $token = (string) Auth::guard('api')->getToken();

        if (empty($token)) {
            return response()->json(['error' => 'Token không hợp lệ'], 400);
        }

        $cookie = cookie(
            name: 'token',
            value: $token,
            minutes: 60 * 24 * 7,
            path: '/',
            domain: null,
            secure: true,
            httpOnly: true,
            raw: false,
            sameSite: 'None'
        );

        return response()->json([
            'success' => true,
            'message' => 'Cookie xác thực đã được thiết lập thành công'
        ])->withCookie($cookie);
    }
}
