<?php

namespace App\Services;

use App\Models\AuthOtp;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpException;

class AuthOtpService
{
    private const PURPOSE_REGISTER = 'REGISTER';
    private const PURPOSE_RESET_PASSWORD = 'RESET_PASSWORD';
    private const OTP_LIFETIME_MINUTES = 5;
    private const RESEND_WAIT_SECONDS = 60;
    private const MAX_ATTEMPTS = 5;

    public function __construct(private AuthSessionService $authSessionService)
    {
    }

    public function requestRegistrationCode(string $email): array
    {
        $email = $this->normalizeEmail($email);
        if (User::query()->where('email', $email)->exists()) {
            throw ValidationException::withMessages([
                'email' => ['Email đã được sử dụng.'],
            ]);
        }

        return $this->createChallenge($email, self::PURPOSE_REGISTER, null, true);
    }

    public function requestPasswordResetCode(string $email): array
    {
        $email = $this->normalizeEmail($email);
        $user = User::query()->where('email', $email)->first();
        $activeUser = $user && !$user->is_locked && !$user->is_deleted ? $user : null;

        // Keep the response shape and message the same for known and unknown emails.
        return $this->createChallenge(
            $email,
            self::PURPOSE_RESET_PASSWORD,
            $activeUser?->id,
            $activeUser !== null
        );
    }

    public function verify(string $publicId, string $code): array
    {
        $verificationToken = DB::transaction(function () use ($publicId, $code): ?string {
            $otp = AuthOtp::query()->where('public_id', $publicId)->lockForUpdate()->first();
            if (!$otp || $otp->consumed_at || $otp->expires_at->isPast()) {
                return null;
            }

            if ($otp->attempts >= self::MAX_ATTEMPTS) {
                return null;
            }

            if (!hash_equals($otp->code_hash, $this->hashCode($code))) {
                $otp->attempts++;
                $otp->save();
                return null;
            }

            $verificationToken = bin2hex(random_bytes(32));
            $otp->verified_at ??= now();
            $otp->attempts = 0;
            $otp->verification_token_hash = $this->hashVerificationToken($verificationToken);
            $otp->save();
            return $verificationToken;
        });

        if (!$verificationToken) {
            throw ValidationException::withMessages([
                'code' => ['Mã OTP không hợp lệ, đã hết hạn hoặc đã vượt quá số lần nhập.'],
            ]);
        }

        return [
            'verified' => true,
            'verification_token' => $verificationToken,
        ];
    }

    public function resend(string $publicId): array
    {
        $result = DB::transaction(function () use ($publicId): array {
            $otp = AuthOtp::query()->where('public_id', $publicId)->lockForUpdate()->first();
            if (!$otp || $otp->consumed_at) {
                throw ValidationException::withMessages([
                    'public_id' => ['Phiên xác thực không tồn tại hoặc đã được sử dụng.'],
                ]);
            }

            if ($otp->resend_available_at->isFuture()) {
                throw ValidationException::withMessages([
                    'public_id' => ['Vui lòng đợi trước khi gửi lại mã OTP.'],
                ]);
            }

            $this->enforceRequestLimit($otp->email, $otp->purpose);

            $code = $this->generateCode();
            $otp->code_hash = $this->hashCode($code);
            $otp->attempts = 0;
            $otp->expires_at = now()->addMinutes(self::OTP_LIFETIME_MINUTES);
            $otp->resend_available_at = now()->addSeconds(self::RESEND_WAIT_SECONDS);
            $otp->verified_at = null;
            $otp->verification_token_hash = null;
            $otp->save();

            return [
                'otp' => $otp,
                'code' => $code,
            ];
        });

        $this->sendIfDeliverable($result['otp'], $result['code']);
        return $this->challengeResponse($result['otp']);
    }

    public function completeRegistration(
        string $publicId,
        string $email,
        string $verificationToken
    ): void
    {
        $otp = AuthOtp::query()->where('public_id', $publicId)->lockForUpdate()->first();
        $this->assertVerifiedPurpose($otp, self::PURPOSE_REGISTER, $verificationToken);

        if (!$otp || !hash_equals($otp->email, $this->normalizeEmail($email))) {
            throw ValidationException::withMessages([
                'email' => ['Email không khớp với email đã xác minh.'],
            ]);
        }

        $otp->consumed_at = now();
        $otp->verification_token_hash = null;
        $otp->save();
    }

    public function resetPassword(
        string $publicId,
        string $verificationToken,
        string $newPassword
    ): User
    {
        return DB::transaction(function () use ($publicId, $verificationToken, $newPassword): User {
            $otp = AuthOtp::query()->where('public_id', $publicId)->lockForUpdate()->first();
            $this->assertVerifiedPurpose($otp, self::PURPOSE_RESET_PASSWORD, $verificationToken);

            if (!$otp || !$otp->user_id) {
                throw ValidationException::withMessages([
                    'email' => ['Không thể xác minh tài khoản. Hãy kiểm tra email và thử lại.'],
                ]);
            }

            $user = User::query()->lockForUpdate()->findOrFail($otp->user_id);
            if ($user->is_locked || $user->is_deleted) {
                throw ValidationException::withMessages([
                    'email' => ['Tài khoản đã bị khóa hoặc ngừng hoạt động.'],
                ]);
            }

            $user->password = $newPassword;
            $user->save();

            $this->authSessionService->revokeAllForUser((int) $user->id);

            $otp->consumed_at = now();
            $otp->verification_token_hash = null;
            $otp->save();

            return $user;
        });
    }

