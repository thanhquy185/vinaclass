<?php

use App\Http\Controllers\ChapterController;
use Illuminate\Support\Facades\Route;

Route::get('/chapters', [ChapterController::class, 'index']);
Route::get('/chapters/{chapter}', [ChapterController::class, 'show']);
Route::post('/chapters', [ChapterController::class, 'store'])->middleware('permission:create_chuong');
Route::put('/chapters/bySubject/{subject}', [ChapterController::class, 'update'])->middleware('permission:update_chuong');
Route::delete('/chapters/{chapter}', [ChapterController::class, 'destroy'])->middleware('permission:delete_chuong');
Route::get('/chapters/by-subject/{subject}', [ChapterController::class, 'getBySubject']);
