<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class ExpenseCategory extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'tenant_id', 'parent_id', 'name', 'code', 'color', 'icon',
        'requires_receipt', 'receipt_threshold_amount', 'is_active', 'sort_order',
    ];

    protected $casts = [
        'requires_receipt'         => 'boolean',
        'is_active'                => 'boolean',
        'receipt_threshold_amount' => 'integer',
        'sort_order'               => 'integer',
    ];

    public function parent(): BelongsTo
    {
        return $this->belongsTo(self::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(self::class, 'parent_id')->orderBy('sort_order');
    }

    public function budgetAllocations(): HasMany
    {
        return $this->hasMany(CategoryBudgetAllocation::class, 'category_id');
    }

    public function scopeForTenant($query, int $tenantId)
    {
        return $query->where('tenant_id', $tenantId);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeRoots($query)
    {
        return $query->whereNull('parent_id');
    }
}
