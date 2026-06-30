<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Transaction extends Model
{
    protected $fillable = [

        'user_id',

        'stock_symbol',

        'transaction_type',

        'quantity',

        'price_per_share',

        'total_value',

        'executed_at'

    ];

    protected function casts(): array
    {
        return [

            'quantity' => 'integer',

            'price_per_share' => 'decimal:2',

            'total_value' => 'decimal:2',

            'executed_at' => 'datetime',

        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}