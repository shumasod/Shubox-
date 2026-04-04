<?php

declare(strict_types=1);

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\ExpenseController;
use App\Http\Controllers\Api\V1\ReceiptController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes - v1
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->group(function () {

    // 認証（テナント解決なし）
    Route::prefix('auth')->group(function () {
        Route::post('login', [AuthController::class, 'login']);
    });

    // 認証必須
    Route::middleware(['auth:sanctum', 'tenant'])->group(function () {

        Route::post('auth/logout', [AuthController::class, 'logout']);
        Route::get('me', [AuthController::class, 'me']);

        // 経費申請
        Route::prefix('expenses')->group(function () {
            Route::get('/', [ExpenseController::class, 'index']);
            Route::post('/', [ExpenseController::class, 'store']);
            Route::get('/export', [ExpenseController::class, 'export']);
            Route::get('/{id}', [ExpenseController::class, 'show']);
            Route::put('/{id}', [ExpenseController::class, 'update']);
            Route::delete('/{id}', [ExpenseController::class, 'destroy']);
            Route::post('/{id}/submit', [ExpenseController::class, 'submit']);
            Route::post('/{id}/cancel', [ExpenseController::class, 'cancel']);
            Route::post('/{id}/approve', [ExpenseController::class, 'approve']);
            Route::post('/{id}/reject', [ExpenseController::class, 'reject']);
            Route::get('/{id}/history', [ExpenseController::class, 'history']);

            // 領収書
            Route::post('/{expenseId}/items/{itemId}/receipts', [ReceiptController::class, 'store']);
            Route::delete('/{expenseId}/items/{itemId}/receipts/{receiptId}', [ReceiptController::class, 'destroy']);

            // コメント
            Route::get('/{id}/comments', [\App\Http\Controllers\Api\V1\CommentController::class, 'index']);
            Route::post('/{id}/comments', [\App\Http\Controllers\Api\V1\CommentController::class, 'store']);
        });

        // 承認フロー管理
        Route::apiResource('approval-flows', \App\Http\Controllers\Api\V1\ApprovalFlowController::class);

        // カテゴリ
        Route::get('categories', fn() => response()->json(
            \App\Infrastructure\Persistence\Eloquent\Models\CategoryModel
                ::where('tenant_id', auth()->user()->tenant_id)
                ->where('is_active', true)
                ->orderBy('sort_order')
                ->get(['id', 'name', 'code', 'parent_id', 'max_amount', 'requires_receipt'])
        ));

        // 通知
        Route::prefix('notifications')->group(function () {
            Route::get('/', fn() => response()->json(
                \App\Infrastructure\Persistence\Eloquent\Models\NotificationModel
                    ::where('user_id', auth()->id())
                    ->orderByDesc('created_at')
                    ->paginate(20)
            ));
            Route::put('/{id}/read', fn(string $id) => response()->json(
                \App\Infrastructure\Persistence\Eloquent\Models\NotificationModel
                    ::where('user_id', auth()->id())
                    ->findOrFail($id)
                    ->update(['read_at' => now()])
            ));
        });

        // 管理者機能
        Route::middleware('permission:admin')->prefix('admin')->group(function () {
            Route::apiResource('users', \App\Http\Controllers\Api\V1\UserController::class);
            Route::get('audit-logs', fn(\Illuminate\Http\Request $req) =>
                response()->json(
                    \App\Infrastructure\Persistence\Eloquent\Models\AuditLogModel
                        ::where('tenant_id', auth()->user()->tenant_id)
                        ->orderByDesc('created_at')
                        ->paginate(50)
                )
            );
        });
    });
});
