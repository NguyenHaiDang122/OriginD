<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Cache;
use App\Models\Setting;
use Illuminate\Support\Facades\Auth;

class CheckMaintenanceMode
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // 1. Lấy trạng thái cài đặt bảo trì từ cache (hoặc database)
        $maintenanceSettings = Cache::remember('maintenance_settings', 60, function () {
            $setting = Setting::where('key', 'maintenance_settings')->first();
            return $setting ? $setting->value : [
                'maintenance_mode' => false,
                'maintenance_message' => 'Hệ thống đang được bảo trì. Vui lòng quay lại sau.',
            ];
        });

        // Nếu không bật bảo trì -> đi tiếp
        if (!isset($maintenanceSettings['maintenance_mode']) || $maintenanceSettings['maintenance_mode'] !== true) {
            return $next($request);
        }

        // 2. Các ngoại lệ được phép đi qua khi đang bảo trì:
        
        // Ngoại lệ 1: API render landing page
        if ($request->routeIs('landing-pages.render')) {
            return $next($request);
        }

        // Ngoại lệ 2: Người gọi là Admin (Kiểm tra qua Sanctum/Auth)
        // Note: Do middleware này chạy toàn cầu trên API, có thể Auth::user() chưa load hoặc load rồi.
        // Ta sử dụng optional(Auth::guard('sanctum')->user())->role
        $user = Auth::guard('sanctum')->user();
        if ($user && ($user->role === 'Admin' || ($user->roles && $user->roles->some('name', 'Admin')))) {
            return $next($request);
        }

        // Ngoại lệ 3: API login/logout (để Admin có thể đăng nhập nếu lỡ bị văng ra)
        if ($request->is('api/login') || $request->is('api/logout')) {
            return $next($request);
        }

        // 3. Nếu không thuộc các ngoại lệ trên -> Trả về lỗi 503 chuẩn JSON
        return response()->json([
            'message' => $maintenanceSettings['maintenance_message'] ?? 'Hệ thống đang được bảo trì. Vui lòng quay lại sau.',
            'maintenance' => true
        ], 503);
    }
}
