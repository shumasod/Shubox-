<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Tag extends Model
{
    protected $fillable = ['tenant_id', 'name', 'color'];

    public function expenses(): BelongsToMany
    {
        return $this->belongsToMany(Expense::class, 'expense_tag');
    }
}
