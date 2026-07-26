<?php

namespace App\Http\Controllers\Api;

use App\Models\Expense;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ExpenseCommentController extends Controller
{
    public function index(int $expenseId): JsonResponse
    {
        $user     = Auth::user();
        $tenantId = $user->tenant_id;

        // Verify expense belongs to tenant
        $expense = Expense::where('tenant_id', $tenantId)->findOrFail($expenseId);

        $isPrivileged = in_array($user->role, ['admin', 'approver', 'finance']);

        $comments = DB::table('expense_comments')
            ->join('users', 'expense_comments.user_id', '=', 'users.id')
            ->where('expense_comments.expense_id', $expense->id)
            ->where('expense_comments.tenant_id', $tenantId)
            ->whereNull('expense_comments.deleted_at')
            ->whereNull('expense_comments.parent_id') // top-level only; replies fetched separately
            ->when(! $isPrivileged, fn ($q) => $q->where('expense_comments.is_internal', false))
            ->orderBy('expense_comments.created_at')
            ->select(
                'expense_comments.id',
                'expense_comments.body',
                'expense_comments.is_internal',
                'expense_comments.parent_id',
                'expense_comments.created_at',
                'expense_comments.updated_at',
                'users.id as user_id',
                'users.name as user_name',
            )
            ->get();

        // Attach reply counts
        $ids = $comments->pluck('id');
        $replyCounts = DB::table('expense_comments')
            ->whereIn('parent_id', $ids)
            ->whereNull('deleted_at')
            ->groupBy('parent_id')
            ->select('parent_id', DB::raw('COUNT(*) as reply_count'))
            ->pluck('reply_count', 'parent_id');

        $enriched = $comments->map(fn ($c) => [
            ...(array) $c,
            'reply_count' => $replyCounts[$c->id] ?? 0,
        ]);

        return response()->json($enriched);
    }

    public function replies(int $expenseId, int $commentId): JsonResponse
    {
        $tenantId = Auth::user()->tenant_id;
        Expense::where('tenant_id', $tenantId)->findOrFail($expenseId);

        $replies = DB::table('expense_comments')
            ->join('users', 'expense_comments.user_id', '=', 'users.id')
            ->where('expense_comments.parent_id', $commentId)
            ->whereNull('expense_comments.deleted_at')
            ->orderBy('expense_comments.created_at')
            ->select(
                'expense_comments.id',
                'expense_comments.body',
                'expense_comments.created_at',
                'users.id as user_id',
                'users.name as user_name',
            )
            ->get();

        return response()->json($replies);
    }

    public function store(Request $request, int $expenseId): JsonResponse
    {
        $validated = $request->validate([
            'body'        => 'required|string|max:5000',
            'is_internal' => 'boolean',
            'parent_id'   => 'nullable|integer|exists:expense_comments,id',
        ]);

        $user     = Auth::user();
        $tenantId = $user->tenant_id;

        Expense::where('tenant_id', $tenantId)->findOrFail($expenseId);

        // Only privileged users can post internal comments
        $isInternal = ($validated['is_internal'] ?? false)
            && in_array($user->role, ['admin', 'approver', 'finance']);

        $id = DB::table('expense_comments')->insertGetId([
            'tenant_id'   => $tenantId,
            'expense_id'  => $expenseId,
            'user_id'     => $user->id,
            'body'        => $validated['body'],
            'is_internal' => $isInternal,
            'parent_id'   => $validated['parent_id'] ?? null,
            'created_at'  => now(),
            'updated_at'  => now(),
        ]);

        $comment = DB::table('expense_comments')
            ->join('users', 'expense_comments.user_id', '=', 'users.id')
            ->where('expense_comments.id', $id)
            ->select('expense_comments.*', 'users.name as user_name')
            ->first();

        return response()->json($comment, 201);
    }

    public function destroy(int $expenseId, int $commentId): JsonResponse
    {
        $tenantId = Auth::user()->tenant_id;

        $comment = DB::table('expense_comments')
            ->where('id', $commentId)
            ->where('tenant_id', $tenantId)
            ->where('user_id', Auth::id())
            ->whereNull('deleted_at')
            ->first();

        if (! $comment) {
            return response()->json(['message' => 'Comment not found.'], 404);
        }

        DB::table('expense_comments')
            ->where('id', $commentId)
            ->update(['deleted_at' => now()]);

        return response()->json(null, 204);
    }
}
