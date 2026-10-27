<?php

use App\Http\Controllers\PermissionAdministrationController;
use Illuminate\Support\Facades\Route;

if (config('authorization.schema_v2_enabled')) {
    Route::get('/me/navigation', [PermissionAdministrationController::class, 'myNavigation']);

    Route::get('/permissions/catalog', [PermissionAdministrationController::class, 'catalog']);

    Route::get('/roles/{role}/permission-matrix', [PermissionAdministrationController::class, 'roleMatrix']);

    Route::put('/roles/{role}/permissions', [PermissionAdministrationController::class, 'syncRolePermissions']);

    Route::get('/users/{user}/permission-overrides', [PermissionAdministrationController::class, 'userOverrideMatrix']);

    Route::put('/users/{user}/permission-overrides', [PermissionAdministrationController::class, 'syncUserOverrides']);
}
