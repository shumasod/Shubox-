<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Infrastructure\Persistence\Eloquent\Models\ExpenseModel;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ExpenseTrashController extends Controller
{
    /**
     * ソフトデリートされた経費一覧を取得
     */
    public function index(Request $request): JsonResponse
    {
        $tenantId = $request->attributes->get('tenant_id');
        $userId   = $request->user()->id;

        $expenses = ExpenseModel::onlyTrashed()
            ->where('tenant_id', $tenantId)
            ->where('applicant_id', $userId)
            ->orderByDesc('deleted_at')
            ->paginate((int) $request->query('per_page', 20));

        return response()->json([
            'data' => $expenses->items(),
            'meta' => [
                'current_page' => $expenses->currentPage(),
                'last_page'    => $expenses->lastPage(),
                'per_page'     => $expenses->perPage(),
                'total'        => $expenses->total(),
            ],
        ]);
    }

    /**
     * ソフトデリートされた経費を復元（restore）
     */
    public function restore(Request $request, string $id): JsonResponse
    {
        $tenantId = $request->attributes->get('tenant_id');
        $userId   = $request->user()->id;

        $expense = ExpenseModel::onlyTrashed()
            ->where('tenant_id', $tenantId)
            ->where('applicant_id', $userId)
            ->where('status', 'draft')  // 下書きのみ復元可能
            ->findOrFail($id);

        $expense->restore();

        return response()->json(['message' => '経費申請を復元しました']);
    }

    /**
     * 完全削除（物理削除）
     */
    public function forceDelete(Request $request, string $id): JsonResponse
    {
        $tenantId = $request->attributes->get('tenant_id');
        $userId   = $request->user()->id;

        $expense = ExpenseModel::onlyTrashed()
            ->where('tenant_id', $tenantId)
            ->where('applicant_id', $userId)
            ->findOrFail($id);

        // 隅連データも完全劉除
        $expense->items()->forceDelete();
        $expense->receipts()->each(function ($receipt) {
            // S3 ファイルは復元不可能なため削除しない（運用ポリシーに委ねる）
        });
        $expense->forceDelete();

        return response()->json(null, 204);
    }

    /**
     * 30日以上削除されたデータをパージ（スケジューラーから呼び出す）
     */
    public static function purgeOldTrash(): void
    {
        ExpenseModel::onlyTrashed()
            ->where('deleted_at', '<', now()->subDays(30))
            ->where('status', 'draft')
            ->chunk(100, function ($expenses) {
                foreach ($expenses as $expense) {
                    $expense->items()->forceDelete();
                    $expense->forceDelete();
                }
            });
    }
}
