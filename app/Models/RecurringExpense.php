<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RecurringExpense extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'tenant_id', 'user_id', 'title', 'description', 'amount', 'currency',
        'category_id', 'frequency', 'interval', 'next_run_date', 'end_date',
        'max_occurrences', 'occurrence_count', 'status', 'metadata',
    ];

    protected $casts = [
        'amount'           => 'decimal:2',
        'next_run_date'    => 'date',
        'end_date'         => 'date',
        'occurrence_count' => 'integer',
        'max_occurrences'  => 'integer',
        'interval'         => 'integer',
        'metadata'         => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(ExpenseCategory::class, 'category_id');
    }

    public function advanceNextRunDate(): void
    {
        $next = $this->next_run_date->copy();

        $next = match ($this->frequency) {
            'daily'     => $next->addDays($this->interval),
            'weekly'    => $next->addWeeks($this->interval),
            'monthly'   => $next->addMonthsNoOverflow($this->interval),
            'quarterly' => $next->addMonthsNoOverflow($this->interval * 3),
            'annual'    => $next->addYears($this->interval),
            default     => $next->addMonthsNoOverflow($this->interval),
        };

        $this->occurrence_count++;

        if (
            ($this->end_date && $next->gt($this->end_date)) ||
            ($this->max_occurrences && $this->occurrence_count >= $this->max_occurrences)
        ) {
            $this->status = 'completed';
        } else {
            $this->next_run_date = $next;
        }
    }

    public function scopeForTenant($query, int $tenantId)
    {
        return $query->where('tenant_id', $tenantId);
    }

    public function scopeDueToday($query)
    {
        return $query->where('status', 'active')
                     ->where('next_run_date', '<=', now()->toDateString());
    }
}
