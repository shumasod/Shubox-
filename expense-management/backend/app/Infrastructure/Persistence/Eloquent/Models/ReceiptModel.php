<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence\Eloquent\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReceiptModel extends Model
{
    protected $table = 'receipts';
    public $timestamps = false;

    protected $fillable = [
        'id', 'tenant_id', 'expense_item_id', 'original_filename',
        'storage_path', 'file_type', 'file_size', 'mime_type',
        'ocr_text', 'ocr_amount', 'ocr_date', 'ocr_vendor',
        'uploaded_by', 'created_at',
    ];

    protected $casts = [
        'file_size' => 'integer',
        'ocr_amount' => 'integer',
        'ocr_date' => 'date',
        'created_at' => 'datetime',
    ];

    public $incrementing = false;
    protected $keyType = 'string';

    public function expenseItem(): BelongsTo
    {
        return $this->belongsTo(ExpenseItemModel::class, 'expense_item_id');
    }

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(UserModel::class, 'uploaded_by');
    }
}
