<?php

namespace App\Http\Controllers\Api;

use App\Jobs\GenerateExpenseReport;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ReportExportController extends Controller
{
    public function request(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'from'        => 'nullable|date',
            'to'          => 'nullable|date|after_or_equal:from',
            'status'      => 'nullable|string|in:draft,submitted,approved,rejected,paid',
            'category_id' => 'nullable|integer',
            'user_id'     => 'nullable|integer',
            'format'      => 'nullable|string|in:csv',
        ]);

        $tenantId  = Auth::user()->tenant_id;
        $userId    = Auth::id();
        $reportKey = Str::uuid()->toString();
        $format    = $validated['format'] ?? 'csv';

        DB::table('expense_reports')->insert([
            'tenant_id'    => $tenantId,
            'requested_by' => $userId,
            'report_key'   => $reportKey,
            'format'       => $format,
            'filters'      => json_encode($validated),
            'status'       => 'pending',
            'created_at'   => now(),
            'updated_at'   => now(),
        ]);

        GenerateExpenseReport::dispatch(
            $tenantId,
            $userId,
            $validated,
            $format,
            $reportKey
        )->onQueue('reports');

        return response()->json([
            'report_key' => $reportKey,
            'status'     => 'pending',
            'message'    => 'レポートの生成を開始しました。完了後にダウンロード可能になります。',
        ], 202);
    }

    public function status(string $reportKey): JsonResponse
    {
        $tenantId = Auth::user()->tenant_id;

        $report = DB::table('expense_reports')
            ->where('tenant_id', $tenantId)
            ->where('report_key', $reportKey)
            ->first();

        if (! $report) {
            return response()->json(['message' => 'Report not found.'], 404);
        }

        return response()->json([
            'report_key'   => $report->report_key,
            'status'       => $report->status,
            'format'       => $report->format,
            'completed_at' => $report->completed_at,
        ]);
    }

    public function download(string $reportKey): JsonResponse
    {
        $tenantId = Auth::user()->tenant_id;

        $report = DB::table('expense_reports')
            ->where('tenant_id', $tenantId)
            ->where('report_key', $reportKey)
            ->where('status', 'completed')
            ->first();

        if (! $report) {
            return response()->json(['message' => 'Report not found or not ready.'], 404);
        }

        // Generate a short-lived presigned URL (15 minutes)
        $url = Storage::disk('s3')->temporaryUrl(
            $report->file_path,
            now()->addMinutes(15)
        );

        return response()->json(['download_url' => $url, 'expires_in' => 900]);
    }

    public function history(Request $request): JsonResponse
    {
        $tenantId = Auth::user()->tenant_id;

        $reports = DB::table('expense_reports')
            ->where('tenant_id', $tenantId)
            ->where('requested_by', Auth::id())
            ->orderByDesc('created_at')
            ->limit(20)
            ->get(['id', 'report_key', 'format', 'status', 'completed_at', 'created_at']);

        return response()->json($reports);
    }
}
