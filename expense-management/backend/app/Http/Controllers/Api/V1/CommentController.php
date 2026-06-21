<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Infrastructure\Persistence\Eloquent\Models\CommentModel;
use App\Infrastructure\Persistence\Eloquent\Models\ExpenseModel;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CommentController extends Controller
{
    public function index(Request $request, string $expenseId): JsonResponse
    {
        $tenantId = $request->attributes->get('tenant_id');

        $expense = ExpenseModel::where('tenant_id', $tenantId)->findOrFail($expenseId);

        $comments = CommentModel::with('author')
            ->where('expense_id', $expense->id)
            ->whereNull('parent_id')
            ->orderBy('created_at')
            ->get()
            ->map(fn($c) => $this->formatComment($c));

        return response()->json(['data' => $comments]);
    }

    public function store(Request $request, string $expenseId): JsonResponse
    {
        $tenantId = $request->attributes->get('tenant_id');
        $userId   = $request->user()->id;

        $validated = $request->validate([
            'body'      => ['required', 'string', 'min:1', 'max:2000'],
            'parent_id' => ['nullable', 'uuid', 'exists:comments,id'],
        ]);

        $expense = ExpenseModel::where('tenant_id', $tenantId)->findOrFail($expenseId);

        $comment = CommentModel::create([
            'id'         => Str::uuid()->toString(),
            'expense_id' => $expense->id,
            'user_id'    => $userId,
            'parent_id'  => $validated['parent_id'] ?? null,
            'body'       => $validated['body'],
        ]);

        $comment->load('author');

        return response()->json(['data' => $this->formatComment($comment)], 201);
    }

    public function update(Request $request, string $expenseId, string $commentId): JsonResponse
    {
        $tenantId = $request->attributes->get('tenant_id');
        $userId   = $request->user()->id;

        ExpenseModel::where('tenant_id', $tenantId)->findOrFail($expenseId);

        $comment = CommentModel::where('expense_id', $expenseId)
            ->where('user_id', $userId)
            ->findOrFail($commentId);

        $validated = $request->validate([
            'body' => ['required', 'string', 'min:1', 'max:2000'],
        ]);

        $comment->update(['body' => $validated['body']]);
        $comment->load('author');

        return response()->json(['data' => $this->formatComment($comment)]);
    }

    public function destroy(Request $request, string $expenseId, string $commentId): JsonResponse
    {
        $tenantId = $request->attributes->get('tenant_id');
        $userId   = $request->user()->id;

        ExpenseModel::where('tenant_id', $tenantId)->findOrFail($expenseId);

        $comment = CommentModel::where('expense_id', $expenseId)
            ->where('user_id', $userId)
            ->findOrFail($commentId);

        $comment->delete();

        return response()->json(null, 204);
    }

    private function formatComment(CommentModel $comment): array
    {
        return [
            'id'         => $comment->id,
            'body'       => $comment->body,
            'parent_id'  => $comment->parent_id,
            'author'     => [
                'id'         => $comment->author->id,
                'name'       => $comment->author->name,
                'department' => $comment->author->department,
            ],
            'replies'    => $comment->relationLoaded('replies')
                ? $comment->replies->map(fn($r) => $this->formatComment($r))->values()
                : [],
            'created_at' => $comment->created_at->toIso8601String(),
            'updated_at' => $comment->updated_at->toIso8601String(),
        ];
    }
}
