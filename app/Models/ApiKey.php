<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class ApiKey extends Model
{
    use SoftDeletes;

    public const ALLOWED_SCOPES = [
        'expenses:read',
        'expenses:write',
        'reports:read',
        'approvals:read',
        'approvals:write',
        'analytics:read',
        'webhooks:manage',
    ];

    protected $fillable = [
        'tenant_id', 'user_id', 'name', 'key_prefix', 'key_hash',
        'scopes', 'expires_at', 'last_used_at', 'last_used_ip', 'is_active',
    ];

    protected $casts = [
        'scopes'       => 'array',
        'expires_at'   => 'datetime',
        'last_used_at' => 'datetime',
        'is_active'    => 'boolean',
    ];

    protected $hidden = ['key_hash'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public static function generate(int $tenantId, int $userId, string $name, array $scopes, ?\Carbon\Carbon $expiresAt): array
    {
        $rawKey = 'sxk_' . Str::random(40);
        $prefix = substr($rawKey, 0, 8);
        $hash   = hash('sha256', $rawKey);

        $model = static::create([
            'tenant_id'  => $tenantId,
            'user_id'    => $userId,
            'name'       => $name,
            'key_prefix' => $prefix,
            'key_hash'   => $hash,
            'scopes'     => $scopes,
            'expires_at' => $expiresAt,
        ]);

        return [$model, $rawKey];
    }

    public function isExpired(): bool
    {
        return $this->expires_at !== null && $this->expires_at->isPast();
    }

    public function hasScope(string $scope): bool
    {
        return in_array($scope, $this->scopes, true);
    }

    public function scopeForTenant($query, int $tenantId)
    {
        return $query->where('tenant_id', $tenantId);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true)
            ->where(fn ($q) => $q->whereNull('expires_at')->orWhere('expires_at', '>', now()));
    }
}
