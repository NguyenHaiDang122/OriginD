<?php

use App\Http\Controllers\Api\AdminUserController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\SubscriptionController;
use App\Http\Controllers\Api\TemplateController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\TemplateFieldController;
use App\Http\Controllers\Api\LandingPageController;
use App\Http\Controllers\Api\DepositController;
use App\Http\Controllers\Api\AdminDepositController;
use App\Http\Controllers\Api\PlanController;
use App\Http\Controllers\Api\AdminCustomDomainController;


Route::post('/register', [AuthController::class, 'register']);
Route::post('/register-send-otp', [AuthController::class, 'sendRegisterOtp']);
Route::post('/register-verify-otp', [AuthController::class, 'verifyRegisterOtpAndRegister']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/google-login', [AuthController::class, 'googleLogin']);

// Public routes (Cho phép xem mẫu, preview và trang landing page mà không cần đăng nhập)
Route::get('/templates', [TemplateController::class, 'index']);
Route::get('/templates/{template}', [TemplateController::class, 'show']);
Route::get('/templates/{template}/fields', [TemplateFieldController::class, 'index']);
Route::post('/templates/{template}/preview', [TemplateController::class, 'preview']);
Route::get('/landing-pages/{landingPage}/render', [LandingPageController::class, 'render']);
Route::post('/sepay-webhook', [DepositController::class, 'sepayWebhook']);
Route::get('/plans', [PlanController::class, 'index']);
Route::get('/settings/popup', [App\Http\Controllers\Api\SettingController::class, 'getPopupSettings']);

Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    Route::get('/subscription', [SubscriptionController::class, 'current']);
    Route::post('/subscription/upgrade', [SubscriptionController::class, 'upgrade']);

    // User authenticated endpoints
    Route::post('/templates/{template}/landing-pages', [LandingPageController::class,'store']);
    Route::get('/landing-pages', [LandingPageController::class, 'index']);
    Route::get('/landing-pages/{landingPage}', [LandingPageController::class, 'show']);
    Route::put('/landing-pages/{landingPage}', [LandingPageController::class, 'update']);
    Route::delete('/landing-pages/{landingPage}', [LandingPageController::class, 'destroy']);

    Route::get('/settings/support', [App\Http\Controllers\Api\SettingController::class, 'getSupportSettings']);
    Route::put('/settings/support', [App\Http\Controllers\Api\SettingController::class, 'updateSupportSettings']);

    // Deposits and Renewals
    Route::get('/deposits', [DepositController::class, 'index']);
    Route::post('/deposits', [DepositController::class, 'store']);
    Route::post('/deposits/renew', [DepositController::class, 'renew']);
    Route::get('/deposits/{id}/check-sepay', [DepositController::class, 'checkSepayStatus']);

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
            Route::put('/users/{user}/balance', [AdminUserController::class, 'updateBalance']);
            Route::put('/users/{user}/landing-page-limit', [AdminUserController::class, 'updateLandingPageLimit']);
            Route::delete('/users/{user}', [AdminUserController::class, 'destroy']);
            Route::put('/users/{user}/landing-pages/{landingPage}/dates', [AdminUserController::class, 'updateLandingPageDates']);

            // Admin Deposit Management
            Route::get('/deposits', [AdminDepositController::class, 'index']);
            Route::post('/deposits/{deposit}/approve', [AdminDepositController::class, 'approve']);
            Route::post('/deposits/{deposit}/reject', [AdminDepositController::class, 'reject']);

            // Admin Plan Management
            Route::get('/plans', [PlanController::class, 'index']);
            Route::post('/plans', [PlanController::class, 'store']);
            Route::put('/plans/{plan}', [PlanController::class, 'update']);
            Route::delete('/plans/{plan}', [PlanController::class, 'destroy']);

            // Admin Custom Domain Management
            Route::get('/custom-domains', [AdminCustomDomainController::class, 'index']);
            Route::post('/custom-domains', [AdminCustomDomainController::class, 'store']);
            Route::put('/custom-domains/{id}', [AdminCustomDomainController::class, 'update']);
            Route::delete('/custom-domains/{id}', [AdminCustomDomainController::class, 'destroy']);
            // Admin Statistics
            Route::get('/statistics', [App\Http\Controllers\Api\AdminStatisticController::class, 'getStatistics']);

            // Admin Settings
            Route::put('/settings/popup', [App\Http\Controllers\Api\SettingController::class, 'updatePopupSettings']);
        });
});