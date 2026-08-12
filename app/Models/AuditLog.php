<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class AuditLog extends Model
{
    protected $fillable = [
        'tenant_id', 'user_id', 'auditable_type', 'auditable_id',
        'event', 'old_values', 'new_values', 'ip_address', 'user_agent', 'tags',
    ];

    protected $casts = [
        'old_values' => 'array',
        'new_values' => 'array',
        'tags'       => 'array',
    ];

    public function auditable(): MorphTo
    {
        return $this->morphTo();
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public static function record(
        string $event,
        Model $model,
        array $oldValues = [],
        array $newValues = [],
        ?int $tenantId = null,
        ?int $userId = null
    ): self {
        return static::create([
            'tenant_id'      => $tenantId ?? auth()->user()?->tenant_id,
            'user_id'        => $userId ?? auth()->id(),
            'auditable_type' => get_class($model),
            'auditable_id'   => $model->getKey(),
            'event'          => $event,
            'old_values'     => $oldValues ?: null,
            'new_values'     => $newValues ?: null,
            'ip_address'     => request()->ip(),
            'user_agent'     => request()->userAgent(),
        ]);
    }
}
