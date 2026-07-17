<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use Illuminate\Http\Request;

class PlanController extends Controller
{
    public function index()
    {
        $plans = Plan::orderBy('price', 'asc')->get();
        return response()->json([
            'data' => $plans
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:plans,slug',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'duration_days' => 'required|integer|min:1',
            'landing_page_limit' => 'required|integer|min:1',
            'custom_domain' => 'boolean',
            'premium_templates' => 'boolean',
        ]);

        $plan = Plan::create($validated);

        return response()->json([
            'message' => 'Tạo gói tài khoản mới thành công!',
            'data' => $plan
        ], 201);
    }

    public function update(Request $request, Plan $plan)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'slug' => 'sometimes|required|string|max:255|unique:plans,slug,' . $plan->id,
            'description' => 'nullable|string',
            'price' => 'sometimes|required|numeric|min:0',
            'duration_days' => 'sometimes|required|integer|min:1',
            'landing_page_limit' => 'sometimes|required|integer|min:1',
            'custom_domain' => 'boolean',
            'premium_templates' => 'boolean',
        ]);

        $plan->update($validated);

        return response()->json([
            'message' => 'Cập nhật gói tài khoản thành công!',
            'data' => $plan->fresh()
        ]);
    }

    public function destroy(Plan $plan)
    {
        if (in_array(strtolower($plan->slug), ['free', 'starter'])) {
            return response()->json([
                'message' => 'Không thể xóa gói mặc định hệ thống.'
            ], 400);
        }

        $plan->delete();

        return response()->json([
            'message' => 'Xóa gói tài khoản thành công!'
        ]);
    }
}
