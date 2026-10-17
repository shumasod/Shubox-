<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class ExpenseTag extends Model
{
    protected $table = 'expense_tags';

    protected $fillable = ['tenant_id', 'name', 'color'];

    public function expenses(): BelongsToMany
    {
        return $this->belongsToMany(Expense::class, 'expense_tag_pivot', 'tag_id', 'expense_id');
    }
}
