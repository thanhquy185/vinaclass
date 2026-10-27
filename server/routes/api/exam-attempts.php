<?php

use App\Http\Controllers\ExamAttemptController;
use Illuminate\Support\Facades\Route;


Route::get('/exam-attempts', [ExamAttemptController::class, 'index'])->middleware('permission:view_de_thi');
Route::get('/exam-attempts/{examAttempt}', [ExamAttemptController::class, 'show'])->middleware('permission:view_de_thi');
Route::post('/exam-attempts', [ExamAttemptController::class, 'store'])->middleware('permission:create_de_thi');
Route::put('/exam-attempts/{examAttempt}', [ExamAttemptController::class, 'update'])->middleware('permission:update_de_thi');
Route::delete('/exam-attempts/{examAttempt}', [ExamAttemptController::class, 'destroy'])->middleware('permission:delete_de_thi');

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
