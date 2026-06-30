<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Portfolio extends Model
{
    protected $fillable = [

        'user_id',

        'stock_symbol',

        'total_quantity',

        'average_buy_price'

    ];

    protected function casts(): array
    {
        return [

            'total_quantity' => 'integer',

            'average_buy_price' => 'decimal:2',

        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}