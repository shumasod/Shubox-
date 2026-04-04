<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence\Eloquent\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ApprovalRecordModel extends Model
{
    protected $table = 'approval_records';
    public $timestamps = false;

    protected $fillable = [
        'id', 'expense_id', 'approval_step_id', 'approver_id',
        'action', 'comment', 'delegated_to', 'acted_at',
    ];

    protected $casts = [
        'acted_at' => 'datetime',
    ];

    public $incrementing = false;
    protected $keyType = 'string';

    public function expense(): BelongsTo
    {
        return $this->belongsTo(ExpenseModel::class, 'expense_id');
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(UserModel::class, 'approver_id');
    }
}
