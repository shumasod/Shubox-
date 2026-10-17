<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class SearchController extends Controller
{
    private const MAX_RESULTS = 50;

    public function __invoke(Request $request): JsonResponse
    {
        $query = trim($request->string('q'));

        if (mb_strlen($query) < 2) {
            return response()->json(['data' => [], 'meta' => ['total' => 0]]);
        }

        $tenantId = Auth::user()->tenant_id;

        // Boolean mode FULLTEXT search with automatic AND for multiple words
        $boolQuery = collect(preg_split('/\s+/', $query))
            ->filter()
            ->map(fn($w) => '+' . preg_replace('/[+\-><()~*"@]+/', '', $w) . '*')
            ->implode(' ');

        $expenses = Expense::where('tenant_id', $tenantId)
            ->where(function ($q) use ($boolQuery, $query) {
                $q->whereRaw(
                    'MATCH(title, description, expense_number) AGAINST(? IN BOOLEAN MODE)',
                    [$boolQuery]
                )->orWhereHas('items', fn($iq) =>
                    $iq->whereRaw(
                        'MATCH(description, vendor_name) AGAINST(? IN BOOLEAN MODE)',
                        [$boolQuery]
                    )
                );
            })
            ->select([
                'id', 'expense_number', 'title', 'status', 'total_amount',
                'applicant_id', 'created_at',
                DB::raw('MATCH(title, description, expense_number) AGAINST(? IN BOOLEAN MODE) AS relevance'),
            ])
            ->addBinding($boolQuery, 'select')
            ->with('applicant:id,name')
            ->orderByDesc('relevance')
            ->limit(self::MAX_RESULTS)
            ->get();

        return response()->json([
            'data' => $expenses->map(fn($e) => [
                'id'             => $e->id,
                'expense_number' => $e->expense_number,
                'title'          => $e->title,
                'status'         => $e->status,
                'total_amount'   => $e->total_amount,
                'applicant_name' => $e->applicant?->name,
                'created_at'     => $e->created_at->toIso8601String(),
            ]),
            'meta' => [
                'total' => $expenses->count(),
                'query' => $query,
            ],
        ]);
    }
}
