<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Asset extends Model
{
    protected $fillable = [
        'symbol',
        'name',
        'sector',
        'current_price',
        'override_price',
        'is_active',
    ];

    protected $casts = [
        'current_price' => 'decimal:2',
        'override_price' => 'decimal:2',
        'is_active' => 'boolean',
    ];
}
