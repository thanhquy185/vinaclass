<?php

use App\Http\Controllers\QuestionController;
use Illuminate\Support\Facades\Route;

Route::get('/questions', [QuestionController::class, 'index']);
Route::get('/questions/all-public', [QuestionController::class, 'getAllPublic']);
Route::get('/questions/teacher/{user}', [QuestionController::class, 'getAllOfUser']);
Route::get('/questions/with-private/{user}', [QuestionController::class, "getWithPrivate"]);

Route::get('/questions/{question}', [QuestionController::class, 'show']);
Route::post('/questions', [QuestionController::class, 'store']);
Route::put('/questions/{question}', [QuestionController::class, 'update']);
Route::delete('/questions/{question}', [QuestionController::class, 'destroy']);
Route::patch('/questions/{question}/status', [QuestionController::class, 'changeStatus']);
Route::post('/questions/{question}/copy', [QuestionController::class, 'copyFromPublic']);
