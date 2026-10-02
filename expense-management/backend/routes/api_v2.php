<?php

/*
|--------------------------------------------------------------------------
| API v2 Routes
|--------------------------------------------------------------------------
|
| V2 introduces cursor-based pagination on collection endpoints,
| camelCase JSON keys, and a unified envelope format.
| V1 is deprecated and will sunset 2025-12-31.
|
*/

use App\Http\Controllers\Api\V2\ExpenseController;
use App\Http\Controllers\Api\V2\HealthController;
use Illuminate\Support\Facades\Route;

Route::prefix('v2')->middleware(['api', 'auth:sanctum', 'tenant', 'force.json'])->group(function () {

    // Health check (unauthenticated)
    Route::get('/health', [HealthController::class, 'index'])->withoutMiddleware(['auth:sanctum', 'tenant']);

    // Expenses with cursor pagination
    Route::apiResource('expenses', ExpenseController::class);
});
