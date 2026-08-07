<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Vendor extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'tenant_id', 'name', 'code', 'email', 'phone', 'website',
        'tax_id', 'currency', 'status', 'category', 'notes',
    ];

    public function expenses(): HasMany
    {
        return $this->hasMany(Expense::class);
    }

    public function scopeForTenant($query, int $tenantId)
    {
        return $query->where('tenant_id', $tenantId);
    }

    public function getSpendStatsAttribute(): array
    {
        $stats = $this->expenses()
            ->selectRaw('COUNT(*) as total_count, SUM(amount) as total_amount, MAX(expense_date) as last_expense_date')
            ->first();

        return [
            'total_count'       => (int) ($stats->total_count ?? 0),
            'total_amount'      => (int) ($stats->total_amount ?? 0),
            'last_expense_date' => $stats->last_expense_date,
        ];
    }
}
