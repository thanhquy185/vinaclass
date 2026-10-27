<?php

use App\Http\Controllers\AnswerOptionController;
use Illuminate\Support\Facades\Route;

Route::get('/answer-options', [AnswerOptionController::class, 'index'])->middleware('permission:view_cau_hoi');
Route::get('/answer-options/{answerOption}', [AnswerOptionController::class, 'show'])->middleware('permission:view_cau_hoi');
Route::post('/answer-options', [AnswerOptionController::class, 'store'])->middleware('permission:create_cau_hoi');
Route::put('/answer-options/{answerOption}', [AnswerOptionController::class, 'update'])->middleware('permission:update_cau_hoi');
Route::delete('/answer-options/{answerOption}', [AnswerOptionController::class, 'destroy'])->middleware('permission:delete_cau_hoi');
