<?php

use App\Http\Controllers\NotificationController;
use Illuminate\Support\Facades\Route;


Route::get('/notifications', [NotificationController::class, 'index']);
Route::get('/notifications/{notification}', [NotificationController::class, 'show']);
Route::post('/notifications', [NotificationController::class, 'store'])->middleware('permission:create_thong_bao');
Route::put('/notifications/{notification}', [NotificationController::class, 'update']);
Route::delete('/notifications/{notification}', [NotificationController::class, 'destroy'])->middleware('permission:delete_thong_bao');
Route::delete('/notifications/{notification}/course-groups/{courseGroup}', [NotificationController::class, 'removeFromCourseGroup'])->middleware('permission:update_thong_bao');
