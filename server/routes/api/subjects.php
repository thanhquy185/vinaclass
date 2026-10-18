<?php

use App\Http\Controllers\SubjectController;
use Illuminate\Support\Facades\Route;


Route::get('/subjects/with-course-groups', [SubjectController::class, 'getWithCourseGroups']);
Route::get('/subjects/with-chapters', [SubjectController::class, 'getWithChapters']);

Route::get('/subjects', [SubjectController::class, 'index']);
Route::get('/subjects/{subject}', [SubjectController::class, 'show']);
Route::post('/subjects', [SubjectController::class, 'store']);
Route::put('/subjects/{subject}', [SubjectController::class, 'update']);
Route::delete('/subjects/{subject}', [SubjectController::class, 'destroy']);

Route::get('/subjects/teacher/{user}', [SubjectController::class, 'getOfTeacher']);
