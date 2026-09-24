<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use App\Models\ExpenseAttachment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ExpenseAttachmentController extends Controller
{
    private const ALLOWED_MIMES = [
        'image/jpeg', 'image/png', 'image/webp',
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
    ];

    private const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

    public function index(Request $request, int $expenseId): JsonResponse
    {
        $expense     = Expense::where('tenant_id', $request->user()->tenant_id)->findOrFail($expenseId);
        $attachments = ExpenseAttachment::where('expense_id', $expense->id)
            ->with('uploader:id,name')
            ->orderBy('created_at')
            ->get()
            ->map(fn ($a) => array_merge($a->toArray(), [
                'download_url' => Storage::disk('s3')->temporaryUrl($a->s3_key, now()->addMinutes(15)),
            ]));

        return response()->json(['data' => $attachments]);
    }

    public function store(Request $request, int $expenseId): JsonResponse
    {
        $expense = Expense::where('tenant_id', $request->user()->tenant_id)->findOrFail($expenseId);

        $request->validate([
            'file' => ['required', 'file', 'max:10240'],
        ]);

        $file = $request->file('file');

        if (!in_array($file->getMimeType(), self::ALLOWED_MIMES, true)) {
            return response()->json(['message' => 'File type not allowed'], 422);
        }

        if ($file->getSize() > self::MAX_SIZE_BYTES) {
            return response()->json(['message' => 'File too large (max 10 MB)'], 422);
        }

        $s3Key = sprintf(
            'tenants/%d/expenses/%d/attachments/%s.%s',
            $request->user()->tenant_id,
            $expense->id,
            Str::uuid(),
            $file->getClientOriginalExtension()
        );

        Storage::disk('s3')->put($s3Key, $file->getContent(), [
            'ServerSideEncryption' => 'aws:kms',
            'ContentType'          => $file->getMimeType(),
        ]);

        $attachment = ExpenseAttachment::create([
            'tenant_id'         => $request->user()->tenant_id,
            'expense_id'        => $expense->id,
            'uploaded_by'       => $request->user()->id,
            'original_filename' => $file->getClientOriginalName(),
            's3_key'            => $s3Key,
            'mime_type'         => $file->getMimeType(),
            'size_bytes'        => $file->getSize(),
        ]);

        return response()->json(['data' => $attachment], 201);
    }

    public function destroy(Request $request, int $expenseId, int $attachmentId): JsonResponse
    {
        $attachment = ExpenseAttachment::where('expense_id', $expenseId)
            ->where('tenant_id', $request->user()->tenant_id)
            ->findOrFail($attachmentId);

        Storage::disk('s3')->delete($attachment->s3_key);
        $attachment->delete();

        return response()->json(null, 204);
    }
}
