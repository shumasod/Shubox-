<?php

namespace App\Http\Controllers\Api;

use App\Models\Expense;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ExpenseSearchController extends Controller
{
    private const PAGE_SIZE = 20;
    private const MAX_PAGE_SIZE = 100;

    public function __invoke(Request $request): JsonResponse
    {
        $request->validate([
            'q'            => 'nullable|string|max:200',
            'status'       => 'nullable|array',
            'status.*'     => 'in:pending,approved,rejected,flagged',
            'category_ids' => 'nullable|array',
            'category_ids.*' => 'integer',
            'vendor_ids'   => 'nullable|array',
            'vendor_ids.*' => 'integer',
            'amount_min'   => 'nullable|numeric|min:0',
            'amount_max'   => 'nullable|numeric|min:0',
            'date_from'    => 'nullable|date',
            'date_to'      => 'nullable|date|after_or_equal:date_from',
            'user_ids'     => 'nullable|array',
            'user_ids.*'   => 'integer',
            'has_receipt'  => 'nullable|boolean',
            'tags'         => 'nullable|array',
            'sort_by'      => 'nullable|in:amount,expense_date,created_at,title',
            'sort_dir'     => 'nullable|in:asc,desc',
            'per_page'     => 'nullable|integer|min:1|max:100',
            'cursor'       => 'nullable|string',
        ]);

        $tenantId = Auth::user()->tenant_id;
        $perPage  = min($request->integer('per_page', self::PAGE_SIZE), self::MAX_PAGE_SIZE);
        $sortBy   = $request->input('sort_by', 'expense_date');
        $sortDir  = $request->input('sort_dir', 'desc');

        $query = Expense::where('tenant_id', $tenantId)
            ->with(['category:id,name,color', 'user:id,name', 'vendor:id,name'])
            ->when($request->filled('q'), function ($q) use ($request) {
                $term = '%' . addcslashes($request->q, '%_') . '%';
                $q->where(function ($q) use ($term) {
                    $q->where('title', 'like', $term)
                      ->orWhere('description', 'like', $term);
                });
            })
            ->when($request->filled('status'), fn($q) => $q->whereIn('status', $request->status))
            ->when($request->filled('category_ids'), fn($q) => $q->whereIn('category_id', $request->category_ids))
            ->when($request->filled('vendor_ids'), fn($q) => $q->whereIn('vendor_id', $request->vendor_ids))
            ->when($request->filled('amount_min'), fn($q) => $q->where('amount', '>=', $request->amount_min))
            ->when($request->filled('amount_max'), fn($q) => $q->where('amount', '<=', $request->amount_max))
            ->when($request->filled('date_from'), fn($q) => $q->where('expense_date', '>=', $request->date_from))
            ->when($request->filled('date_to'), fn($q) => $q->where('expense_date', '<=', $request->date_to))
            ->when($request->filled('user_ids'), fn($q) => $q->whereIn('user_id', $request->user_ids))
            ->when($request->boolean('has_receipt'), function ($q) {
                $q->whereHas('attachments');
            })
            ->when($request->filled('tags'), function ($q) use ($request) {
                foreach ($request->tags as $tag) {
                    $q->whereJsonContains('tags', $tag);
                }
            });

        // Cursor pagination
        if ($request->filled('cursor')) {
            $cursor = json_decode(base64_decode($request->cursor), true);
            if ($cursor) {
                $dir = $sortDir === 'asc' ? '>' : '<';
                $query->where(function ($q) use ($sortBy, $dir, $cursor) {
                    $q->where($sortBy, $dir, $cursor['val'])
                      ->orWhere(function ($q) use ($sortBy, $dir, $cursor) {
                          $q->where($sortBy, $cursor['val'])
                            ->where('id', $dir, $cursor['id']);
                      });
                });
            }
        }

        $items = $query
            ->orderBy($sortBy, $sortDir)
            ->orderBy('id', $sortDir)
            ->limit($perPage + 1)
            ->get();

        $hasMore    = $items->count() > $perPage;
        $results    = $hasMore ? $items->take($perPage) : $items;
        $nextCursor = null;

        if ($hasMore) {
            $last       = $results->last();
            $nextCursor = base64_encode(json_encode(['id' => $last->id, 'val' => $last->$sortBy]));
        }

        // Aggregations
        $aggs = DB::table('expenses')
            ->where('tenant_id', $tenantId)
            ->selectRaw('status, COUNT(*) as count, SUM(amount) as total')
            ->when($request->filled('q'), function ($q) use ($request) {
                $term = '%' . addcslashes($request->q, '%_') . '%';
                $q->where(function ($q) use ($term) {
                    $q->where('title', 'like', $term)->orWhere('description', 'like', $term);
                });
            })
            ->groupBy('status')
            ->get()
            ->keyBy('status');

        return response()->json([
            'data'        => $results->values(),
            'next_cursor' => $nextCursor,
            'has_more'    => $hasMore,
            'aggs'        => [
                'by_status' => $aggs->map(fn($r) => [
                    'count' => (int) $r->count,
                    'total' => (float) $r->total,
                ]),
            ],
        ]);
    }
}
