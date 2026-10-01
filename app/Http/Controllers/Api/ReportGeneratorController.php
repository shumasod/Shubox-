<?php

namespace App\Http\Controllers\Api;

use App\Jobs\GenerateExpenseReport;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class ReportGeneratorController extends Controller
{
    private const ALLOWED_FORMATS = ['csv', 'xlsx', 'pdf'];
    private const ALLOWED_GROUPINGS = ['daily', 'weekly', 'monthly', 'category', 'department', 'project', 'vendor'];

    public function generate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'format'       => 'required|in:' . implode(',', self::ALLOWED_FORMATS),
            'grouping'     => 'required|in:' . implode(',', self::ALLOWED_GROUPINGS),
            'date_from'    => 'required|date',
            'date_to'      => 'required|date|after_or_equal:date_from',
            'status'       => 'nullable|array',
            'status.*'     => 'in:draft,submitted,approved,rejected',
            'category'     => 'nullable|string|max:64',
            'department_id'=> 'nullable|integer|min:1',
            'project_id'   => 'nullable|integer|min:1',
            'include_receipts' => 'boolean',
        ]);

        $user = Auth::user();
        $reportId = (string) Str::uuid();

        GenerateExpenseReport::dispatch(
            tenantId: $user->tenant_id,
            requestedByUserId: $user->id,
            reportId: $reportId,
            format: $validated['format'],
            grouping: $validated['grouping'],
            filters: array_filter([
                'date_from'     => $validated['date_from'],
                'date_to'       => $validated['date_to'],
                'status'        => $validated['status'] ?? null,
                'category'      => $validated['category'] ?? null,
                'department_id' => $validated['department_id'] ?? null,
                'project_id'    => $validated['project_id'] ?? null,
            ], fn($v) => $v !== null),
            includeReceipts: $validated['include_receipts'] ?? false,
        );

        return response()->json([
            'report_id' => $reportId,
            'status'    => 'queued',
            'message'   => 'レポートの生成を開始しました。完了時にメールで通知します。',
            'estimated_minutes' => $this->estimateMinutes($validated),
        ], 202);
    }

    public function status(Request $request, string $reportId): JsonResponse
    {
        $user = Auth::user();

        // Check notification (report ready) or job failure in database notifications
        $notification = $user->notifications()
            ->whereJsonContains('data->report_id', $reportId)
            ->latest()
            ->first();

        if (! $notification) {
            return response()->json(['report_id' => $reportId, 'status' => 'processing']);
        }

        $data = $notification->data;

        return response()->json([
            'report_id'    => $reportId,
            'status'       => $data['type'] === 'report_ready' ? 'ready' : 'failed',
            'download_url' => $data['download_url'] ?? null,
            'expires_at'   => $data['expires_at'] ?? null,
        ]);
    }

    private function estimateMinutes(array $params): int
    {
        // PDF with receipts is slowest; CSV is fastest
        if (($params['include_receipts'] ?? false) && $params['format'] === 'pdf') {
            return 5;
        }
        return match ($params['format']) {
            'pdf'  => 3,
            'xlsx' => 2,
            default => 1,
        };
    }
}
