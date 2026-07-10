<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Budget extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'tenant_id', 'name', 'type', 'owner_id', 'owner_type',
        'amount', 'currency', 'period', 'start_date', 'end_date',
        'spent_amount', 'status', 'alert_threshold',
    ];

    protected $casts = [
        'amount'          => 'decimal:2',
        'spent_amount'    => 'decimal:2',
        'start_date'      => 'date',
        'end_date'        => 'date',
        'alert_threshold' => 'integer',
    ];

    public function owner(): MorphTo
    {
        return $this->morphTo();
    }

    public function getUtilizationPercentAttribute(): float
    {
        if ($this->amount <= 0) {
            return 0.0;
        }
        return round(($this->spent_amount / $this->amount) * 100, 2);
    }

    public function getRemainingAmountAttribute(): string
    {
        return number_format(max(0, $this->amount - $this->spent_amount), 2, '.', '');
    }

    public function isExceeded(): bool
    {
        return $this->spent_amount > $this->amount;
    }

    public function isAlertTriggered(): bool
    {
        return $this->utilization_percent >= $this->alert_threshold;
    }

    public function scopeForTenant($query, int $tenantId)
    {
        return $query->where('tenant_id', $tenantId);
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeCurrentPeriod($query)
    {
        $today = now()->toDateString();
        return $query->where('start_date', '<=', $today)
                     ->where('end_date', '>=', $today);
    }
}
