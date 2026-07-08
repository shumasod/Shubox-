<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Webhook extends Model
{
    protected $fillable = [
        'tenant_id', 'url', 'secret', 'events', 'is_active',
    ];

    protected $casts = [
        'events'    => 'array',
        'is_active' => 'boolean',
    ];

    protected $hidden = ['secret'];

    public function deliveries(): HasMany
    {
        return $this->hasMany(WebhookDelivery::class);
    }

    public function subscribesTo(string $event): bool
    {
        return in_array($event, $this->events, true) || in_array('*', $this->events, true);
    }
}
