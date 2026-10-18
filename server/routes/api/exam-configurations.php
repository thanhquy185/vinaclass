<?php

use App\Http\Controllers\ExamConfigurationController;
use Illuminate\Support\Facades\Route;

Route::get('/exam-configurations', [
    ExamConfigurationController::class,
    'index',
]);

Route::post('/exam-configurations', [
    ExamConfigurationController::class,
    'store',
]);

Route::get('/exam-configurations/{examConfiguration}', [
    ExamConfigurationController::class,
    'show',
]);

Route::put('/exam-configurations/{examConfiguration}', [
    ExamConfigurationController::class,
    'update',
]);

Route::delete('/exam-configurations/{examConfiguration}', [
    ExamConfigurationController::class,
    'destroy',
]);
