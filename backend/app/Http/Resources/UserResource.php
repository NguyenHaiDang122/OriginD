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

        $limit = $this->getEffectiveLandingPageLimit();
        $count = $this->landingPages()->count();
        $canCreate = $count < $limit;
        $sub = $this->subscription ? $this->subscription->load('plan') : null;

        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'status' => $this->status ?? 'active',
            'balance' => (int) $this->balance,
            'landing_pages_count' => $count,
            'landing_page_limit' => $limit,
            'custom_landing_page_limit' => $this->landing_page_limit,
            'can_create_landing_page' => $canCreate,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'subscription' => $sub ? [
                'id' => $sub->id,
                'plan_id' => $sub->plan_id,
                'expired_at' => $sub->expired_at ? \Carbon\Carbon::parse($sub->expired_at)->format('Y-m-d H:i:s') : null,
                'plan' => $sub->plan ? [
                    'id' => $sub->plan->id,
                    'name' => $sub->plan->name,
                    'slug' => $sub->plan->slug,
                    'price' => (int) $sub->plan->price,
                    'duration_days' => (int) $sub->plan->duration_days,
                    'landing_page_limit' => (int) $sub->plan->landing_page_limit,
                ] : null,
            ] : null,

            // Keep both shapes so FE can parse easily.
            'roles' => $roles->values()->map(fn ($r) => ['name' => $r]),
            'role' => $roles->first(),
            'landing_pages' => $this->whenLoaded('landingPages', function () {
                return $this->landingPages->map(function ($lp) {
                    return [
                        'id' => $lp->id,
                        'title' => $lp->title,
                        'slug' => $lp->slug,
                        'status' => $lp->status,
                        'created_at' => $lp->created_at ? $lp->created_at->format('Y-m-d H:i:s') : null,
                        'expires_at' => $lp->expires_at ? $lp->expires_at->format('Y-m-d H:i:s') : null,
                    ];
                });
            }),
        ];
    }
}


