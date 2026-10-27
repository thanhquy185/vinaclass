<?php

use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::put('/users/me/profile', [UserController::class, 'updateOwnProfile']);

Route::middleware('permission:view_nguoi_dung')->group(function () {
    Route::get('/users', [UserController::class, 'index']);
    Route::get('/users/teachers', [UserController::class, 'getTeachers']);
    Route::get('/users/roles', [UserController::class, 'getAssignableRoles']);
    Route::get('/users/{user}', [UserController::class, 'show']);
});
Route::post('/users', [UserController::class, 'store'])->middleware('permission:create_nguoi_dung');
Route::patch('/users/{user}/lock', [UserController::class, 'updateLockStatus']);
Route::put('/users/{user}', [UserController::class, 'update']);
Route::delete('/users/{user}', [UserController::class, 'destroy'])->middleware('permission:delete_nguoi_dung');
Route::post('/users/{user}/change-password', [UserController::class, 'changePassword']);
Route::post('/users/{user}/reset-password', [UserController::class, 'resetPassword'])->middleware('permission:update_nguoi_dung');
