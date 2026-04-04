<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence\Eloquent\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ApprovalStepModel extends Model
{
    protected $table = 'approval_steps';

    protected $fillable = [
        'id', 'approval_flow_id', 'step_number', 'step_name',
        'approver_type', 'approver_id', 'approver_role_id',
        'required_count', 'allow_delegation', 'deadline_days',
    ];

    protected $casts = [
        'step_number' => 'integer',
        'required_count' => 'integer',
        'allow_delegation' => 'boolean',
        'deadline_days' => 'integer',
    ];

    public $incrementing = false;
    protected $keyType = 'string';

    public function approvalFlow(): BelongsTo
    {
        return $this->belongsTo(ApprovalFlowModel::class, 'approval_flow_id');
    }
}
