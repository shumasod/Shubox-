<?php

declare(strict_types=1);

use App\Http\Controllers\Api\HealthController;
use App\Http\Controllers\Api\V1\Admin\CategoryController as AdminCategoryController;
use App\Http\Controllers\Api\V1\Admin\TenantController;
use App\Http\Controllers\Api\V1\Admin\UserController as AdminUserController;
use App\Http\Controllers\Api\V1\ApprovalFlowController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\CategoryController;
use App\Http\Controllers\Api\V1\CommentController;
use App\Http\Controllers\Api\V1\ExpenseController;
use App\Http\Controllers\Api\V1\NotificationController;
use App\Http\Controllers\Api\V1\ReceiptController;
use App\Http\Controllers\Api\V1\ReportController;
use Illuminate\Support\Facades\Route;

// ヘルスチェック（認証不要）
Route::get('/health', HealthController::class);

// API v1
Route::prefix('v1')->group(function () {

    // 認証（公開エンドポイント）
    Route::prefix('auth')->group(function () {
        Route::post('login', [AuthController::class, 'login']);
    });

    // 認証必要ルート
    Route::middleware(['auth:sanctum', 'tenant'])->group(function () {

        // 認証
        Route::prefix('auth')->group(function () {
            Route::post('logout', [AuthController::class, 'logout']);
            Route::get('me',     [AuthController::class, 'me']);
        });

        // 経費申請
        Route::apiResource('expenses', ExpenseController::class);
        Route::prefix('expenses/{expense}')->group(function () {
            Route::post('submit',  [ExpenseController::class, 'submit']);
            Route::post('approve', [ExpenseController::class, 'approve'])->middleware('permission:expense.approve');
            Route::post('reject',  [ExpenseController::class, 'reject'])->middleware('permission:expense.approve');
            Route::post('cancel',  [ExpenseController::class, 'cancel']);
            Route::get('history',  [ExpenseController::class, 'history']);
            Route::get('export',   [ExpenseController::class, 'export'])->middleware('permission:expense.export');

            // 領収書
            Route::post('receipts',          [ReceiptController::class, 'store']);
            Route::delete('receipts/{receipt}', [ReceiptController::class, 'destroy']);

            // コメント
            Route::apiResource('comments', CommentController::class)->except(['show']);
        });

        // カテゴリ
        Route::get('categories', [CategoryController::class, 'index']);

        // 承認フロー
        Route::apiResource('approval-flows', ApprovalFlowController::class)
            ->middleware(['permission:approval_flow.manage']);

        // 通知
        Route::prefix('notifications')->group(function () {
            Route::get('/',                 [NotificationController::class, 'index']);
            Route::patch('{id}/read',       [NotificationController::class, 'markAsRead']);
            Route::post('read-all',         [NotificationController::class, 'markAllAsRead']);
        });

        // レポート（report.view 権限必要）
        Route::prefix('reports')->middleware('permission:report.view')->group(function () {
            Route::get('monthly',       [ReportController::class, 'monthly']);
            Route::get('by-category',   [ReportController::class, 'byCategory']);
            Route::get('by-applicant',  [ReportController::class, 'byApplicant']);
            Route::get('approval-stats',[ReportController::class, 'approvalStats']);
        });

        // 管理者ルート
        Route::prefix('admin')->middleware('permission:user.manage')->group(function () {
            Route::apiResource('users', AdminUserController::class);
            Route::apiResource('categories', AdminCategoryController::class)->only(['index', 'store', 'update']);

            Route::get('tenant',         [TenantController::class, 'show']);
            Route::patch('tenant',       [TenantController::class, 'update']);
            Route::get('tenant/stats',   [TenantController::class, 'stats']);
        });
    });
});