    private function createChallenge(
        string $email,
        string $purpose,
        ?int $userId,
        bool $shouldSendEmail
    ): array {
        $this->enforceRequestLimit($email, $purpose);

        $result = DB::transaction(function () use ($email, $purpose, $userId, $shouldSendEmail): array {
            $otp = AuthOtp::query()
                ->where('email_hash', $this->hashEmail($email))
                ->where('purpose', $purpose)
                ->whereNull('consumed_at')
                ->latest('id')
                ->lockForUpdate()
                ->first();

            if ($otp && $otp->expires_at->isFuture() && $otp->resend_available_at->isFuture()) {
                return ['otp' => $otp, 'code' => null, 'should_send' => false];
            }

            $code = $this->generateCode();
            $attributes = [
                'email' => $email,
                'email_hash' => $this->hashEmail($email),
                'purpose' => $purpose,
                'user_id' => $userId,
                'code_hash' => $this->hashCode($code),
                'attempts' => 0,
                'expires_at' => now()->addMinutes(self::OTP_LIFETIME_MINUTES),
                'resend_available_at' => now()->addSeconds(self::RESEND_WAIT_SECONDS),
                'verified_at' => null,
                'consumed_at' => null,
                'verification_token_hash' => null,
            ];

            if ($otp) {
                $otp->fill($attributes);
                $otp->save();
            } else {
                $otp = AuthOtp::create(array_merge($attributes, [
                    'public_id' => (string) Str::uuid(),
                ]));
            }

            return ['otp' => $otp, 'code' => $code, 'should_send' => $shouldSendEmail];
        });

        if ($result['should_send'] && $result['code']) {
            $this->sendIfDeliverable($result['otp'], $result['code']);
        }

        return $this->challengeResponse($result['otp']);
    }

    private function assertVerifiedPurpose(
        ?AuthOtp $otp,
        string $purpose,
        string $verificationToken
    ): void
    {
        if (!$otp
            || $otp->purpose !== $purpose
            || $otp->consumed_at
            || !$otp->verified_at
            || !$otp->verification_token_hash
            || !hash_equals(
                $otp->verification_token_hash,
                $this->hashVerificationToken($verificationToken)
            )
            || $otp->expires_at->isPast()) {
            throw ValidationException::withMessages([
                'public_id' => ['Phiên xác minh không hợp lệ, đã hết hạn hoặc đã được sử dụng.'],
            ]);
        }
    }

    private function sendIfDeliverable(AuthOtp $otp, string $code): void
    {
        if ($otp->purpose === self::PURPOSE_RESET_PASSWORD && !$otp->user_id) {
            return;
        }

        $purposeLabel = $otp->purpose === self::PURPOSE_REGISTER
            ? 'xác minh đăng ký tài khoản VinaClass'
            : 'đặt lại mật khẩu VinaClass';

        try {
            Mail::raw(
                "Mã OTP {$purposeLabel} của bạn là: {$code}\nMã có hiệu lực trong "
                    . self::OTP_LIFETIME_MINUTES
                    . " phút. Nếu bạn không thực hiện yêu cầu này, hãy bỏ qua email.",
                function ($message) use ($otp, $purposeLabel) {
                    $message->to($otp->email)->subject('Mã OTP ' . $purposeLabel);
                }
            );
        } catch (\Throwable $exception) {
            $otp->resend_available_at = now();
            $otp->save();

            Log::error('Failed to send auth OTP email.', [
                'otp_id' => $otp->id,
                'purpose' => $otp->purpose,
                'exception' => $exception->getMessage(),
            ]);

            throw new HttpException(503, 'Không thể gửi email xác minh lúc này. Vui lòng thử lại.');
        }
    }

    private function challengeResponse(AuthOtp $otp): array
    {
        return [
            'public_id' => $otp->public_id,
            'email' => $this->maskEmail($otp->email),
            'expires_at' => $otp->expires_at->toIso8601String(),
            'resend_available_at' => $otp->resend_available_at->toIso8601String(),
        ];
    }

    private function enforceRequestLimit(string $email, string $purpose): void
    {
        $key = 'auth-otp:' . strtolower($purpose) . ':' . hash('sha256', $email);
        if (RateLimiter::tooManyAttempts($key, 5)) {
            throw new HttpException(429, 'Bạn đã yêu cầu quá nhiều mã OTP. Vui lòng thử lại sau.');
        }

        RateLimiter::hit($key, 900);
    }

    private function normalizeEmail(string $email): string
    {
        return mb_strtolower(trim($email));
    }

    private function generateCode(): string
    {
        return str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
    }

    private function hashCode(string $code): string
    {
        return hash_hmac('sha256', $code, (string) config('app.key'));
    }

    private function hashEmail(string $email): string
    {
        return hash_hmac('sha256', 'email:' . $email, (string) config('app.key'));
    }

    private function hashVerificationToken(string $token): string
    {
        return hash_hmac('sha256', 'verification:' . $token, (string) config('app.key'));
    }

    private function maskEmail(string $email): string
    {
        [$name, $domain] = array_pad(explode('@', $email, 2), 2, '');
        if ($name === '' || $domain === '') {
            return $email;
        }

        $visible = mb_substr($name, 0, 1);
        return $visible . str_repeat('*', max(2, mb_strlen($name) - 1)) . '@' . $domain;
    }
}
