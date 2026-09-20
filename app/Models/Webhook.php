<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Webhook extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'tenant_id', 'name', 'url', 'secret', 'events',
        'is_active', 'timeout_seconds', 'retry_count',
        'last_triggered_at', 'last_status',
    ];

    protected $casts = [
        'events'             => 'array',
        'is_active'          => 'boolean',
        'last_triggered_at'  => 'datetime',
    ];

    protected $hidden = ['secret'];

    public function deliveries(): HasMany
    {
        return $this->hasMany(WebhookDelivery::class);
    }

    public function sign(array $payload): string
    {
        return hash_hmac('sha256', json_encode($payload), $this->secret);
    }
}
