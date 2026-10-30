<?php

namespace Tests\Feature;

use App\Models\AuthOtp;
use App\Models\AuthSession;
use App\Models\Role;
use App\Models\User;
use App\Services\AuthSessionService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class AuthOtpFlowTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        config(['jwt.secret' => 'auth-flow-test-secret']);
    }

    public function test_student_registration_and_password_reset_use_email_otp(): void
    {
        $codes = [];
        Mail::shouldReceive('raw')
            ->twice()
            ->andReturnUsing(function (string $body) use (&$codes): void {
                preg_match('/là: (\d{6})/', $body, $matches);
                $codes[] = $matches[1] ?? null;
            });

        $registration = $this->postJson('/api/auth/otp/register', [
            'email' => 'student@example.edu',
        ])->assertCreated()->json('data');

        $this->assertNotEmpty($registration['publicId']);
        $registrationVerification = $this->postJson('/api/auth/otp/verify', [
            'public_id' => $registration['publicId'],
            'code' => $codes[0],
        ])->assertOk()->json('data.verificationToken');

        $role = Role::query()->where('code', 'STUDENT')->firstOrFail();

        $this->postJson('/api/register', [
            'full_name' => 'Student Test',
            'student_code' => 'student1234',
            'email' => 'student@example.edu',
            'password' => 'StudentPass123',
            'password_confirmation' => 'StudentPass123',
            'otp_public_id' => $registration['publicId'],
            'otp_verification_token' => $registrationVerification,
        ])->assertCreated()
            ->assertJsonPath('data.me.email', 'student@example.edu')
            ->assertCookie('vinaclass_refresh');

        $user = User::query()->where('email', 'student@example.edu')->firstOrFail();
        $this->assertSame($role->id, $user->role_id);
        $this->assertNotNull($user->email_verified_at);
        $this->assertNotNull(AuthSession::query()->where('user_id', $user->id)->first());
        $this->assertNotNull(AuthOtp::query()->where('public_id', $registration['publicId'])->value('consumed_at'));

        $reset = $this->postJson('/api/auth/otp/forgot-password', [
            'email' => 'student@example.edu',
        ])->assertOk()->json('data');
        $resetVerification = $this->postJson('/api/auth/otp/verify', [
            'public_id' => $reset['publicId'],
            'code' => $codes[1],
        ])->assertOk()->json('data.verificationToken');

        $this->postJson('/api/auth/otp/reset-password', [
            'public_id' => $reset['publicId'],
            'verification_token' => $resetVerification,
            'new_password' => 'NewStudentPass123',
            'new_password_confirmation' => 'NewStudentPass123',
        ])->assertOk();

        $this->assertTrue(Hash::check('NewStudentPass123', $user->fresh()->password));
        $this->assertSame(0, AuthSession::query()
            ->where('user_id', $user->id)
            ->whereNull('revoked_at')
            ->count());

        $login = $this->postJson('/api/login', [
            'login' => 'student1234',
            'password' => 'NewStudentPass123',
        ])->assertOk()->json('data');

        $this->withToken($login['accessToken'])
            ->postJson('/api/users/' . $user->id . '/change-password', [
                'current_password' => 'NewStudentPass123',
                'new_password' => 'ChangedStudentPass123',
                'new_password_confirmation' => 'ChangedStudentPass123',
            ])->assertOk();

        $this->assertTrue(Hash::check('ChangedStudentPass123', $user->fresh()->password));
        $this->assertSame(0, AuthSession::query()
            ->where('user_id', $user->id)
            ->whereNull('revoked_at')
            ->count());
    }

    public function test_refresh_rotation_preserves_a_session_during_parallel_refresh(): void
    {
        $role = Role::query()->where('code', 'STUDENT')->firstOrFail();
        $user = User::query()->create([
            'username' => 'student1234',
            'email' => 'student@example.edu',
            'password' => 'StudentPass123',
            'role_id' => $role->id,
        ]);
        $service = app(AuthSessionService::class);
        $issued = $service->issueForUser($user, Request::create('/api/login', 'POST'));

        $this->withCredentials();
        $rotatedResponse = $this->withHeader('Origin', 'http://localhost:5173')
            ->withUnencryptedCookie('vinaclass_refresh', $issued['refresh_token'])
            ->postJson('/api/auth/refresh');
        $this->assertSame(200, $rotatedResponse->status(), json_encode($rotatedResponse->json()));
        $rotatedResponse->assertJsonStructure(['data' => ['accessToken']]);

        $rotatedCookie = collect($rotatedResponse->baseResponse->headers->getCookies())
            ->first(fn ($cookie) => $cookie->getName() === 'vinaclass_refresh');
        $this->assertNotNull($rotatedCookie);

        $this->withHeader('Origin', 'http://localhost:5173')
            ->withUnencryptedCookie('vinaclass_refresh', $issued['refresh_token'])
            ->postJson('/api/auth/refresh')
            ->assertStatus(409);

        $this->assertTrue($service->isActive(
            AuthSession::query()->where('refresh_token_hash', hash('sha256', $rotatedCookie->getValue()))->value('session_id'),
            (int) $user->id
        ));
    }

    public function test_otp_can_be_retried_after_mail_failure_and_after_expiry(): void
    {
        $sendCount = 0;
        Mail::shouldReceive('raw')
            ->times(3)
            ->andReturnUsing(function () use (&$sendCount): void {
                $sendCount++;
                if ($sendCount === 1) {
                    throw new \RuntimeException('Temporary SMTP failure');
                }
            });

        $this->postJson('/api/auth/otp/register', [
            'email' => 'student@example.edu',
        ])->assertStatus(503);

        $retryChallenge = $this->postJson('/api/auth/otp/register', [
            'email' => 'student@example.edu',
        ])->assertCreated()->json('data');

        AuthOtp::query()->where('public_id', $retryChallenge['publicId'])->update([
            'expires_at' => now()->subMinute(),
            'resend_available_at' => now()->subMinute(),
        ]);

        $this->postJson('/api/auth/otp/resend/' . $retryChallenge['publicId'])
            ->assertOk();
        $this->assertTrue(AuthOtp::query()
            ->where('public_id', $retryChallenge['publicId'])
            ->firstOrFail()
            ->expires_at->isFuture());
    }
}
