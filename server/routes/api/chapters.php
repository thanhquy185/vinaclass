<?php

use App\Http\Controllers\ChapterController;
use Illuminate\Support\Facades\Route;

Route::get('/chapters', [ChapterController::class, 'index']);
Route::get('/chapters/{chapter}', [ChapterController::class, 'show']);
Route::post('/chapters', [ChapterController::class, 'store']);
Route::put('/chapters/bySubject/{subject}', [ChapterController::class, 'update']);
Route::delete('/chapters/{chapter}', [ChapterController::class, 'destroy']);
Route::get('/chapters/by-subject/{subject}', [ChapterController::class, 'getBySubject']);
