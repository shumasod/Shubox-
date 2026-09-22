<?php

namespace App\Http\Controllers\Api;

use App\Models\Expense;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class PaymentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'from'     => 'nullable|date',
            'to'       => 'nullable|date|after_or_equal:from',
            'method'   => 'nullable|string|in:bank_transfer,corporate_card,cash,other',
            'per_page' => 'nullable|integer|min:1|max:100',
        ]);

        $tenantId = Auth::user()->tenant_id;

        $payments = DB::table('payments')
            ->join('expenses', 'payments.expense_id', '=', 'expenses.id')
            ->join('users as requester', 'expenses.user_id', '=', 'requester.id')
            ->join('users as processor', 'payments.processed_by', '=', 'processor.id')
            ->where('payments.tenant_id', $tenantId)
            ->when(isset($validated['from']), fn ($q) => $q->whereDate('payments.payment_date', '>=', $validated['from']))
            ->when(isset($validated['to']),   fn ($q) => $q->whereDate('payments.payment_date', '<=', $validated['to']))
            ->when(isset($validated['method']), fn ($q) => $q->where('payments.method', $validated['method']))
            ->select(
                'payments.*',
                'expenses.title as expense_title',
                'requester.name as requester_name',
                'processor.name as processor_name'
            )
            ->orderByDesc('payments.payment_date')
            ->paginate($validated['per_page'] ?? 20);

        return response()->json($payments);
    }

    public function pay(Request $request, int $expenseId): JsonResponse
    {
        $validated = $request->validate([
            'method'           => 'required|string|in:bank_transfer,corporate_card,cash,other',
            'payment_date'     => 'required|date',
            'reference_number' => 'nullable|string|max:100',
            'bank_account'     => 'nullable|string|max:50',
            'notes'            => 'nullable|string|max:1000',
        ]);

        $tenantId = Auth::user()->tenant_id;

        $expense = Expense::where('tenant_id', $tenantId)
            ->where('status', 'approved')
            ->findOrFail($expenseId);

        DB::transaction(function () use ($expense, $validated, $tenantId) {
            DB::table('payments')->insert([
                'tenant_id'        => $tenantId,
                'expense_id'       => $expense->id,
                'processed_by'     => Auth::id(),
                'amount'           => $expense->amount,
                'currency'         => $expense->currency,
                'method'           => $validated['method'],
                'reference_number' => $validated['reference_number'] ?? null,
                'bank_account'     => $validated['bank_account'] ?? null,
                'payment_date'     => $validated['payment_date'],
                'notes'            => $validated['notes'] ?? null,
                'created_at'       => now(),
                'updated_at'       => now(),
            ]);

            $expense->update(['status' => 'paid', 'paid_at' => now()]);
        });

        return response()->json(['message' => '支払を記録しました。']);
    }

    public function bulkPay(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'expense_ids'      => 'required|array|min:1|max:100',
            'expense_ids.*'    => 'integer',
            'method'           => 'required|string|in:bank_transfer,corporate_card,cash,other',
            'payment_date'     => 'required|date',
            'reference_number' => 'nullable|string|max:100',
        ]);

        $tenantId = Auth::user()->tenant_id;

        $expenses = Expense::where('tenant_id', $tenantId)
            ->where('status', 'approved')
            ->whereIn('id', $validated['expense_ids'])
            ->get();

        if ($expenses->isEmpty()) {
            return response()->json(['message' => '支払い対象の経費が見つかりません。'], 422);
        }

        $now = now();

        DB::transaction(function () use ($expenses, $validated, $tenantId, $now) {
            $rows = $expenses->map(fn ($e) => [
                'tenant_id'        => $tenantId,
                'expense_id'       => $e->id,
                'processed_by'     => Auth::id(),
                'amount'           => $e->amount,
                'currency'         => $e->currency,
                'method'           => $validated['method'],
                'reference_number' => $validated['reference_number'] ?? null,
                'payment_date'     => $validated['payment_date'],
                'created_at'       => $now,
                'updated_at'       => $now,
            ])->toArray();

            DB::table('payments')->insert($rows);

            Expense::whereIn('id', $expenses->pluck('id'))
                ->update(['status' => 'paid', 'paid_at' => $now]);
        });

        return response()->json([
            'processed' => $expenses->count(),
            'message'   => "{$expenses->count()}件の支払を記録しました。",
        ]);
    }

    public function summary(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'from' => 'required|date',
            'to'   => 'required|date|after_or_equal:from',
        ]);

        $tenantId = Auth::user()->tenant_id;

        $summary = DB::table('payments')
            ->where('tenant_id', $tenantId)
            ->whereBetween('payment_date', [$validated['from'], $validated['to']])
            ->groupBy('method')
            ->select(
                'method',
                DB::raw('COUNT(*) as count'),
                DB::raw('SUM(amount) as total_amount')
            )
            ->get();

        return response()->json($summary);
    }
}
