<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Budget extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'tenant_id', 'name', 'budget_type', 'target_id', 'period_type',
        'period_start', 'period_end', 'amount', 'currency', 'alert_threshold', 'is_active',
    ];

    protected $casts = [
        'amount'          => 'integer',
        'alert_threshold' => 'integer',
        'is_active'       => 'boolean',
        'period_start'    => 'date',
        'period_end'      => 'date',
    ];
}
