<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ExpenseLineItem extends Model
{
    protected $fillable = [
        'expense_id',
        'description',
        'unit_price',
        'quantity',
        'unit',
        'sort_order',
        'metadata',
    ];

    protected $casts = [
        'unit_price' => 'decimal:2',
        'quantity'   => 'decimal:3',
        'amount'     => 'decimal:2',
        'sort_order' => 'integer',
        'metadata'   => 'array',
    ];

    public function expense(): BelongsTo
    {
        return $this->belongsTo(Expense::class);
    }
}
