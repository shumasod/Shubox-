<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ExpenseArchiveController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $tenantId = Auth::user()->tenant_id;

        $archives = DB::table('expenses')
            ->where('tenant_id', $tenantId)
            ->whereNotNull('archived_at')
            ->selectRaw('YEAR(archived_at) as year, COUNT(*) as count, SUM(total_amount) as total')
            ->groupBy('year')
            ->orderByDesc('year')
            ->get();

        return response()->json(['data' => $archives]);
    }

    public function archive(Request $request): JsonResponse
    {
        $data = $request->validate([
            'fiscal_year' => 'required|integer|min:2000|max:2100',
        ]);

        $tenantId = Auth::user()->tenant_id;
        $year     = $data['fiscal_year'];

        $count = Expense::where('tenant_id', $tenantId)
            ->whereIn('status', ['approved', 'paid'])
            ->whereYear('applied_at', $year)
            ->whereNull('archived_at')
            ->count();

        if ($count === 0) {
            return response()->json([
                'message' => "No eligible expenses found for fiscal year {$year}.",
                'archived' => 0,
            ]);
        }

        Expense::where('tenant_id', $tenantId)
            ->whereIn('status', ['approved', 'paid'])
            ->whereYear('applied_at', $year)
            ->whereNull('archived_at')
            ->update(['archived_at' => now()]);

        return response()->json([
            'message'  => "Archived {$count} expenses for fiscal year {$year}.",
            'archived' => $count,
            'year'     => $year,
        ]);
    }

    public function unarchive(Request $request): JsonResponse
    {
        $data = $request->validate([
            'fiscal_year' => 'required|integer|min:2000|max:2100',
        ]);

        $tenantId = Auth::user()->tenant_id;
        $year     = $data['fiscal_year'];

        $count = Expense::where('tenant_id', $tenantId)
            ->whereYear('applied_at', $year)
            ->whereNotNull('archived_at')
            ->update(['archived_at' => null]);

        return response()->json([
            'message'    => "Unarchived {$count} expenses for fiscal year {$year}.",
            'unarchived' => $count,
        ]);
    }
}
