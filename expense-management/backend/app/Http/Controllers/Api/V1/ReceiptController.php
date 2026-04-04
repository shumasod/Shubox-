<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\Expense\ReceiptResource;
use App\Infrastructure\Persistence\Eloquent\Models\ExpenseItemModel;
use App\Infrastructure\Persistence\Eloquent\Models\ReceiptModel;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ReceiptController extends Controller
{
    private const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
    private const MAX_FILE_SIZE_KB = 10240; // 10MB

    /**
     * 領収書アップロード
     *
     * @OA\Post(
     *   path="/api/v1/expenses/{expenseId}/items/{itemId}/receipts",
     *   tags={"Receipts"},
     *   summary="領収書アップロード",
     *   security={{"bearerAuth":{}}},
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\MediaType(
     *       mediaType="multipart/form-data",
     *       @OA\Schema(
     *         @OA\Property(property="file", type="string", format="binary")
     *       )
     *     )
     *   ),
     *   @OA\Response(response=201, description="Uploaded")
     * )
     */
    public function store(Request $request, string $expenseId, string $itemId): JsonResponse
    {
        $request->validate([
            'file' => [
                'required',
                'file',
                'mimes:jpg,jpeg,png,gif,webp,pdf',
                'max:' . self::MAX_FILE_SIZE_KB,
            ],
        ]);

        $user = auth()->user();

        $item = ExpenseItemModel::whereHas('expense', fn($q) =>
            $q->where('tenant_id', $user->tenant_id)->where('id', $expenseId)
        )->findOrFail($itemId);

        $file = $request->file('file');
        $extension = $file->getClientOriginalExtension();
        $storagePath = sprintf(
            'tenants/%s/receipts/%s/%s.%s',
            $user->tenant_id,
            now()->format('Y/m'),
            Str::uuid(),
            $extension,
        );

        // S3にアップロード（本番は disk: 's3'）
        Storage::disk('s3')->put($storagePath, file_get_contents($file->getRealPath()), [
            'visibility' => 'private',
            'ContentType' => $file->getMimeType(),
        ]);

        $receipt = ReceiptModel::create([
            'id' => Str::uuid()->toString(),
            'tenant_id' => $user->tenant_id,
            'expense_item_id' => $itemId,
            'original_filename' => $file->getClientOriginalName(),
            'storage_path' => $storagePath,
            'file_type' => $extension,
            'file_size' => $file->getSize(),
            'mime_type' => $file->getMimeType(),
            'uploaded_by' => $user->id,
        ]);

        // OCR処理をキューに投入
        // \App\Jobs\ProcessReceiptOcr::dispatch($receipt->id);

        return response()->json(
            new ReceiptResource($receipt),
            Response::HTTP_CREATED
        );
    }

    /**
     * 領収書削除
     */
    public function destroy(string $expenseId, string $itemId, string $receiptId): JsonResponse
    {
        $user = auth()->user();

        $receipt = ReceiptModel::whereHas('expenseItem.expense', fn($q) =>
            $q->where('tenant_id', $user->tenant_id)->where('id', $expenseId)
        )->findOrFail($receiptId);

        Storage::disk('s3')->delete($receipt->storage_path);
        $receipt->delete();

        return response()->json(null, Response::HTTP_NO_CONTENT);
    }
}
