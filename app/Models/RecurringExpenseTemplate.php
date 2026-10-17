<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class RecurringExpenseTemplate extends Model
{
    use HasFactory;

    protected $fillable = [
        'tenant_id',
        'user_id',
        'title',
        'description',
        'category_id',
        'amount',
        'currency',
        'frequency',
        'frequency_interval',
        'start_date',
        'end_date',
        'next_run_date',
        'last_run_date',
        'is_active',
        'metadata',
    ];

    protected $casts = [
        'amount'             => 'decimal:2',
        'start_date'         => 'date',
        'end_date'           => 'date',
        'next_run_date'      => 'date',
        'last_run_date'      => 'date',
        'is_active'          => 'boolean',
        'metadata'           => 'array',
        'frequency_interval' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(ExpenseCategory::class);
    }

    public function calculateNextRunDate(): \Carbon\Carbon
    {
        $base = $this->next_run_date ?? now();
        $interval = $this->frequency_interval;

        return match ($this->frequency) {
            'daily'     => $base->copy()->addDays($interval),
            'weekly'    => $base->copy()->addWeeks($interval),
            'monthly'   => $base->copy()->addMonths($interval),
            'quarterly' => $base->copy()->addMonths($interval * 3),
            'yearly'    => $base->copy()->addYears($interval),
        };
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true)
                     ->where('next_run_date', '<=', now()->toDateString())
                     ->where(function ($q) {
                         $q->whereNull('end_date')
                           ->orWhere('end_date', '>=', now()->toDateString());
                     });
    }
}
