<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence\Eloquent\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CategoryModel extends Model
{
    protected $table = 'categories';

    protected $fillable = [
        'id', 'tenant_id', 'name', 'code', 'parent_id',
        'max_amount', 'requires_receipt', 'is_active', 'sort_order',
    ];

    protected $casts = [
        'max_amount' => 'integer',
        'requires_receipt' => 'boolean',
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    public $incrementing = false;
    protected $keyType = 'string';

    public function parent(): BelongsTo
    {
        return $this->belongsTo(self::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(self::class, 'parent_id')->orderBy('sort_order');
    }
}
