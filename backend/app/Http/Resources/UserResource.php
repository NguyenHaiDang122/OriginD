<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        $roles = method_exists($this->resource, 'getRoleNames')
            ? $this->resource->getRoleNames()
            : collect();

        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'status' => $this->status ?? 'active',
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,

            // Keep both shapes so FE can parse easily.
            'roles' => $roles->values()->map(fn ($r) => ['name' => $r]),
            'role' => $roles->first(),
        ];
    }
}


