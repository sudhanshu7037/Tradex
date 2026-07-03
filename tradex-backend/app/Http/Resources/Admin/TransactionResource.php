<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TransactionResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'               => $this->id,
            'user_id'          => $this->user_id,
            'user'             => $this->whenLoaded('user', function () {
                return [
                    'id'    => $this->user->id,
                    'name'  => $this->user->name,
                    'email' => $this->user->email,
                ];
            }),
            'stock_symbol'     => $this->stock_symbol,
            'transaction_type' => strtoupper($this->transaction_type),
            'quantity'         => (int) $this->quantity,
            'price_per_share'  => (float) $this->price_per_share,
            'total_value'      => (float) $this->total_value,
            'executed_at'      => $this->executed_at ? $this->executed_at->toISOString() : null,
            'created_at'       => $this->created_at ? $this->created_at->toISOString() : null,
        ];
    }
}
