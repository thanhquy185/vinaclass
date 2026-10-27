<?php

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/
require __DIR__ . '/api/auth.php';

Route::middleware(['auth:api', 'account.active'])->group(function () {
    require __DIR__ . '/api/dashboard.php';
    require __DIR__ . '/api/users.php';
    require __DIR__ . '/api/roles.php';
    require __DIR__ . '/api/permissions-v2.php';
    require __DIR__ . '/api/functions.php';
    require __DIR__ . '/api/roledetails.php';
    require __DIR__ . '/api/subjects.php';
    require __DIR__ . '/api/course-groups.php';
    require __DIR__ . '/api/exams.php';
    require __DIR__ . '/api/notifications.php';
    require __DIR__ . '/api/chapters.php';
    require __DIR__ . '/api/difficultys.php';
    require __DIR__ . '/api/questions.php';
    require __DIR__ . '/api/answer-options.php';
    require __DIR__ . '/api/exam-attempts.php';
    require __DIR__ . '/api/exam-configurations.php';
    require __DIR__ . '/api/teacher-assignments.php';
    require __DIR__ . '/api/exam-attempt-logs.php';
});
