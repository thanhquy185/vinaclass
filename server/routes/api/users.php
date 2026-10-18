<?php

use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;


Route::get('/users', [UserController::class, 'index']);
Route::get('/users/teachers', [UserController::class, 'getTeachers']);
Route::get('/users/{user}', [UserController::class, 'show']);
Route::post('/users', [UserController::class, 'store']);
Route::put('/users/{user}', [UserController::class, 'update']);
Route::delete('/users/{user}', [UserController::class, 'destroy']);
Route::post('/users/{user}/change-password', [UserController::class, 'changePassword']);
Route::post('/users/{user}/reset-password', [UserController::class, 'resetPassword']);
