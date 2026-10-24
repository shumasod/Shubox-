<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Infrastructure\Persistence\Eloquent\Models\ExpenseModel;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ExportController extends Controller
{
    private const CHUNK_SIZE = 200;

    /**
     * ストリーミング CSV エクスポート — 大量データでもメモリ上集ししない
     */
    public function expenses(Request $request): StreamedResponse
    {
        $tenantId = $request->attributes->get('tenant_id');

        $validated = $request->validate([
            'status'    => ['nullable', 'string'],
            'date_from' => ['nullable', 'date'],
            'date_to'   => ['nullable', 'date'],
            'keyword'   => ['nullable', 'string', 'max:100'],
        ]);

        $filename = '経費申請_' . now()->format('Ymd_His') . '.csv';

        return new StreamedResponse(function () use ($tenantId, $validated) {
            $handle = fopen('php://output', 'w');

            // BOM (小文字化け防止)
            fwrite($handle, "\xEF\xBB\xBF");

            // ヘッダ行
            fputcsv($handle, [
                '経費番号', '件名', '申請者', '部門',
                '金額', 'ステータス', '申請日', '承認日',
            ]);

            // チャンクストリーミング
            $query = ExpenseModel::with(['applicant'])
                ->where('tenant_id', $tenantId)
                ->orderByDesc('created_at');

            if (!empty($validated['status'])) {
                $query->where('status', $validated['status']);
            }
            if (!empty($validated['date_from'])) {
                $query->whereDate('created_at', '>=', $validated['date_from']);
            }
            if (!empty($validated['date_to'])) {
                $query->whereDate('created_at', '<=', $validated['date_to']);
            }
            if (!empty($validated['keyword'])) {
                $keyword = $validated['keyword'];
                $query->where(fn($q) =>
                    $q->where('title', 'like', "%{$keyword}%")
                      ->orWhere('description', 'like', "%{$keyword}%")
                );
            }

            $query->chunk(self::CHUNK_SIZE, function ($expenses) use ($handle) {
                foreach ($expenses as $expense) {
                    fputcsv($handle, [
                        $expense->expense_number,
                        $expense->title,
                        $expense->applicant?->name ?? '',
                        $expense->applicant?->department ?? '',
                        $expense->total_amount,
                        $expense->status,
                        $expense->created_at->format('Y-m-d'),
                        $expense->approved_at?->format('Y-m-d') ?? '',
                    ]);
                }
                // バッファをフラッシュして逐次クライアントに送信
                ob_flush();
                flush();
            });

            fclose($handle);
        }, 200, [
            'Content-Type'        => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
            'X-Accel-Buffering'   => 'no',  // nginx バッファリングを無効化
            'Cache-Control'       => 'no-cache, no-store',
        ]);
    }

    /**
     * 明細レベル CSV エクスポート
     */
    public function expenseItems(Request $request): StreamedResponse
    {
        $tenantId = $request->attributes->get('tenant_id');
        $from     = $request->query('from', now()->startOfMonth()->toDateString());
        $to       = $request->query('to',   now()->toDateString());
        $filename = '明細_' . now()->format('Ymd') . '.csv';

        return new StreamedResponse(function () use ($tenantId, $from, $to) {
            $handle = fopen('php://output', 'w');
            fwrite($handle, "\xEF\xBB\xBF");

            fputcsv($handle, [
                '経費番号', '件名', 'カテゴリ', '内容',
                '支払先', '金額', '数量', '小計', '利用日',
            ]);

            \App\Infrastructure\Persistence\Eloquent\Models\ExpenseItemModel
                ::join('expenses', 'expense_items.expense_id', '=', 'expenses.id')
                ->join('categories', 'expense_items.category_id', '=', 'categories.id')
                ->where('expenses.tenant_id', $tenantId)
                ->whereBetween('expense_items.expense_date', [$from, $to])
                ->select('expense_items.*', 'expenses.expense_number', 'expenses.title as expense_title', 'categories.name as category_name')
                ->orderBy('expense_items.expense_date')
                ->chunk(self::CHUNK_SIZE, function ($items) use ($handle) {
                    foreach ($items as $item) {
                        fputcsv($handle, [
                            $item->expense_number,
                            $item->expense_title,
                            $item->category_name,
                            $item->description,
                            $item->vendor ?? '',
                            $item->amount,
                            $item->quantity,
                            $item->amount * $item->quantity,
                            $item->expense_date,
                        ]);
                    }
                    ob_flush();
                    flush();
                });

            fclose($handle);
        }, 200, [
            'Content-Type'        => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
            'X-Accel-Buffering'   => 'no',
            'Cache-Control'       => 'no-cache, no-store',
        ]);
    }
}
