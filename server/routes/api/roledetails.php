<?php

use App\Http\Controllers\RoleDetailController;
use Illuminate\Support\Facades\Route;

Route::get('/roledetails', [RoleDetailController::class, 'index']);
