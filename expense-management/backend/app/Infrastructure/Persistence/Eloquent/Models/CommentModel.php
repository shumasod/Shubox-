<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence\Eloquent\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class CommentModel extends Model
{
    use SoftDeletes;

    protected $table = 'comments';

    protected $fillable = [
        'id', 'tenant_id', 'expense_id', 'user_id', 'parent_id', 'body', 'is_edited',
    ];

    protected $casts = [
        'is_edited' => 'boolean',
    ];

    public $incrementing = false;
    protected $keyType = 'string';

    public function user(): BelongsTo
    {
        return $this->belongsTo(UserModel::class, 'user_id');
    }

    public function expense(): BelongsTo
    {
        return $this->belongsTo(ExpenseModel::class, 'expense_id');
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(self::class, 'parent_id');
    }

    public function replies(): HasMany
    {
        return $this->hasMany(self::class, 'parent_id')->with('user')->orderBy('created_at');
    }
}
