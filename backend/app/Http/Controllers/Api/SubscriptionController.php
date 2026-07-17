<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\SubscriptionResource;
use App\Http\Resources\UserResource;
use App\Services\SubscriptionService;
use Exception;
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

        if (!$subscription) {
            return response()->json([
                'message' => 'Chưa có gói đăng ký nào.'
            ], 404);
        }

        return new SubscriptionResource($subscription);
    }

    public function upgrade(Request $request)
    {
        $request->validate([
            'plan_id' => 'required|exists:plans,id'
        ]);

        try {
            $subscription = $this->subscriptionService->upgrade(
                $request->user(),
                $request->input('plan_id')
            );

            return response()->json([
                'message' => 'Nâng hạng gói tài khoản thành công! Bạn đã được cộng dồn thêm số lượt tạo Landing Page.',
                'data' => new SubscriptionResource($subscription),
                'balance' => $request->user()->balance,
                'user' => new UserResource($request->user()->fresh())
            ]);
        } catch (Exception $e) {
            return response()->json([
                'message' => $e->getMessage()
            ], 400);
        }
    }
}