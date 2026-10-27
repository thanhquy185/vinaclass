<?php

use App\Http\Controllers\QuestionController;
use Illuminate\Support\Facades\Route;

Route::middleware('permission:view_cau_hoi')->group(function () {
    Route::get('/questions/bank', [QuestionController::class, 'bank']);
    Route::get('/questions', [QuestionController::class, 'index']);
    Route::get('/questions/all-public', [QuestionController::class, 'getAllPublic']);
    Route::get('/questions/teacher/{user}', [QuestionController::class, 'getAllOfUser']);
    Route::get('/questions/with-private/{user}', [QuestionController::class, 'getWithPrivate']);
});

Route::get('/questions/{question}', [QuestionController::class, 'show'])->middleware('permission:view_cau_hoi');
Route::post('/questions', [QuestionController::class, 'store'])->middleware('permission:create_cau_hoi');
Route::put('/questions/{question}', [QuestionController::class, 'update'])->middleware('permission:update_cau_hoi');
Route::delete('/questions/{question}', [QuestionController::class, 'destroy'])->middleware('permission:delete_cau_hoi');
Route::patch('/questions/{question}/status', [QuestionController::class, 'changeStatus']);
Route::post('/questions/{question}/copy', [QuestionController::class, 'copyFromPublic'])->middleware('permission:create_cau_hoi');
