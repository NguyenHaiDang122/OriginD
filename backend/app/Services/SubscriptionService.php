<?php

namespace App\Services;

use App\Models\Plan;
use App\Models\Subscription;
use Carbon\Carbon;
use Exception;

class SubscriptionService
{
    public function current($user)
    {
        $subscription = $user->subscription()->with('plan')->first();

        if (!$subscription) {
            $freePlan = Plan::where('slug', 'free')->first();
            if ($freePlan) {
                $subscription = Subscription::create([
                    'user_id' => $user->id,
                    'plan_id' => $freePlan->id,
                    'started_at' => now(),
                    'expired_at' => null, // Gói tài khoản vĩnh viễn không hết hạn
                ]);
                $subscription->load('plan');
            }
        }

        return $subscription;
    }

    public function upgrade($user, $planId)
    {
        $plan = Plan::findOrFail($planId);

        if ($plan->price > 0 && $user->balance < $plan->price) {
            throw new Exception('Số dư của bạn (' . number_format($user->balance) . ' đ) không đủ để nâng cấp lên gói ' . $plan->name . ' (' . number_format($plan->price) . ' đ). Vui lòng nạp thêm tiền!');
        }

        if ($plan->price > 0) {
            $user->balance -= $plan->price;
        }

        // Cập nhật (cộng dồn) lượt tạo landing page cho user khi mua/nâng cấp gói
        if ($plan->landing_page_limit > 900000) {
            $user->landing_page_limit = 999999; // Không giới hạn
        } else {
            $currentLimit = $user->landing_page_limit ?? $user->getEffectiveLandingPageLimit();
            $user->landing_page_limit = ($currentLimit > 900000 ? 0 : $currentLimit) + (int) $plan->landing_page_limit;
        }
        $user->save();

        $subscription = $user->subscription;
        if ($subscription) {
            $subscription->plan_id = $plan->id;
            $subscription->expired_at = null; // Gói tài khoản không hết hạn
            $subscription->save();
        } else {
            $subscription = Subscription::create([
                'user_id' => $user->id,
                'plan_id' => $plan->id,
                'started_at' => now(),
                'expired_at' => null, // Gói tài khoản không hết hạn
            ]);
        }

        return $subscription->fresh()->load('plan');
    }
}