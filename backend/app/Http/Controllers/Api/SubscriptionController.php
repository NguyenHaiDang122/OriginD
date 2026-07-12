<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\SubscriptionResource;
use App\Services\SubscriptionService;
use Illuminate\Http\Request;

class SubscriptionController extends Controller
{
    public function __construct(
        private SubscriptionService $subscriptionService
    ) {
    }

    public function current(Request $request)
    {
        $subscription = $this->subscriptionService->current(
            $request->user()
        );

        return new SubscriptionResource($subscription);
    }
}