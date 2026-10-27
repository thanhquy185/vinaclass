<?php

use App\Http\Controllers\SubjectController;
use Illuminate\Support\Facades\Route;


Route::get('/subjects/with-course-groups', [SubjectController::class, 'getWithCourseGroups']);
Route::get('/subjects/with-chapters', [SubjectController::class, 'getWithChapters']);
Route::get('/subjects/{subject}/course-groups', [SubjectController::class, 'getCourseGroupsForExam']);

Route::get('/subjects', [SubjectController::class, 'index']);
Route::get('/subjects/{subject}', [SubjectController::class, 'show']);
Route::post('/subjects', [SubjectController::class, 'store'])->middleware('permission:create_mon_hoc');
Route::put('/subjects/{subject}', [SubjectController::class, 'update'])->middleware('permission:update_mon_hoc');
Route::delete('/subjects/{subject}', [SubjectController::class, 'destroy'])->middleware('permission:delete_mon_hoc');

Route::get('/subjects/teacher/{user}', [SubjectController::class, 'getOfTeacher']);
