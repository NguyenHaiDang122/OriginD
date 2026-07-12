<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SubscriptionResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'started_at' => $this->started_at,
            'expired_at' => $this->expired_at,

            'plan' => [
                'id' => $this->plan->id,
                'name' => $this->plan->name,
                'slug' => $this->plan->slug,
                'price' => $this->plan->price,
                'landing_page_limit' => $this->plan->landing_page_limit,
                'custom_domain' => (bool) $this->plan->custom_domain,
                'premium_templates' => (bool) $this->plan->premium_templates,
            ],
        ];
    }
}