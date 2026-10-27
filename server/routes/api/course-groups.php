<?php

use App\Http\Controllers\CourseGroupController;
use App\Http\Controllers\CourseGroupMaterialController;
use Illuminate\Support\Facades\Route;

Route::get('/course-groups', [CourseGroupController::class, 'index'])->middleware('permission:view_hoc_phan');
Route::get('/course-groups/{courseGroup}', [CourseGroupController::class, 'show']);
Route::post('/course-groups', [CourseGroupController::class, 'store'])->middleware('permission:create_hoc_phan');
Route::put('/course-groups/{courseGroup}', [CourseGroupController::class, 'update'])->middleware('permission:update_hoc_phan');
Route::delete('/course-groups/{courseGroup}', [CourseGroupController::class, 'destroy'])->middleware('permission:delete_hoc_phan');

Route::patch('/course-groups/hidden/{courseGroup}', [CourseGroupController::class, 'hide'])->middleware('permission:update_hoc_phan');
Route::post('/course-groups/join', [CourseGroupController::class, 'joinGroup']);
Route::patch('/course-groups/invite-code/{courseGroup}', [CourseGroupController::class, 'resetInviteCode'])->middleware('permission:update_hoc_phan');

Route::get('/course-groups/student/{user}', [CourseGroupController::class, 'getOfStudent']);
Route::get('/course-groups/teacher/{user}', [CourseGroupController::class, 'getOfTeacher']);
Route::get('/course-groups/assigned/{user}', [CourseGroupController::class, 'getAssignedTeaching']);

Route::get('/course-groups/{courseGroup}/students', [CourseGroupController::class, 'getStudentList'])->middleware('permission:view_hoc_phan');
Route::get('/course-groups/{courseGroup}/students/export', [CourseGroupController::class, 'exportStudents'])->middleware('permission:view_hoc_phan');
Route::post('/course-groups/{courseGroup}/students/import', [CourseGroupController::class, 'importStudents'])->middleware('permission:update_hoc_phan');
Route::post('/course-groups/{courseGroup}/students', [CourseGroupController::class, 'addStudentToGroup'])->middleware('permission:update_hoc_phan');
Route::delete('/course-groups/{courseGroup}/students', [CourseGroupController::class, 'removeStudentFromGroup'])->middleware('permission:update_hoc_phan');

Route::get('/course-groups/{courseGroup}/teacher-subject', [CourseGroupController::class, 'getWithTeacherAndSubject']);
Route::get('/course-groups/{courseGroup}/exams', [CourseGroupController::class, 'getWithExams']);
Route::get('/course-groups/{courseGroup}/announcements', [CourseGroupController::class, 'getWithNotifications']);
Route::get('/course-groups/{courseGroup}/student-detail', [CourseGroupController::class, 'getForStudentDetail']);

Route::get('/course-groups/{courseGroup}/materials', [CourseGroupMaterialController::class, 'index']);
Route::post('/course-groups/{courseGroup}/materials', [CourseGroupMaterialController::class, 'store']);
Route::put('/course-groups/{courseGroup}/materials/{material}', [CourseGroupMaterialController::class, 'update']);
Route::delete('/course-groups/{courseGroup}/materials/{material}', [CourseGroupMaterialController::class, 'destroy']);
Route::get('/course-groups/{courseGroup}/materials/{material}/download', [CourseGroupMaterialController::class, 'download']);
