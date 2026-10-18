<?php

namespace App\Services;

use GuzzleHttp\Exception\ClientException;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\GoogleProvider;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpKernel\Exception\HttpException;

class AuthService
{
    protected RoleService $roleService;
    public function __construct(RoleService $roleService)
    {
        $this->roleService = $roleService;
    }
    public function login(array $data)
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

        $credentials = [
            $user->email === $login ? 'email' : 'username' => $login,
            'password' => $password
        ];

        if (!$token = Auth::guard('api')->attempt($credentials)) {
            throw ValidationException::withMessages([
                'login' => ['Mật khẩu không đúng'],
            ]);
        }

        $role = $user->role_id ? $this->roleService->getRoleDetailById($user->role_id) : null;

        return response()->json([
            'access_token' => $token,
            'token_type'   => 'bearer',
            'me' => Auth::guard('api')->user(),
            'role' => $role
        ]);
    }

    public function redirectToGoogle(Request $request, string $frontendUrl): RedirectResponse
    {
        return $this->googleProvider()->with(['state' => 'frontend_url=' . $frontendUrl])->redirect();
    }

    public function handleGoogleCallback(): array
    {
        $oauthError = request()->query('error');
        if ($oauthError) {
            // throw new HttpException(400, 'Đăng nhập Google bị hủy hoặc thất bại từ phía Google');
            return ['error' => 'google_auth_error'];
        }

        if (!request()->filled('code')) {
            // throw new HttpException(400, 'Thiếu mã xác thực Google. Hãy bắt đầu từ endpoint /auth/google/redirect');
            return ['error' => 'google_auth_error'];
        }

        try {
            $googleUser = $this->googleProvider()->stateless()->user();
        } catch (ClientException $e) {
            // throw new HttpException(400, 'Mã xác thực Google không hợp lệ hoặc đã hết hạn');
            return ['error' => 'google_auth_error'];
        }

        $email = $googleUser->getEmail();

        if (!$email) {
            return ['error' => 'unauthorized_domain'];
        }

        $user = User::where('email', $email)->first();

        if (!$user) {
            return ['error' => 'unauthorized_domain'];
        }

        $googleId = $googleUser->getId();
        if (!$user->google_id && $googleId) { // NOTE: $user->ggid -> $user->google_id
            $user->google_id = $googleId;      // NOTE: ggid -> google_id
            $user->save();
            $user->refresh();
        }

        $token = Auth::guard('api')->login($user);

        if (!$token) {
            return (["error" => "login_failed"]);
        }

        $role = $user->role_id ? $this->roleService->getRoleDetailById($user->role_id) : null;

        return [
            'access_token' => $token,
            'token_type'   => 'bearer',
            'me' => $user,
            'role' => $role,
        ];
    }

    private function googleProvider(): GoogleProvider
    {
        /** @var GoogleProvider $provider */
        $provider = Socialite::driver('google');

        return $provider;
    }

    public function me()
    {
        $user = Auth::user();
        $role = $user->role_id ? $this->roleService->getRoleDetailById($user->role_id) : null;
        return response()->json([
            'token_type'   => 'bearer',
            'me' => Auth::guard('api')->user(),
            'role' => $role
        ]);
    }

    public function logout()
    {
        Auth::logout();

        return response()->json([
            'message' => 'Đăng xuất thành công'
        ]);
    }

    public function setAuthCookie(Request $request)
    {
        $token = $request->input('access_token');

        Log::info($token);

        if (empty($token) || !is_string($token)) {
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
