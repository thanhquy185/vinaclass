<?php

use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login'])->name('login');
Route::post('/register', [AuthController::class, 'register'])
    ->middleware('throttle:5,1')
    ->name('register');
Route::post('/auth/set-cookie', [AuthController::class, 'setAuthCookie'])
    ->middleware(['auth:api', 'account.active']);

Route::middleware('auth:api')->group(function () {
    Route::get('/me', [AuthController::class, 'me'])->middleware('account.active');
    Route::post('/logout', [AuthController::class, 'logout']);
});
