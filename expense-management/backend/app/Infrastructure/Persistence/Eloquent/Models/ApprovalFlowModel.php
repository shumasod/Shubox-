<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence\Eloquent\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ApprovalFlowModel extends Model
{
    protected $table = 'approval_flows';

    protected $fillable = [
        'id', 'tenant_id', 'name', 'description', 'is_default',
        'min_amount', 'max_amount', 'category_ids', 'is_active',
    ];

    protected $casts = [
        'is_default' => 'boolean',
        'is_active' => 'boolean',
        'min_amount' => 'integer',
        'max_amount' => 'integer',
        'category_ids' => 'array',
    ];

    public $incrementing = false;
    protected $keyType = 'string';

    public function steps(): HasMany
    {
        return $this->hasMany(ApprovalStepModel::class, 'approval_flow_id')->orderBy('step_number');
    }
}
