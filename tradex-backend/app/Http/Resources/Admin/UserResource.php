<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'name'           => $this->name,
            'email'          => $this->email,
            'status'         => $this->status ?? 'active',
            'wallet_balance' => (float) $this->wallet_balance,
            'created_at'     => $this->created_at ? $this->created_at->toISOString() : null,
            'updated_at'     => $this->updated_at ? $this->updated_at->toISOString() : null,
            'portfolios_count'   => $this->whenCounted('portfolios'),
            'transactions_count' => $this->whenCounted('transactions'),
            'watchlists_count'   => $this->whenCounted('watchlists'),
            'portfolios'     => PortfolioResource::collection($this->whenLoaded('portfolios')),
            'transactions'   => TransactionResource::collection($this->whenLoaded('transactions')),
            'watchlists'     => WatchlistResource::collection($this->whenLoaded('watchlists')),
        ];
    }
}
