<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ApprovalChain extends Model
{
    protected $fillable = [
        'tenant_id', 'name', 'description', 'conditions', 'is_active', 'priority',
    ];

    protected $casts = [
        'conditions' => 'array',
        'is_active'  => 'boolean',
        'priority'   => 'integer',
    ];

    public function steps(): HasMany
    {
        return $this->hasMany(ApprovalChainStep::class, 'chain_id')->orderBy('step_order');
    }

    public function matchesExpense(Expense $expense): bool
    {
        $conditions = $this->conditions ?? [];

        if (isset($conditions['min_amount']) && $expense->amount < $conditions['min_amount']) {
            return false;
        }
        if (isset($conditions['max_amount']) && $expense->amount > $conditions['max_amount']) {
            return false;
        }
        if (isset($conditions['category_ids']) && !in_array($expense->category_id, $conditions['category_ids'], strict: true)) {
            return false;
        }
        if (isset($conditions['department_ids'])) {
            $deptId = $expense->user->department_id ?? null;
            if (!in_array($deptId, $conditions['department_ids'], strict: true)) {
                return false;
            }
        }

        return true;
    }

    public function scopeForTenant($query, int $tenantId)
    {
        return $query->where('tenant_id', $tenantId);
    }
}
