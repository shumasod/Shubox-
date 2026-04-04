<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence\Eloquent\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class ExpenseModel extends Model
{
    use SoftDeletes;

    protected $table = 'expenses';

    protected $fillable = [
        'id', 'tenant_id', 'applicant_id', 'expense_number', 'title',
        'description', 'total_amount', 'currency', 'status',
        'applied_at', 'approved_at', 'paid_at', 'due_date',
        'approval_flow_id', 'current_step',
    ];

    protected $casts = [
        'total_amount' => 'integer',
        'applied_at' => 'datetime',
        'approved_at' => 'datetime',
        'paid_at' => 'datetime',
        'due_date' => 'datetime',
        'current_step' => 'integer',
    ];

    public $incrementing = false;
    protected $keyType = 'string';

    // テナントスコープ
    public function scopeForTenant($query, string $tenantId)
    {
        return $query->where('tenant_id', $tenantId);
    }

    // スコープ
    public function scopeStatus($query, string $status)
    {
        return $query->where('status', $status);
    }

    public function scopePending($query)
    {
        return $query->whereIn('status', ['pending', 'partially_approved']);
    }

    public function applicant(): BelongsTo
    {
        return $this->belongsTo(UserModel::class, 'applicant_id');
    }

    public function approvalFlow(): BelongsTo
    {
        return $this->belongsTo(ApprovalFlowModel::class, 'approval_flow_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(ExpenseItemModel::class, 'expense_id')->orderBy('sort_order');
    }

    public function approvalRecords(): HasMany
    {
        return $this->hasMany(ApprovalRecordModel::class, 'expense_id')->orderBy('created_at');
    }

    public function comments(): HasMany
    {
        return $this->hasMany(CommentModel::class, 'expense_id')
            ->whereNull('parent_id')
            ->with('replies')
            ->orderBy('created_at');
    }
}
