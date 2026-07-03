<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AuditLogResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'admin_id'    => $this->admin_id,
            'admin'       => $this->whenLoaded('admin', function () {
                return [
                    'id'    => $this->admin->id,
                    'name'  => $this->admin->name,
                    'email' => $this->admin->email,
                ];
            }),
            'action'      => $this->action,
            'entity_type' => $this->entity_type,
            'entity_id'   => $this->entity_id,
            'old_values'  => $this->old_values,
            'new_values'  => $this->new_values,
            'ip_address'  => $this->ip_address,
            'user_agent'  => $this->user_agent,
            'created_at'  => $this->created_at ? $this->created_at->toISOString() : null,
        ];
    }
}
