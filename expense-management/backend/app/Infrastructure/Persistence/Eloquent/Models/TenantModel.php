<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence\Eloquent\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TenantModel extends Model
{
    protected $table      = 'tenants';
    protected $keyType    = 'string';
    public    $incrementing = false;

    protected $fillable = [
        'id', 'name', 'slug', 'plan', 'is_active', 'settings',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'settings'  => 'array',
    ];

    public function users(): HasMany
    {
        return $this->hasMany(UserModel::class, 'tenant_id');
    }

    public function expenses(): HasMany
    {
        return $this->hasMany(ExpenseModel::class, 'tenant_id');
    }
}
