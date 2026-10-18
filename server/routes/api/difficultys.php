<?php

use App\Http\Controllers\DifficultyController;
use Illuminate\Support\Facades\Route;

Route::get('/difficulties', [DifficultyController::class, 'index']);
Route::post('/difficulties', [DifficultyController::class, 'store']);
Route::get('/difficulties/{difficulty}', [DifficultyController::class, 'show']);
Route::put('/difficulties/{difficulty}', [DifficultyController::class, 'update']);
Route::delete('/difficulties/{difficulty}', [DifficultyController::class, 'destroy']);
