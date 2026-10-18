<?php

use App\Http\Controllers\AnswerOptionController;
use Illuminate\Support\Facades\Route;

Route::get('/answer-options', [AnswerOptionController::class, 'index']);
Route::get('/answer-options/{answerOption}', [AnswerOptionController::class, 'show']);
Route::post('/answer-options', [AnswerOptionController::class, 'store']);
Route::put('/answer-options/{answerOption}', [AnswerOptionController::class, 'update']);
Route::delete('/answer-options/{answerOption}', [AnswerOptionController::class, 'destroy']);
