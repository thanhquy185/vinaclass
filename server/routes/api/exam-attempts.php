<?php

use App\Http\Controllers\ExamAttemptController;
use Illuminate\Support\Facades\Route;


Route::get('/exam-attempts', [ExamAttemptController::class, 'index']);
Route::get('/exam-attempts/{examAttempt}', [ExamAttemptController::class, 'show']);
Route::post('/exam-attempts', [ExamAttemptController::class, 'store']);
Route::put('/exam-attempts/{examAttempt}', [ExamAttemptController::class, 'update']);
Route::delete('/exam-attempts/{examAttempt}', [ExamAttemptController::class, 'destroy']);

Route::post('/exam-attempts/start-test', [ExamAttemptController::class, 'startTest']);
Route::put(
    '/exam-attempts/update-student-test/{examAttempt}',
    [ExamAttemptController::class, 'updateStudentTest']
);

Route::put(
    '/exam-attempts/submit-test/{examAttempt}',
    [ExamAttemptController::class, 'submitTest']
);

Route::get(
    '/exam-attempts/review-result/{examAttempt}',
    [ExamAttemptController::class, 'reviewResult']
);

Route::get(
    '/exam-attempts/get-by-student/{user}',
    [ExamAttemptController::class, 'getOfStudent']
);

Route::get(
    '/exam-attempts/get-by-course-group-exam/{courseGroup}/{exam}',
    [ExamAttemptController::class, 'getOfCourseGroupAndExam']
);
