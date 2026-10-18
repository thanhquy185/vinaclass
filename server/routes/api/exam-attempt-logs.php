<?php

use App\Http\Controllers\ExamAttemptLogController;
use Illuminate\Support\Facades\Route;



Route::put(
    '/exam-attempt-logs/{examAttempt}',
    [ExamAttemptLogController::class, 'update']
);


