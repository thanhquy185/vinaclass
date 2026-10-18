<?php

use App\Http\Controllers\TeacherSubjectController;
use Illuminate\Support\Facades\Route;

Route::get('/teacher-assignments', [TeacherSubjectController::class, 'index']);
Route::post('/teacher-assignments', [TeacherSubjectController::class, 'store']);
Route::delete('/teacher-assignments/{teacherId}/{subjectId}', [TeacherSubjectController::class, 'destroy']);
Route::get('/teacher-assignments/teacher/{user}', [TeacherSubjectController::class, 'getOfTeacher']);

Route::post('/teacher-assignments/sync', [TeacherSubjectController::class, 'syncAssignments']);
