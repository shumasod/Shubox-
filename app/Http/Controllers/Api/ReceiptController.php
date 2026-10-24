<?php

namespace App\Http\Controllers\Api;

use App\Models\Expense;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Models\Receipt;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
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
    private const MAX_FILE_SIZE_MB = 10;
    private const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    private const MAX_RECEIPTS_PER_EXPENSE = 10;

    public function index(int $expenseId): JsonResponse
    {
        $expense = $this->findExpenseForUser($expenseId);

        $receipts = $expense->receipts()->orderBy('created_at')->get();

        return response()->json($receipts->map(fn(Receipt $r) => [
            'id'         => $r->id,
            'filename'   => $r->filename,
            'mime_type'  => $r->mime_type,
            'size_bytes' => $r->size_bytes,
            'url'        => Storage::disk('s3')->temporaryUrl($r->s3_key, now()->addMinutes(30)),
            'created_at' => $r->created_at,
        ]));
    }

    public function store(Request $request, int $expenseId): JsonResponse
    {
        $expense = $this->findExpenseForUser($expenseId);

        if (in_array($expense->status, ['approved', 'rejected'])) {
            return response()->json(['message' => 'Cannot add receipts to a finalized expense.'], 422);
        }

        $currentCount = $expense->receipts()->count();
        if ($currentCount >= self::MAX_RECEIPTS_PER_EXPENSE) {
            return response()->json([
                'message' => 'Maximum of ' . self::MAX_RECEIPTS_PER_EXPENSE . ' receipts per expense.',
            ], 422);
        }

        $request->validate([
            'file' => [
                'required',
                'file',
                'max:' . (self::MAX_FILE_SIZE_MB * 1024),
            ],
        ]);

        $file = $request->file('file');

        // Server-side MIME validation (not trusting Content-Type header)
        $mimeType = $file->getMimeType();
        if (! in_array($mimeType, self::ALLOWED_MIMES)) {
            return response()->json([
                'message' => 'File type not allowed. Accepted: JPEG, PNG, WebP, PDF.',
            ], 422);
        }

        $ext = $file->extension();
        $s3Key = sprintf(
            'receipts/%d/%d/%s.%s',
            Auth::user()->tenant_id,
            $expenseId,
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
        Storage::disk('s3')->put(
            $s3Key,
            file_get_contents($file->getRealPath()),
            [
                'ServerSideEncryption' => 'aws:kms',
                'ContentType'          => $mimeType,
            ]
        );

        $receipt = Receipt::create([
            'expense_id' => $expense->id,
            'tenant_id'  => Auth::user()->tenant_id,
            'filename'   => $file->getClientOriginalName(),
            's3_key'     => $s3Key,
            'mime_type'  => $mimeType,
            'size_bytes' => $file->getSize(),
        ]);

        return response()->json([
            'id'         => $receipt->id,
            'filename'   => $receipt->filename,
            'mime_type'  => $receipt->mime_type,
            'size_bytes' => $receipt->size_bytes,
            'url'        => Storage::disk('s3')->temporaryUrl($s3Key, now()->addMinutes(30)),
        ], 201);
    }

    public function destroy(int $expenseId, int $receiptId): JsonResponse
    {
        $expense = $this->findExpenseForUser($expenseId);

        if (in_array($expense->status, ['approved', 'rejected'])) {
            return response()->json(['message' => 'Cannot delete receipts from a finalized expense.'], 422);
        }

        $receipt = Receipt::where('expense_id', $expense->id)
            ->where('tenant_id', Auth::user()->tenant_id)
            ->findOrFail($receiptId);

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
    private function findExpenseForUser(int $expenseId): Expense
    {
        return Expense::where('tenant_id', Auth::user()->tenant_id)
            ->findOrFail($expenseId);
    }
}
