<?php

namespace App\Services;

class SubscriptionService
{
    public function current($user)
    {
        return $user->subscription()
            ->with('plan')
            ->first();
    }
}