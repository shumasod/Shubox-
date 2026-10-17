<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use App\Models\ExpenseComment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ExpenseCommentController extends Controller
{
    public function index(Request $request, int $expenseId): JsonResponse
    {
        $expense = Expense::where('tenant_id', $request->user()->tenant_id)
            ->findOrFail($expenseId);

        $comments = ExpenseComment::where('expense_id', $expense->id)
            ->with('user:id,name,avatar_url')
            ->orderBy('created_at')
            ->get();

        return response()->json(['data' => $comments]);
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
        $expense = Expense::where('tenant_id', $request->user()->tenant_id)
            ->findOrFail($expenseId);

        $data = $request->validate(['body' => 'required|string|max:5000']);

        $comment = ExpenseComment::create([
            'tenant_id'  => $request->user()->tenant_id,
            'expense_id' => $expense->id,
            'user_id'    => $request->user()->id,
            'body'       => $data['body'],
        ]);

        return response()->json(['data' => $comment->load('user:id,name,avatar_url')], 201);
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
        $comment = ExpenseComment::where('expense_id', $expenseId)
            ->where('user_id', $request->user()->id)
            ->findOrFail($commentId);

        $data = $request->validate(['body' => 'required|string|max:5000']);
        $comment->update($data);

        return response()->json(['data' => $comment->fresh('user:id,name,avatar_url')]);
    }

    public function destroy(Request $request, int $expenseId, int $commentId): JsonResponse
    {
        $comment = ExpenseComment::where('expense_id', $expenseId)
            ->where(function ($q) use ($request) {
                // Author or admin can delete
                $q->where('user_id', $request->user()->id)
                  ->orWhere(fn ($q2) => $q2->where('tenant_id', $request->user()->tenant_id)
                      ->whereHas('expense', fn ($q3) => $q3->where('tenant_id', $request->user()->tenant_id))
                  );
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
