<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence\Eloquent\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class RoleModel extends Model
{
    protected $table = 'roles';

    protected $fillable = [
        'id', 'tenant_id', 'name', 'description', 'is_system_role',
    ];

    protected $casts = [
        'is_system_role' => 'boolean',
    ];

    public $incrementing = false;
    protected $keyType = 'string';

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(TenantModel::class, 'tenant_id');
    }

    public function permissions(): BelongsToMany
    {
        return $this->belongsToMany(PermissionModel::class, 'role_permissions', 'role_id', 'permission_id');
    }

    public function hasPermission(string $permission): bool
    {
        return $this->permissions->contains('name', $permission);
    }
}
