<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ImageUploadController extends Controller
{
    public function upload(Request $request)
    {
        // 1. Kiểm tra request
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:10240', // Tối đa 10MB
        ], [
            'image.required' => 'Vui lòng chọn ảnh để tải lên.',
            'image.image' => 'File tải lên phải là hình ảnh.',
            'image.mimes' => 'Định dạng ảnh không hỗ trợ. Chỉ hỗ trợ jpeg, png, jpg, gif, webp.',
            'image.max' => 'Ảnh tải lên vượt quá dung lượng cho phép (tối đa 10MB).',
        ]);

        try {
            $apiKey = config('services.imgbb.api_key');
            
            if (empty($apiKey)) {
                Log::error('ImgBB API Key is missing.');
                return response()->json([
                    'message' => 'Lỗi cấu hình hệ thống (Thiếu API Key). Vui lòng báo cho Admin.'
                ], 500);
            }

            $imageFile = $request->file('image');
            
            // 2. Gửi request lên ImgBB dưới dạng Multipart form-data
            $response = Http::timeout(20)
                ->attach(
                    'image', 
                    file_get_contents($imageFile->path()), 
                    $imageFile->getClientOriginalName()
                )
                ->post('https://api.imgbb.com/1/upload?key=' . $apiKey);

            // 3. Xử lý kết quả trả về
            if ($response->successful()) {
                $data = $response->json();
                
                if (isset($data['success']) && $data['success'] === true && isset($data['data']['url'])) {
                    return response()->json([
                        'success' => true,
                        'url' => $data['data']['url']
                    ]);
                }
            }

            // Ghi log chi tiết nếu ImgBB trả về lỗi nhưng không sập (HTTP 200 nhưng json lỗi hoặc HTTP 400)
            Log::error('ImgBB Upload Failed', ['response' => $response->json(), 'status' => $response->status()]);
            
            // Phân loại lỗi từ ImgBB trả về
            $errorMessage = 'Hệ thống lưu trữ ảnh đang gặp sự cố, vui lòng thử lại sau.';
            if ($response->status() === 400) {
                $errorData = $response->json('error.message');
                if ($errorData && str_contains(strtolower($errorData), 'invalid api key')) {
                    $errorMessage = 'Lỗi cấu hình hệ thống (Sai API Key). Vui lòng báo cho Admin.';
                } else if ($errorData && str_contains(strtolower($errorData), 'file size')) {
                    $errorMessage = 'Ảnh tải lên bị ImgBB từ chối do vượt quá kích thước hoặc định dạng lỗi.';
                }
            }
            
            return response()->json([
                'message' => $errorMessage
            ], 500);

        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            // Bắt lỗi Timeout
            Log::error('ImgBB Upload Timeout/Connection Error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Kết nối đến máy chủ lưu trữ ảnh quá hạn. Vui lòng thử lại.'
            ], 504);
            
        } catch (\Exception $e) {
            // Bắt các lỗi khác (ví dụ lỗi đọc file, hết ram...)
            Log::error('ImgBB Upload Exception: ' . $e->getMessage());
            return response()->json([
                'message' => 'Đã xảy ra lỗi không xác định khi xử lý ảnh.'
            ], 500);
        }
    }
}
