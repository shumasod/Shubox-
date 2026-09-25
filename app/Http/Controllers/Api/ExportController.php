<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Jobs\ExportExpensesCsv;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ExportController extends Controller
{
    public function exportExpenses(Request $request): JsonResponse
    {
        $request->validate([
            'status' => 'nullable|in:draft,pending,approved,rejected,paid',
            'from'   => 'nullable|date_format:Y-m-d',
            'to'     => 'nullable|date_format:Y-m-d|after_or_equal:from',
        ]);

        $exportId = Str::uuid()->toString();

        ExportExpensesCsv::dispatch(
            tenantId:          $request->user()->tenant_id,
            requestedByUserId: $request->user()->id,
            filters:           $request->only('status', 'from', 'to'),
            exportId:          $exportId,
        )->onQueue('reports');

        return response()->json([
            'message'   => 'Export started. You will receive a notification when it is ready.',
            'export_id' => $exportId,
        ], 202);
    }
}
