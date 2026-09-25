<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Expense;
use App\Models\ExpenseApproval;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ApprovalController extends Controller
{
    public function pending(Request $request): JsonResponse
    {
        $user     = Auth::user();
        $tenantId = $user->tenant_id;

        $approvals = ExpenseApproval::where('tenant_id', $tenantId)
            ->where('approver_id', $user->id)
            ->whereNull('action')
            ->with(['expense.submitter', 'expense.category'])
            ->orderBy('created_at')
            ->get()
            ->map(fn ($a) => [
                'id'         => $a->id,
                'step_name'  => $a->step_name,
                'deadline_at' => $a->deadline_at,
                'is_overdue' => $a->deadline_at && now()->gt($a->deadline_at),
                'expense'    => [
                    'id'           => $a->expense->id,
                    'title'        => $a->expense->title,
                    'amount'       => $a->expense->amount,
                    'currency'     => $a->expense->currency,
                    'category'     => $a->expense->category?->name,
                    'submitted_at' => $a->expense->submitted_at,
                ],
                'submitter' => [
                    'id'       => $a->expense->submitter->id,
                    'name'     => $a->expense->submitter->name,
                    'avatar_url' => $a->expense->submitter->avatar_url,
                ],
            ]);

        return response()->json(['data' => $approvals]);
    }

    public function approve(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate(['comment' => 'nullable|string|max:1000']);

        return $this->processAction($id, 'approved', $validated['comment'] ?? null);
    }

    public function reject(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate(['comment' => 'required|string|max:1000']);

        return $this->processAction($id, 'rejected', $validated['comment']);
    }

    public function bulkApprove(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'ids'   => 'required|array|min:1|max:50',
            'ids.*' => 'integer|min:1',
        ]);

        $user     = Auth::user();
        $tenantId = $user->tenant_id;
        $approved = 0;
        $skipped  = 0;

        DB::transaction(function () use ($validated, $user, $tenantId, &$approved, &$skipped) {
            foreach ($validated['ids'] as $id) {
                $approval = ExpenseApproval::where('tenant_id', $tenantId)
                    ->where('approver_id', $user->id)
                    ->whereNull('action')
                    ->find($id);

                if (!$approval) { $skipped++; continue; }

                $approval->update([
                    'action'   => 'approved',
                    'acted_at' => now(),
                    'comment'  => null,
                ]);

                $this->advanceWorkflow($approval);
                $approved++;
            }
        });

        return response()->json([
            'approved' => $approved,
            'skipped'  => $skipped,
        ]);
    }

    public function history(Request $request): JsonResponse
    {
        $user     = Auth::user();
        $tenantId = $user->tenant_id;

        $history = ExpenseApproval::where('tenant_id', $tenantId)
            ->where('approver_id', $user->id)
            ->whereNotNull('action')
            ->with(['expense.submitter'])
            ->orderByDesc('acted_at')
            ->paginate((int) $request->input('per_page', 20));

        return response()->json([
            'data' => collect($history->items())->map(fn ($a) => [
                'id'      => $a->id,
                'action'  => $a->action,
                'comment' => $a->comment,
                'acted_at' => $a->acted_at,
                'expense' => [
                    'id'       => $a->expense->id,
                    'title'    => $a->expense->title,
                    'amount'   => $a->expense->amount,
                    'currency' => $a->expense->currency,
                ],
                'submitter' => ['name' => $a->expense->submitter->name],
            ]),
            'meta' => [
                'current_page' => $history->currentPage(),
                'last_page'    => $history->lastPage(),
                'total'        => $history->total(),
            ],
        ]);
    }

    private function processAction(int $id, string $action, ?string $comment): JsonResponse
    {
        $user     = Auth::user();
        $tenantId = $user->tenant_id;

        $approval = ExpenseApproval::where('tenant_id', $tenantId)
            ->where('approver_id', $user->id)
            ->whereNull('action')
            ->findOrFail($id);

        DB::transaction(function () use ($approval, $action, $comment) {
            $approval->update([
                'action'   => $action,
                'acted_at' => now(),
                'comment'  => $comment,
            ]);

            $this->advanceWorkflow($approval);
        });

        AuditLog::record("expense.{$action}", 'Expense', $approval->expense_id, [
            'approval_id' => $id,
            'comment'     => $comment,
        ]);

        return response()->json(['data' => $approval->fresh()]);
    }

    private function advanceWorkflow(ExpenseApproval $approval): void
    {
        $expense = $approval->expense;

        if ($approval->action === 'rejected') {
            $expense->update(['status' => 'rejected']);
            // Cancel all remaining approval steps
            ExpenseApproval::where('expense_id', $expense->id)
                ->whereNull('action')
                ->update(['action' => 'cancelled', 'acted_at' => now()]);
            return;
        }

        // Check if all steps for this workflow level are approved
        $pendingInStep = ExpenseApproval::where('expense_id', $expense->id)
            ->where('step_order', $approval->step_order)
            ->whereNull('action')
            ->exists();

        if ($pendingInStep) return;

        // Advance to next step or mark approved
        $nextStep = ExpenseApproval::where('expense_id', $expense->id)
            ->where('step_order', '>', $approval->step_order)
            ->whereNull('action')
            ->orderBy('step_order')
            ->first();

        if (!$nextStep) {
            $expense->update(['status' => 'approved', 'approved_at' => now()]);
        }
    }
}
