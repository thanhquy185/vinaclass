<?php

use App\Http\Controllers\ExamConfigurationController;
use Illuminate\Support\Facades\Route;

Route::get('/exam-configurations', [
    ExamConfigurationController::class,
    'index',
])->middleware('permission:view_de_thi');

Route::post('/exam-configurations', [
    ExamConfigurationController::class,
    'store',
])->middleware('permission:create_de_thi');

Route::get('/exam-configurations/{examConfiguration}', [
    ExamConfigurationController::class,
    'show',
])->middleware('permission:view_de_thi');

Route::put('/exam-configurations/{examConfiguration}', [
    ExamConfigurationController::class,
    'update',
])->middleware('permission:update_de_thi');

Route::delete('/exam-configurations/{examConfiguration}', [
    ExamConfigurationController::class,
    'destroy',
])->middleware('permission:delete_de_thi');
