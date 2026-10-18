<?php

use App\Http\Controllers\FunctionController;
use Illuminate\Support\Facades\Route;

Route::get('/functions', [FunctionController::class, 'index']);
