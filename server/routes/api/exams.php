<?php

use App\Http\Controllers\ExamController;
use Illuminate\Support\Facades\Route;


Route::get('/exams', [ExamController::class, 'index']);
Route::get('/exams/{exam}', [ExamController::class, 'show']);
Route::post('/exams', [ExamController::class, 'store']);
Route::post('/exams/generate-exams-by-filter', [ExamController::class, 'generateExamsByFilter']);
Route::put('/exams/{exam}', [ExamController::class, 'update']);
Route::delete('/exams/{exam}', [ExamController::class, 'destroy']);

Route::get('/exams/by-student/{user}', [ExamController::class, 'getExamsByStudent']);
Route::get('/exams/details/{exam}', [ExamController::class, 'getExamDetails']);

Route::get('/exams/by-course-group-and-student/{courseGroup}/{user}', [ExamController::class, 'getByCourseGroupAndStudent']);
