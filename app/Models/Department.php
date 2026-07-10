<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Department extends Model
{
    protected $fillable = [
        'tenant_id', 'parent_id', 'name', 'code',
        'monthly_budget', 'is_active', 'depth',
    ];

    protected $casts = [
        'is_active'      => 'boolean',
        'monthly_budget' => 'integer',
        'depth'          => 'integer',
    ];

    public function parent(): BelongsTo
    {
        return $this->belongsTo(Department::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(Department::class, 'parent_id');
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class, 'department_id');
    }

    public function scopeForTenant($query, int $tenantId)
    {
        return $query->where('tenant_id', $tenantId);
    }

    public function scopeRoots($query)
    {
        return $query->whereNull('parent_id');
    }
}
