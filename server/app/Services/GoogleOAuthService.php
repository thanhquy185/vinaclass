<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Http\Request;
use GuzzleHttp\Exception\ClientException;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\GoogleProvider;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpKernel\Exception\HttpException;

class GoogleOAuthService
{
    public function __construct(
        private RoleService $roleService,
        private StudentRegistrationService $studentRegistrationService,
        private AuthSessionService $authSessionService
    ) {
    }

    public function redirectToGoogle(Request $request, string $frontendUrl): RedirectResponse
    {
        $request->session()->put('google_frontend_redirect', $frontendUrl);
        $request->session()->put(
            'google_register_student',
            $request->query('intent') === 'register'
        );

        return $this->googleProvider()->redirect();
    }

    public function resolveFrontendRedirectUrl(Request $request, string $frontendUrl): string
    {
        $requestedUrl = $request->query('redirect_url');
        if ($requestedUrl) {
            $requested = parse_url($requestedUrl);
            $configured = parse_url($frontendUrl);
            if (!$requested || !$configured) {
                abort(400, 'Địa chỉ chuyển hướng không hợp lệ');
            }

            $requestedPort = $requested['port'] ?? (($requested['scheme'] ?? null) === 'https' ? 443 : 80);
            $configuredPort = $configured['port'] ?? (($configured['scheme'] ?? null) === 'https' ? 443 : 80);
            if (strtolower((string) ($requested['host'] ?? '')) !== strtolower((string) ($configured['host'] ?? ''))
                || strtolower((string) ($requested['scheme'] ?? '')) !== strtolower((string) ($configured['scheme'] ?? ''))
                || $requestedPort !== $configuredPort
                || ($requested['path'] ?? '/') !== '/auth/callback'
                || isset($requested['user'])
                || isset($requested['pass'])
                || isset($requested['query'])
                || isset($requested['fragment'])) {
                abort(400, 'Địa chỉ chuyển hướng không hợp lệ');
            }

            $frontendUrl = $requestedUrl;
        }

        return $frontendUrl;
    }

    public function handleGoogleCallback(): array
    {
        $registerStudent = (bool) request()->session()->pull('google_register_student', false);
        $oauthError = request()->query('error');
        if ($oauthError) {
            // throw new HttpException(400, 'Google sign-in was cancelled or failed');
            return ['error' => 'google_auth_error'];
        }

        if (!request()->filled('code')) {
            // throw new HttpException(400, 'Google authorization code is missing. Start with /auth/google/redirect');
            return ['error' => 'google_auth_error'];
        }

        try {
            $googleUser = $this->googleProvider()->user();
        } catch (ClientException $exception) {
            // throw new HttpException(400, 'Google authorization code is invalid or expired');
            return ['error' => 'google_auth_error'];
        }

        $email = $googleUser->getEmail();
        if (!$email) {
            return ['error' => 'unauthorized_domain'];
        }

        $verifiedEmail = filter_var(
            $googleUser->getRaw()['verified_email'] ?? false,
            FILTER_VALIDATE_BOOLEAN
        );
        if (!$verifiedEmail) {
            return ['error' => 'email_not_verified'];
        }

        $email = mb_strtolower(trim($email));
        $googleId = $googleUser->getId();
        $user = User::where('email', $email)->first();
        if (!$user && $registerStudent) {
            try {
                $user = $this->studentRegistrationService->createFromGoogle(
                    $email,
                    $googleUser->getName(),
                    $googleId
                );
            } catch (HttpException) {
                return ['error' => 'google_auth_error'];
            }
        }

        if (!$user) {
            return ['error' => 'unauthorized_domain'];
        }

        if ($user->is_locked || $user->is_deleted) {
            return ['error' => 'account_inactive'];
        }

        if (!$user->ggid && $googleId) {
            $user->ggid = $googleId;
        }

        if (!$user->email_verified_at) {
            $user->email_verified_at = now();
        }
        $user->save();
        $user->refresh();

        $session = $this->authSessionService->issueForUser($user, request());

        return [
            'access_token' => $session['access_token'],
            'refresh_token' => $session['refresh_token'],
            'token_type' => 'bearer',
            'me' => $user,
            'role' => $user->role_id
                ? $this->roleService->getRoleDetailById($user->role_id)
                : null,
        ];
    }

    private function googleProvider(): GoogleProvider
    {
        /** @var GoogleProvider $provider */
        $provider = Socialite::driver('google');

        return $provider;
    }
}
