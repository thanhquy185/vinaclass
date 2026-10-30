<?php

use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login'])
    ->middleware('throttle:auth-login')
    ->name('login');
Route::post('/register', [AuthController::class, 'register'])
    ->middleware('throttle:auth-register')
    ->name('register');
Route::post('/auth/otp/register', [AuthController::class, 'requestRegistrationOtp'])
    ->middleware('throttle:auth-otp-register');
Route::post('/auth/otp/forgot-password', [AuthController::class, 'requestPasswordResetOtp'])
    ->middleware('throttle:auth-otp-reset');
Route::post('/auth/otp/verify', [AuthController::class, 'verifyOtp'])
    ->middleware('throttle:auth-otp-verify');
Route::post('/auth/otp/resend/{publicId}', [AuthController::class, 'resendOtp'])
    ->middleware('throttle:auth-otp-resend');
Route::post('/auth/otp/reset-password', [AuthController::class, 'resetPasswordWithOtp'])
    ->middleware('throttle:auth-password-reset');
Route::post('/auth/refresh', [AuthController::class, 'refresh'])
    ->middleware(['throttle:auth-refresh', 'auth.refresh-origin']);
Route::middleware(['auth:api', 'auth.session'])->group(function () {
    Route::get('/me', [AuthController::class, 'me'])->middleware('account.active');
    Route::post('/logout', [AuthController::class, 'logout']);
});
