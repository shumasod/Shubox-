<?php

namespace App\Http\Controllers\Api;

use App\Models\Expense;
use App\Models\ApprovalStep;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ApprovalHistoryController extends Controller
{
    public function forExpense(Expense $expense): JsonResponse
    {
        abort_unless($expense->tenant_id === Auth::user()->tenant_id, 404);

        $steps = ApprovalStep::where('expense_id', $expense->id)
            ->with('approver:id,name,email')
            ->orderBy('step_order')
            ->get()
            ->map(fn($step) => [
                'id'           => $step->id,
                'step_order'   => $step->step_order,
                'step_name'    => $step->step_name,
                'status'       => $step->status,
                'approver'     => $step->approver ? [
                    'id'    => $step->approver->id,
                    'name'  => $step->approver->name,
                    'email' => $step->approver->email,
                ] : null,
                'comment'      => $step->comment,
                'decided_at'   => $step->decided_at?->toIso8601String(),
                'is_current'   => $step->status === 'pending' && $step->step_order === $this->currentStepOrder($expense->id),
            ]);

        return response()->json([
            'expense_id'     => $expense->id,
            'expense_status' => $expense->status,
            'steps'          => $steps,
            'summary' => [
                'total_steps'    => $steps->count(),
                'completed'      => $steps->where('status', 'approved')->count(),
                'pending'        => $steps->where('status', 'pending')->count(),
                'rejected'       => $steps->where('status', 'rejected')->count(),
            ],
        ]);
    }

    public function pendingForUser(Request $request): JsonResponse
    {
        $user = Auth::user();

        $pending = ApprovalStep::where('approver_id', $user->id)
            ->where('status', 'pending')
            ->whereHas('expense', fn($q) => $q->where('tenant_id', $user->tenant_id)->where('status', 'pending'))
            ->with([
                'expense:id,title,amount,currency,expense_date,user_id,status',
                'expense.submitter:id,name',
            ])
            ->orderBy('created_at')
            ->paginate(20);

        return response()->json($pending);
    }

    public function statistics(Request $request): JsonResponse
    {
        $request->validate([
            'start_date' => 'nullable|date',
            'end_date'   => 'nullable|date|after_or_equal:start_date',
        ]);

        $tenantId = Auth::user()->tenant_id;

        $stats = DB::table('approval_steps as s')
            ->join('expenses as e', 's.expense_id', '=', 'e.id')
            ->where('e.tenant_id', $tenantId)
            ->when($request->start_date, fn($q) => $q->where('s.decided_at', '>=', $request->start_date))
            ->when($request->end_date, fn($q) => $q->where('s.decided_at', '<=', $request->end_date))
            ->whereIn('s.status', ['approved', 'rejected'])
            ->selectRaw(
                'COUNT(*) as total_decisions,
                 SUM(CASE WHEN s.status = "approved" THEN 1 ELSE 0 END) as total_approved,
                 SUM(CASE WHEN s.status = "rejected" THEN 1 ELSE 0 END) as total_rejected,
                 AVG(TIMESTAMPDIFF(HOUR, e.submitted_at, s.decided_at)) as avg_hours_to_decide'
            )
            ->first();

        return response()->json([
            'total_decisions'    => (int) ($stats->total_decisions ?? 0),
            'total_approved'     => (int) ($stats->total_approved ?? 0),
            'total_rejected'     => (int) ($stats->total_rejected ?? 0),
            'approval_rate'      => $stats->total_decisions > 0
                ? round($stats->total_approved / $stats->total_decisions * 100, 1)
                : 0,
            'avg_hours_to_decide' => round((float) ($stats->avg_hours_to_decide ?? 0), 1),
        ]);
    }

    private function currentStepOrder(int $expenseId): int
    {
        return (int) ApprovalStep::where('expense_id', $expenseId)
            ->where('status', 'pending')
            ->min('step_order');
    }
}
