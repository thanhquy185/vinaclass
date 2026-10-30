<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
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
        private StudentRegistrationService $studentRegistrationService,
        private AuthSessionService $authSessionService
    ) {
        $this->roleService = $roleService;
    }

    public function login(array $data, Request $request): array
    {
        $login = $data['login'];
        $password = $data['password'];

        $user = User::where('username', $login)->first();

        if (!$user) {
            $user = User::where('email', $login)->first();
        }

        if (!$user) {
            throw new HttpException(401, 'Invalid credentials');
        }

        if ($user->is_locked || $user->is_deleted) {
            throw new HttpException(403, 'Tài khoản đã bị khóa hoặc ngừng hoạt động');
        }

        if (!Hash::check($password, (string) $user->password)) {
            throw ValidationException::withMessages([
                'login' => ['Mật khẩu không đúng'],
            ]);
        }

        $session = $this->authSessionService->issueForUser($user, $request);

        $this->userProfileService->loadPersonalProfiles($user);
        $role = $user->role_id ? $this->roleService->getRoleDetailById($user->role_id) : null;
        return [
            'access_token' => $session['access_token'],
            'refresh_token' => $session['refresh_token'],
            'token_type'   => 'bearer',
            'me' => $user,
            'role' => $role
        ];
    }

    public function registerStudent(array $data, Request $request): array
    {
        $user = $this->studentRegistrationService->createFromCredentials($data);
        $session = $this->authSessionService->issueForUser($user, $request);

        return [
            'access_token' => $session['access_token'],
            'refresh_token' => $session['refresh_token'],
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
        $this->authSessionService->revokeSession($this->authSessionService->currentSessionId());
        Auth::guard('api')->logout();

        return response()->json([
            'message' => 'Đăng xuất thành công'
        ]);
    }

    public function refresh(string $refreshToken, Request $request): array
    {
        $session = $this->authSessionService->refresh($refreshToken, $request);

        return [
            'access_token' => $session['access_token'],
            'refresh_token' => $session['refresh_token'],
            'token_type' => 'bearer',
        ];
    }

}
