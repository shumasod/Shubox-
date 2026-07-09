<?php

namespace App\Http\Controllers\Api;

use App\Models\Expense;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ReceiptController extends Controller
{
    private const MAX_SIZE_MB  = 10;
    private const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    private const PRESIGN_TTL  = 3600;

    public function store(Request $request, Expense $expense): JsonResponse
    {
        $this->authorizeExpense($expense);
        abort_if($expense->status !== 'draft', 403, 'Cannot attach receipts to a non-draft expense.');

        $request->validate([
            'receipt'      => sprintf(
                'required|file|max:%d|mimes:jpg,jpeg,png,webp,pdf',
                self::MAX_SIZE_MB * 1024
            ),
        ]);

        $file = $request->file('receipt');

        // Server-side MIME check (beyond extension spoofing)
        abort_unless(
            in_array($file->getMimeType(), self::ALLOWED_MIME, true),
            422,
            'Unsupported file type.'
        );

        $ext      = $file->getClientOriginalExtension();
        $key      = sprintf(
            'receipts/original/%d/%s/%s.%s',
            $expense->tenant_id,
            $expense->id,
            Str::uuid(),
            $ext
        );

        Storage::disk('s3')->putFileAs(
            dirname($key),
            $file,
            basename($key),
            ['ContentType' => $file->getMimeType(), 'ServerSideEncryption' => 'aws:kms']
        );

        $receipt = $expense->receipts()->create([
            'tenant_id'    => $expense->tenant_id,
            'original_name' => $file->getClientOriginalName(),
            's3_key'       => $key,
            'mime_type'    => $file->getMimeType(),
            'size_bytes'   => $file->getSize(),
        ]);

        return response()->json([
            'id'            => $receipt->id,
            'name'          => $receipt->original_name,
            'mime_type'     => $receipt->mime_type,
            'size_bytes'    => $receipt->size_bytes,
            'url'           => $this->signedUrl($key),
            'thumbnail_url' => $this->thumbnailUrl($key, '150x150'),
        ], 201);
    }

    public function destroy(Expense $expense, int $receiptId): JsonResponse
    {
        $this->authorizeExpense($expense);
        abort_if($expense->status !== 'draft', 403);

        $receipt = $expense->receipts()->findOrFail($receiptId);
        Storage::disk('s3')->delete($receipt->s3_key);
        $receipt->delete();

        return response()->json(null, 204);
    }

    public function presign(Request $request, Expense $expense, int $receiptId): JsonResponse
    {
        $this->authorizeExpense($expense);

        $receipt = $expense->receipts()->findOrFail($receiptId);

        return response()->json([
            'url'        => $this->signedUrl($receipt->s3_key),
            'expires_at' => now()->addSeconds(self::PRESIGN_TTL)->toIso8601String(),
        ]);
    }

    private function signedUrl(string $key): string
    {
        return Storage::disk('s3')->temporaryUrl($key, now()->addSeconds(self::PRESIGN_TTL));
    }

    private function thumbnailUrl(string $key, string $size): ?string
    {
        $thumbKey = str_replace('receipts/original/', "receipts/thumbnails/{$size}/", $key);
        return Storage::disk('s3')->exists($thumbKey)
            ? Storage::disk('s3')->temporaryUrl($thumbKey, now()->addSeconds(self::PRESIGN_TTL))
            : null;
    }

    private function authorizeExpense(Expense $expense): void
    {
        abort_unless($expense->tenant_id === Auth::user()->tenant_id, 404);
    }
}
