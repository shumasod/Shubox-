<?php

namespace App\Http\Controllers\Api;

use App\Models\Expense;
use App\Models\ExpenseLineItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ExpenseLineItemController extends Controller
{
    public function index(Expense $expense): JsonResponse
    {
        $this->authorizeExpense($expense);

        return response()->json(
            $expense->lineItems()->orderBy('sort_order')->get()
        );
    }

    public function sync(Request $request, Expense $expense): JsonResponse
    {
        $this->authorizeExpense($expense);
        abort_if($expense->status !== 'draft', 403, 'Cannot modify line items on a non-draft expense.');

        $data = $request->validate([
            'items'                    => 'required|array|min:1|max:100',
            'items.*.description'      => 'required|string|max:500',
            'items.*.unit_price'       => 'required|numeric|min:0',
            'items.*.quantity'         => 'nullable|numeric|min:0.001|max:9999',
            'items.*.unit'             => 'nullable|string|max:50',
            'items.*.sort_order'       => 'nullable|integer|min:0',
        ]);

        DB::transaction(function () use ($expense, $data) {
            $expense->lineItems()->delete();

            $now  = now();
            $rows = array_map(fn($item, $i) => [
                'expense_id'  => $expense->id,
                'description' => $item['description'],
                'unit_price'  => $item['unit_price'],
                'quantity'    => $item['quantity'] ?? 1,
                'unit'        => $item['unit'] ?? null,
                'sort_order'  => $item['sort_order'] ?? $i,
                'created_at'  => $now,
                'updated_at'  => $now,
            ], $data['items'], array_keys($data['items']));

            ExpenseLineItem::insert($rows);

            // Sync expense total amount to sum of line items
            $total = array_sum(array_map(
                fn($item) => ($item['unit_price'] * ($item['quantity'] ?? 1)),
                $data['items']
            ));
            $expense->update(['amount' => $total]);
        });

        return response()->json([
            'items' => $expense->lineItems()->orderBy('sort_order')->get(),
            'total' => $expense->fresh()->amount,
        ]);
    }

    private function authorizeExpense(Expense $expense): void
    {
        abort_unless($expense->tenant_id === Auth::user()->tenant_id, 404);
    }
}
