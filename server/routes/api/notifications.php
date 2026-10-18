<?php

use App\Http\Controllers\NotificationController;
use Illuminate\Support\Facades\Route;


Route::get('/notifications', [NotificationController::class, 'index']);
Route::get('/notifications/{notification}', [NotificationController::class, 'show']);
Route::post('/notifications', [NotificationController::class, 'store']);
Route::put('/notifications/{notification}', [NotificationController::class, 'update']);
Route::delete('/notifications/{notification}', [NotificationController::class, 'destroy']);