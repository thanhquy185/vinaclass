<?php

use App\Http\Controllers\ExamController;
use Illuminate\Support\Facades\Route;


Route::get('/exams', [ExamController::class, 'index']);
Route::get('/exams/{exam}', [ExamController::class, 'show']);
Route::post('/exams', [ExamController::class, 'store'])->middleware('permission:create_de_thi');
Route::post('/exams/generate-exams-by-filter', [ExamController::class, 'generateExamsByFilter'])->middleware('permission:create_de_thi');
Route::put('/exams/{exam}', [ExamController::class, 'update'])->middleware('permission:update_de_thi');
Route::delete('/exams/{exam}', [ExamController::class, 'destroy'])->middleware('permission:delete_de_thi');

Route::get('/exams/by-student/{user}', [ExamController::class, 'getExamsByStudent']);
Route::get('/exams/details/{exam}', [ExamController::class, 'getExamDetails']);

Route::get('/exams/by-course-group-and-student/{courseGroup}/{user}', [ExamController::class, 'getByCourseGroupAndStudent']);
