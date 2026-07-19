<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Setting;
use Illuminate\Support\Facades\Auth;

class SettingController extends Controller
{
    public function getSupportSettings()
    {
        $setting = Setting::firstOrCreate(
            ['key' => 'support_settings'],
            ['value' => [
                'zalo' => 'https://zalo.me/0866984097',
                'facebook' => '#',
                'email' => 'support@origind.id.vn',
                'videos' => [
                    [
                        'id' => 1,
                        'title' => 'Cách tạo Landing Page đầu tiên',
                        'description' => 'Video cơ bản cho người mới bắt đầu sử dụng hệ thống.',
                        'link' => '#'
                    ],
                    [
                        'id' => 2,
                        'title' => 'Trỏ tên miền riêng chi tiết',
                        'description' => 'Hướng dẫn cấu hình DNS, kết nối domain siêu tốc.',
                        'link' => '#'
                    ]
                ]
            ]]
        );

        return response()->json([
            'data' => $setting->value
        ]);
    }

    public function updateSupportSettings(Request $request)
    {
        $user = Auth::user();
        if (!$user || ($user->role !== 'Admin' && (!$user->roles || !$user->roles->some('name', 'Admin')))) {
            return response()->json(['message' => 'Không có quyền truy cập.'], 403);
        }

        $request->validate([
            'zalo' => 'nullable|string',
            'facebook' => 'nullable|string',
            'email' => 'nullable|string',
            'videos' => 'nullable|array',
        ]);

        $setting = Setting::firstOrCreate(['key' => 'support_settings']);
        
        $currentValue = $setting->value ?? [];
        $newValue = array_merge($currentValue, $request->only(['zalo', 'facebook', 'email', 'videos']));
        
        $setting->value = $newValue;
        $setting->save();

        return response()->json([
            'message' => 'Cập nhật cấu hình hỗ trợ thành công',
            'data' => $setting->value
        ]);
    }
    public function getPopupSettings()
    {
        $setting = Setting::firstOrCreate(
            ['key' => 'popup_settings'],
            ['value' => [
                'isActive' => false,
                'title' => 'Thông báo',
                'content' => 'Nội dung thông báo mới nhất từ hệ thống.',
                'hideDurationHours' => 1
            ]]
        );

        return response()->json([
            'data' => $setting->value
        ]);
    }

    public function updatePopupSettings(Request $request)
    {
        $user = Auth::user();
        if (!$user || ($user->role !== 'Admin' && (!$user->roles || !$user->roles->some('name', 'Admin')))) {
            return response()->json(['message' => 'Không có quyền truy cập.'], 403);
        }

        $request->validate([
            'isActive' => 'required|boolean',
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'hideDurationHours' => 'required|numeric|min:0'
        ]);

        $setting = Setting::firstOrCreate(['key' => 'popup_settings']);
        
        $setting->value = [
            'isActive' => filter_var($request->isActive, FILTER_VALIDATE_BOOLEAN),
            'title' => $request->title,
            'content' => $request->content,
            'hideDurationHours' => (float) $request->hideDurationHours
        ];
        
        $setting->save();

        return response()->json([
            'message' => 'Cập nhật bảng thông báo thành công',
            'data' => $setting->value
        ]);
    }
}
