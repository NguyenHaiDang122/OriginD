<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TemplateResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [

            'id' => $this->id,

            'name' => $this->name,

            'slug' => $this->slug,

            'description' => $this->description,

            'thumbnail' => $this->thumbnail ? (
                str_starts_with($this->thumbnail, 'http://') || str_starts_with($this->thumbnail, 'https://')
                    ? $this->thumbnail
                    : url('storage/' . ltrim($this->thumbnail, '/'))
            ) : null,

            'version' => $this->version,

            'status' => $this->status,

            'renewal_price' => (int) ($this->renewal_price ?? 50000),

            'is_featured' => (bool) $this->is_featured,

            'fields' => $this->fields,

        ];
    }
}