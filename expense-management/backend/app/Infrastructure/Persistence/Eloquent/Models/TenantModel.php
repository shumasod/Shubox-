<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence\Eloquent\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TenantModel extends Model
{
    protected $table = 'tenants';

    protected $fillable = [
        'id', 'name', 'slug', 'settings', 'plan', 'is_active',
    ];

    protected $casts = [
        'settings' => 'array',
        'is_active' => 'boolean',
    ];

    public $incrementing = false;
    protected $keyType = 'string';

    public function users(): HasMany
    {
        return $this->hasMany(UserModel::class, 'tenant_id');
    }

    public function expenses(): HasMany
    {
        return $this->hasMany(ExpenseModel::class, 'tenant_id');
    }
}
