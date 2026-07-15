<?php

use App\Http\Controllers\Api\AdminUserController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\SubscriptionController;
use App\Http\Controllers\Api\TemplateController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\TemplateFieldController;
use App\Http\Controllers\Api\LandingPageController;


Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    Route::get('/subscription', [SubscriptionController::class, 'current']);

    // User
    Route::get('/templates', [TemplateController::class, 'index']);
    Route::get('/templates/{template}', [TemplateController::class, 'show']);

    Route::get('/templates/{template}/fields', [TemplateFieldController::class, 'index']);
    Route::post('/templates/{template}/preview', [TemplateController::class, 'preview']);
    Route::post('/templates/{template}/landing-pages', [LandingPageController::class,'store']);
    Route::get('/landing-pages', [LandingPageController::class, 'index']);
    Route::get('/landing-pages/{landingPage}', [LandingPageController::class, 'show']);
    Route::put('/landing-pages/{landingPage}', [LandingPageController::class, 'update']);
    Route::delete('/landing-pages/{landingPage}', [LandingPageController::class, 'destroy']);
    Route::get('/landing-pages/{landingPage}/render', [LandingPageController::class, 'render']);

    // Admin
    Route::prefix('admin')
        ->middleware('role:Admin')
        ->group(function () {

            Route::get('/templates', [TemplateController::class, 'index']);

            Route::post('/templates', [TemplateController::class, 'store']);

            Route::put('/templates/{template}', [TemplateController::class, 'update']);
            Route::post('/templates/{template}', [TemplateController::class, 'update']);

            Route::delete('/templates/{template}', [TemplateController::class, 'destroy']);


            Route::post('/templates/{template}/fields', [TemplateFieldController::class, 'store']);

            Route::put('/template-fields/{field}', [TemplateFieldController::class, 'update']);

            Route::delete('/template-fields/{field}', [TemplateFieldController::class, 'destroy']);

            // User & Role Management
            Route::get('/users', [AdminUserController::class, 'index']);
            Route::get('/users/{user}', [AdminUserController::class, 'show']);
            Route::put('/users/{user}/role', [AdminUserController::class, 'updateRole']);
            Route::put('/users/{user}/status', [AdminUserController::class, 'updateStatus']);
            Route::delete('/users/{user}', [AdminUserController::class, 'destroy']);
        });
});