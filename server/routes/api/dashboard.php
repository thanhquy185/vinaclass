<?php

use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Route;

Route::get('/dashboard/admin-summary', [DashboardController::class, 'adminSummary']);
Route::get('/dashboard/admin-statistics', [DashboardController::class, 'adminStatistics']);
