<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TenantSettings extends Model
{
    protected $fillable = [
        'tenant_id', 'default_currency', 'fiscal_year_start_month',
        'auto_approve_below', 'require_receipt_above',
        'allow_draft_edit_after_submit', 'require_department',
        'notification_channels',
    ];

    protected $casts = [
        'fiscal_year_start_month'       => 'integer',
        'auto_approve_below'            => 'integer',
        'require_receipt_above'         => 'integer',
        'allow_draft_edit_after_submit' => 'boolean',
        'require_department'            => 'boolean',
        'notification_channels'         => 'array',
    ];

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }
}
