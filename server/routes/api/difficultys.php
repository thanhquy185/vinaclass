<?php

use App\Http\Controllers\DifficultyController;
use Illuminate\Support\Facades\Route;

Route::get('/difficulties', [DifficultyController::class, 'index']);
Route::post('/difficulties', [DifficultyController::class, 'store'])->middleware('permission:create_do_kho');
Route::get('/difficulties/{difficulty}', [DifficultyController::class, 'show']);
Route::put('/difficulties/{difficulty}', [DifficultyController::class, 'update'])->middleware('permission:update_do_kho');
Route::delete('/difficulties/{difficulty}', [DifficultyController::class, 'destroy'])->middleware('permission:delete_do_kho');
