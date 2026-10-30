<?php

namespace App\Services;

use App\Models\AuthSession;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Symfony\Component\HttpKernel\Exception\HttpException;

class AuthSessionService
{
    private const ROTATION_REUSE_GRACE_SECONDS = 10;

    public function issueForUser(User $user, Request $request): array
    {
        return DB::transaction(function () use ($user, $request): array {
            $sessionId = (string) Str::uuid();
            $refreshToken = bin2hex(random_bytes(32));

            AuthSession::create($this->sessionAttributes(
                $user,
                $sessionId,
                $refreshToken,
                $request
            ));

            return [
                'access_token' => $this->createAccessToken($user, $sessionId),
                'refresh_token' => $refreshToken,
            ];
        });
    }

    public function refresh(string $refreshToken, Request $request): array
    {
        if ($refreshToken === '') {
            throw new HttpException(401, 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        }

        $result = DB::transaction(function () use ($refreshToken, $request): array {
            $session = AuthSession::query()
                ->where('refresh_token_hash', $this->hashToken($refreshToken))
                ->lockForUpdate()
                ->first();

            if (!$session) {
                return ['error' => 'invalid'];
            }

            $now = now();
            if ($session->revoked_at) {
                if ($session->replaced_by_id) {
                    if ($session->revoked_at->greaterThan($now->copy()->subSeconds(self::ROTATION_REUSE_GRACE_SECONDS))) {
                        return ['error' => 'concurrent_rotation'];
                    }

                    AuthSession::query()
                        ->where('session_id', $session->session_id)
                        ->whereNull('revoked_at')
                        ->update(['revoked_at' => $now, 'updated_at' => $now]);
                }

                return ['error' => 'revoked'];
            }

            if ($session->expires_at->isPast()) {
                $session->revoked_at = $now;
                $session->save();
                return ['error' => 'expired'];
            }

            $user = $session->user;
            if (!$user || $user->is_locked || $user->is_deleted) {
                AuthSession::query()
                    ->where('session_id', $session->session_id)
                    ->whereNull('revoked_at')
                    ->update(['revoked_at' => $now, 'updated_at' => $now]);

                return ['error' => 'inactive'];
            }

            $newRefreshToken = bin2hex(random_bytes(32));
            $nextSession = AuthSession::create($this->sessionAttributes(
                $user,
                $session->session_id,
                $newRefreshToken,
                $request
            ));

            $session->last_used_at = $now;
            $session->revoked_at = $now;
            $session->replaced_by_id = $nextSession->id;
            $session->save();

            return [
                'access_token' => $this->createAccessToken($user, $session->session_id),
                'refresh_token' => $newRefreshToken,
            ];
        });

        if (isset($result['error'])) {
            $status = match ($result['error']) {
                'inactive' => 403,
                'concurrent_rotation' => 409,
                default => 401,
            };
            throw new HttpException($status, 'Phiên đăng nhập không còn hợp lệ. Vui lòng đăng nhập lại.');
        }

        return $result;
    }

    public function isActive(string $sessionId, ?int $userId = null): bool
    {
        $query = AuthSession::query()
            ->where('session_id', $sessionId)
            ->whereNull('revoked_at')
            ->where('expires_at', '>', now());

        if ($userId !== null) {
            $query->where('user_id', $userId);
        }

        return $query->exists();
    }

    public function revokeSession(?string $sessionId): void
    {
        if (!$sessionId) {
            return;
        }

        AuthSession::query()
            ->where('session_id', $sessionId)
            ->whereNull('revoked_at')
            ->update(['revoked_at' => now(), 'updated_at' => now()]);
    }

    public function revokeAllForUser(int $userId): void
    {
        AuthSession::query()
            ->where('user_id', $userId)
            ->whereNull('revoked_at')
            ->update(['revoked_at' => now(), 'updated_at' => now()]);
    }

    public function currentSessionId(): ?string
    {
        try {
            $sessionId = Auth::guard('api')->payload()->get('sid');
            return is_string($sessionId) && $sessionId !== '' ? $sessionId : null;
        } catch (\Throwable) {
            return null;
        }
    }

    private function createAccessToken(User $user, string $sessionId): string
    {
        return Auth::guard('api')->claims(['sid' => $sessionId])->login($user);
    }

    private function sessionAttributes(
        User $user,
        string $sessionId,
        string $refreshToken,
        Request $request
    ): array {
        return [
            'session_id' => $sessionId,
            'user_id' => $user->id,
            'refresh_token_hash' => $this->hashToken($refreshToken),
            'expires_at' => now()->addMinutes((int) config('jwt.refresh_ttl', 20160)),
            'last_used_at' => now(),
            'device_name' => $request->userAgent()
                ? Str::limit((string) $request->userAgent(), 120, '')
                : null,
            'user_agent' => $request->userAgent()
                ? Str::limit((string) $request->userAgent(), 512, '')
                : null,
            'ip_address' => $request->ip(),
        ];
    }

    private function hashToken(string $token): string
    {
        return hash('sha256', $token);
    }
}
