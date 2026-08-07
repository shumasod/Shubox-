<?php

namespace App\Http\Controllers\Api;

use App\Models\Expense;
use App\Models\ExpenseComment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Auth;

class ExpenseCommentController extends Controller
{
    public function index(int $expenseId): JsonResponse
    {
        $user = Auth::user();
        $tenantId = $user->tenant_id;

        $expense = Expense::where('tenant_id', $tenantId)->findOrFail($expenseId);

        $comments = ExpenseComment::where('expense_id', $expense->id)
            ->forTenant($tenantId)
            ->when(! $user->hasRole('manager'), fn($q) => $q->public())
            ->with('user:id,name')
            ->latest()
            ->get();

        return response()->json($comments);
    }

    public function store(Request $request, int $expenseId): JsonResponse
    {
        $user = Auth::user();
        $tenantId = $user->tenant_id;

        $expense = Expense::where('tenant_id', $tenantId)->findOrFail($expenseId);

        $validated = $request->validate([
            'body'        => 'required|string|max:2000',
            'is_internal' => 'boolean',
        ]);

        $isInternal = ($validated['is_internal'] ?? false) && $user->hasRole('manager');

        $comment = ExpenseComment::create([
            'expense_id'  => $expense->id,
            'user_id'     => $user->id,
            'tenant_id'   => $tenantId,
            'body'        => $validated['body'],
            'is_internal' => $isInternal,
        ]);

        return response()->json($comment->load('user:id,name'), 201);
    }

    public function update(Request $request, int $expenseId, int $commentId): JsonResponse
    {
        $user = Auth::user();
        $tenantId = $user->tenant_id;

        $comment = ExpenseComment::where('expense_id', $expenseId)
            ->where('user_id', $user->id)
            ->forTenant($tenantId)
            ->findOrFail($commentId);

        $validated = $request->validate(['body' => 'required|string|max:2000']);

        $comment->update($validated);

        return response()->json($comment->load('user:id,name'));
    }

    public function destroy(int $expenseId, int $commentId): JsonResponse
    {
        $user = Auth::user();
        $tenantId = $user->tenant_id;

        $comment = ExpenseComment::where('expense_id', $expenseId)
            ->forTenant($tenantId)
            ->where(function ($q) use ($user) {
                $q->where('user_id', $user->id)
                  ->orWhere(fn($q2) => $q2->whereRaw('? = 1', [$user->hasRole('admin') ? 1 : 0]));
            })
            ->findOrFail($commentId);

        $comment->delete();

        return response()->json(null, 204);
    }
}
