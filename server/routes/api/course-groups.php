<?php

use App\Http\Controllers\CourseGroupController;
use Illuminate\Support\Facades\Route;

Route::get('/course-groups', [CourseGroupController::class, 'index']);
Route::get('/course-groups/{courseGroup}', [CourseGroupController::class, 'show']);
Route::post('/course-groups', [CourseGroupController::class, 'store']);
Route::put('/course-groups/{courseGroup}', [CourseGroupController::class, 'update']);
Route::delete('/course-groups/{courseGroup}', [CourseGroupController::class, 'destroy']);

Route::patch('/course-groups/hidden/{courseGroup}', [CourseGroupController::class, 'hide']);
Route::post('/course-groups/join', [CourseGroupController::class, 'joinGroup']);
Route::patch('/course-groups/invite-code/{courseGroup}', [CourseGroupController::class, 'resetInviteCode']);

Route::get('/course-groups/student/{user}', [CourseGroupController::class, 'getByStudent']);
Route::get('/course-groups/teacher/{user}', [CourseGroupController::class, 'getByTeacher']);
Route::get('/course-groups/assigned/{user}', [CourseGroupController::class, 'getAssignedTeaching']);

Route::get('/course-groups/{courseGroup}/students', [CourseGroupController::class, 'getStudentList']);
Route::get('/course-groups/{courseGroup}/students/export', [CourseGroupController::class, 'exportStudents']);
Route::post('/course-groups/{courseGroup}/students/import', [CourseGroupController::class, 'importStudents']);
Route::post('/course-groups/{courseGroup}/students', [CourseGroupController::class, 'addStudentToGroup']);
Route::delete('/course-groups/{courseGroup}/students', [CourseGroupController::class, 'removeStudentFromGroup']);

Route::get('/course-groups/{courseGroup}/teacher-subject', [CourseGroupController::class, 'getWithTeacherAndSubject']);
Route::get('/course-groups/{courseGroup}/exams', [CourseGroupController::class, 'getWithExams']);
Route::get('/course-groups/{courseGroup}/announcements', [CourseGroupController::class, 'getWithNotifications']);
Route::get('/course-groups/{courseGroup}/student-detail', [CourseGroupController::class, 'getForStudentDetail']);
