<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TemplateFieldResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,

            'label' => $this->label,

            'key' => $this->key,

            'type' => $this->type,

            'default_value' => $this->default_value,

            'required' => $this->required,

            'sort_order' => $this->sort_order,
        ];
    }
}