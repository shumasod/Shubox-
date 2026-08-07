<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class ExpenseComment extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = ['expense_id', 'user_id', 'tenant_id', 'body', 'is_internal'];

    protected $casts = ['is_internal' => 'boolean'];

    public function expense(): BelongsTo
    {
        return $this->belongsTo(Expense::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function scopeForTenant(Builder $query, int $tenantId): Builder
    {
        return $query->where('tenant_id', $tenantId);
    }

    public function scopePublic(Builder $query): Builder
    {
        return $query->where('is_internal', false);
    }
}
