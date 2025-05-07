<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\API\MaterialRequestController;
use App\Http\Controllers\EmployeeController; 
use App\Http\Controllers\OrderController;
use App\Http\Controllers\StockController;
use App\Http\Controllers\NotificationController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Routes existantes
    Route::get('/users', [UserController::class, 'index']);
    Route::get('/orders', [OrderController::class, 'index']);
    Route::apiResource('/stocks', StockController::class);
    Route::apiResource('/employees', EmployeeController::class);

    // Routes pour les demandes de matériel
    Route::apiResource('/material-requests', MaterialRequestController::class);

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::put('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::put('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);
});

// Routes d'authentification
Route::post('/register', [AuthController::class, 'signup']);
Route::post('/login', [AuthController::class, 'login']);

// Route pour le cookie CSRF
Route::get('/sanctum/csrf-cookie', function () {
    return response()->noContent();
});


//
Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('material-requests', MaterialRequestController::class); 
});