<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ExpenseCategory extends Model
{
    use HasFactory;

    protected $fillable = [
        'tenant_id', 'name', 'slug', 'icon', 'color',
        'monthly_budget_limit', 'is_active', 'sort_order',
    ];

    protected $casts = [
        'is_active'            => 'boolean',
        'monthly_budget_limit' => 'integer',
        'sort_order'           => 'integer',
    ];

    public function expenses(): HasMany
    {
        return $this->hasMany(Expense::class, 'category_id');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeForTenant($query, int $tenantId)
    {
        return $query->where('tenant_id', $tenantId);
    }
}
