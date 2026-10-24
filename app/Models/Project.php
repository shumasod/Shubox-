<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Project extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'tenant_id', 'department_id', 'owner_user_id',
        'name', 'code', 'description', 'status',
        'start_date', 'end_date', 'budget_amount', 'budget_currency',
    ];

    protected $casts = [
        'start_date'    => 'date',
        'end_date'      => 'date',
        'budget_amount' => 'decimal:2',
    ];

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_user_id');
    }

    public function expenses(): HasMany
    {
        return $this->hasMany(Expense::class);
    }

    public function scopeForTenant(Builder $query, int $tenantId): Builder
    {
        return $query->where('tenant_id', $tenantId);
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', 'active');
    }

    public function getSpentAmountAttribute(): float
    {
        return (float) $this->expenses()
            ->whereIn('status', ['approved'])
            ->sum('amount');
    }

    public function getBudgetUtilizationAttribute(): float|null
    {
        if (! $this->budget_amount || $this->budget_amount == 0) {
            return null;
        }
        return round(($this->spent_amount / $this->budget_amount) * 100, 1);
    }
}
