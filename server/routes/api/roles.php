<?php

use App\Http\Controllers\RoleController;
use Illuminate\Support\Facades\Route;

Route::get('/roles', [RoleController::class, 'index'])->middleware('permission:view_nhom_quyen');
Route::get('/roles/{role}', [RoleController::class, 'show'])->middleware('permission:view_nhom_quyen');
Route::post('/roles', [RoleController::class, 'store'])->middleware('permission:create_nhom_quyen');
Route::put('/roles/{role}', [RoleController::class, 'update'])->middleware('permission:update_nhom_quyen');
Route::delete('/roles/{role}', [RoleController::class, 'destroy'])->middleware('permission:delete_nhom_quyen');
