<?php

use App\Http\Controllers\TeacherSubjectController;
use Illuminate\Support\Facades\Route;

Route::get('/teacher-assignments', [TeacherSubjectController::class, 'index'])->middleware('permission:view_phan_cong');
Route::get('/teacher-assignments/overview', [TeacherSubjectController::class, 'overview'])->middleware('permission:view_phan_cong');
Route::post('/teacher-assignments', [TeacherSubjectController::class, 'store'])->middleware('permission:assign_phan_cong');
Route::delete('/teacher-assignments/{teacherId}/{subjectId}', [TeacherSubjectController::class, 'destroy'])->middleware('permission:delete_phan_cong');
Route::get('/teacher-assignments/teacher/{user}', [TeacherSubjectController::class, 'getOfTeacher'])->middleware('permission:view_phan_cong');

Route::post('/teacher-assignments/sync', [TeacherSubjectController::class, 'syncAssignments'])->middleware('permission:assign_phan_cong');
