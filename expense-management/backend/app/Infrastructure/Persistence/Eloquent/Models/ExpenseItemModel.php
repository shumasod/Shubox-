<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence\Eloquent\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ExpenseItemModel extends Model
{
    protected $table = 'expense_items';

    protected $fillable = [
        'id', 'expense_id', 'category_id', 'description',
        'amount', 'quantity', 'unit_price', 'expense_date',
        'vendor', 'purpose', 'sort_order',
    ];

    protected $casts = [
        'amount' => 'integer',
        'quantity' => 'integer',
        'unit_price' => 'integer',
        'expense_date' => 'date',
        'sort_order' => 'integer',
    ];

    public $incrementing = false;
    protected $keyType = 'string';

    public function expense(): BelongsTo
    {
        return $this->belongsTo(ExpenseModel::class, 'expense_id');
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(CategoryModel::class, 'category_id');
    }

    public function receipts(): HasMany
    {
        return $this->hasMany(ReceiptModel::class, 'expense_item_id');
    }
}
