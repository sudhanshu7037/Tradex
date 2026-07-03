<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PortfolioResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $quantity = (int) $this->total_quantity;
        $avgPrice = (float) $this->average_buy_price;
        $totalInvested = round($quantity * $avgPrice, 2);

        return [
            'id'                => $this->id,
            'user_id'           => $this->user_id,
            'user'              => $this->whenLoaded('user', function () {
                return [
                    'id'    => $this->user->id,
                    'name'  => $this->user->name,
                    'email' => $this->user->email,
                ];
            }),
            'stock_symbol'      => $this->stock_symbol,
            'total_quantity'    => $quantity,
            'average_buy_price' => $avgPrice,
            'total_invested'    => $totalInvested,
            'created_at'        => $this->created_at ? $this->created_at->toISOString() : null,
            'updated_at'        => $this->updated_at ? $this->updated_at->toISOString() : null,
        ];
    }
}
