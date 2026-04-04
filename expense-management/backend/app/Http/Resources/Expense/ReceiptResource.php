<?php

declare(strict_types=1);

namespace App\Http\Resources\Expense;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class ReceiptResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'original_filename' => $this->original_filename,
            'mime_type' => $this->mime_type,
            'file_size' => $this->file_size,
            'file_size_formatted' => $this->formatFileSize($this->file_size),
            'url' => Storage::temporaryUrl($this->storage_path, now()->addMinutes(60)),
            'ocr' => $this->when($this->ocr_text !== null, [
                'text' => $this->ocr_text,
                'amount' => $this->ocr_amount,
                'date' => $this->ocr_date?->toDateString(),
                'vendor' => $this->ocr_vendor,
            ]),
            'created_at' => $this->created_at->toIso8601String(),
        ];
    }

    private function formatFileSize(int $bytes): string
    {
        if ($bytes < 1024) return "{$bytes} B";
        if ($bytes < 1048576) return round($bytes / 1024, 1) . ' KB';
        return round($bytes / 1048576, 1) . ' MB';
    }
}
