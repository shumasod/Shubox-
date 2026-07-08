<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Budget extends Model
{
    protected $fillable = [
        'tenant_id', 'fiscal_year', 'department_id', 'category_id',
        'amount', 'spent', 'note',
    ];

    protected $casts = [
        'amount' => 'integer',
        'spent'  => 'integer',
    ];
}
