<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BuilderSite;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class BuilderSiteController extends Controller
{
    /**
     * Get default starter elements for a new website
     */
    private function getDefaultStarterData(): array
    {
        return [
            [
                'id' => 'section-header-' . Str::random(8),
                'type' => 'header',
                'name' => 'Thanh điều hướng (Header)',
                'props' => [
                    'logoText' => 'OriginD Builder',
                    'logoImage' => '',
                    'links' => [
                        ['label' => 'Trang chủ', 'url' => '#'],
                        ['label' => 'Tính năng', 'url' => '#features'],
                        ['label' => 'Bảng giá', 'url' => '#pricing'],
                        ['label' => 'Liên hệ', 'url' => '#contact'],
                    ],
                    'ctaText' => 'Bắt đầu ngay',
                    'ctaUrl' => '#contact',
                ],
                'styles' => [
                    'width' => '100%',
                    'backgroundColor' => '#0f172a',
                    'paddingTop' => '16px',
                    'paddingBottom' => '16px',
                    'paddingLeft' => '32px',
                    'paddingRight' => '32px',
                    'borderWidth' => '1px',
                    'borderStyle' => 'solid',
                    'borderColor' => 'rgba(255, 255, 255, 0.1)',
                ],
            ],
            [
                'id' => 'section-banner-' . Str::random(8),
                'type' => 'banner',
                'name' => 'Banner Giới thiệu',
                'props' => [
                    'title' => 'Xây Dựng Website Đẳng Cấp Không Cần Lập Trình',
                    'subtitle' => 'Kéo thả trực quan, tối ưu tốc độ tải trang cực nhanh và tương thích hoàn hảo trên mọi thiết bị di động.',
                    'buttonText' => 'Khám Phá Tính Năng',
                    'buttonUrl' => '#features',
                    'badge' => '⚡ Nền tảng Website Builder 2026',
                ],
                'styles' => [
                    'width' => '100%',
                    'minHeight' => '440px',
                    'backgroundColor' => '#1e1b4b',
                    'backgroundImage' => 'radial-gradient(ellipse at top, #4338ca 0%, #0f172a 100%)',
                    'paddingTop' => '80px',
                    'paddingBottom' => '80px',
                    'paddingLeft' => '24px',
                    'paddingRight' => '24px',
                    'textAlign' => 'center',
                ],
            ],
            [
                'id' => 'section-content-' . Str::random(8),
                'type' => 'section',
                'name' => 'Section Tính Năng',
                'props' => [
                    'fullWidth' => true,
                ],
                'styles' => [
                    'width' => '100%',
                    'backgroundColor' => '#090d16',
                    'paddingTop' => '64px',
                    'paddingBottom' => '64px',
                    'paddingLeft' => '24px',
                    'paddingRight' => '24px',
                ],
                'children' => [
                    [
                        'id' => 'container-features-' . Str::random(8),
                        'type' => 'container',
                        'name' => 'Container Khối Chứa',
                        'props' => [
                            'maxWidth' => '1100px',
                        ],
                        'styles' => [
                            'width' => '100%',
                            'maxWidth' => '1100px',
                            'marginLeft' => 'auto',
                            'marginRight' => 'auto',
                            'display' => 'flex',
                            'flexDirection' => 'column',
                            'alignItems' => 'center',
                            'gap' => '20px',
                        ],
                        'children' => [
                            [
                                'id' => 'heading-feat-' . Str::random(8),
                                'type' => 'heading',
                                'name' => 'Tiêu đề Tính năng',
                                'props' => [
                                    'content' => 'Vì Sao Khách Hàng Lựa Chọn Chúng Tôi?',
                                    'level' => 'h2',
                                ],
                                'styles' => [
                                    'fontSize' => '32px',
                                    'fontWeight' => 'bold',
                                    'color' => '#ffffff',
                                    'textAlign' => 'center',
                                    'marginBottom' => '4px',
                                ],
                            ],
                            [
                                'id' => 'text-feat-' . Str::random(8),
                                'type' => 'text',
                                'name' => 'Mô tả tính năng',
                                'props' => [
                                    'content' => 'Trải nghiệm kéo thả mượt mà với 12+ thành phần chuyên nghiệp, tự động responsive cho máy tính bảng và điện thoại di động.',
                                ],
                                'styles' => [
                                    'fontSize' => '16px',
                                    'color' => '#94a3b8',
                                    'textAlign' => 'center',
                                    'maxWidth' => '650px',
                                    'lineHeight' => '1.6',
                                    'marginBottom' => '24px',
                                ],
                            ],
                            [
                                'id' => 'divider-feat-' . Str::random(8),
                                'type' => 'divider',
                                'name' => 'Đường phân cách',
                                'props' => ['style' => 'solid'],
                                'styles' => [
                                    'width' => '100%',
                                    'height' => '1px',
                                    'backgroundColor' => 'rgba(255, 255, 255, 0.1)',
                                    'marginTop' => '12px',
                                    'marginBottom' => '24px',
                                ],
                            ],
                            [
                                'id' => 'btn-cta-' . Str::random(8),
                                'type' => 'button',
                                'name' => 'Nút Kêu Gọi Hành Động',
                                'props' => [
                                    'text' => 'Bắt Đầu Thiết Kế Ngay',
                                    'url' => '#',
                                    'target' => '_self',
                                    'icon' => 'Sparkles',
                                ],
                                'styles' => [
                                    'backgroundColor' => '#6366f1',
                                    'color' => '#ffffff',
                                    'fontSize' => '16px',
                                    'fontWeight' => '600',
                                    'paddingTop' => '14px',
                                    'paddingBottom' => '14px',
                                    'paddingLeft' => '32px',
                                    'paddingRight' => '32px',
                                    'borderRadius' => '12px',
                                    'borderStyle' => 'none',
                                    'boxShadow' => '0 10px 25px -5px rgba(99, 102, 241, 0.4)',
                                ],
                            ],
                        ],
                    ],
                ],
            ],
            [
                'id' => 'section-footer-' . Str::random(8),
                'type' => 'footer',
                'name' => 'Chân trang (Footer)',
                'props' => [
                    'copyright' => '© 2026 OriginD. Tất cả các quyền được bảo lưu.',
                    'description' => 'Nền tảng kiến tạo website trực quan số 1 - Sáng tạo không giới hạn.',
                    'columns' => [
                        [
                            'title' => 'Sản phẩm',
                            'links' => [
                                ['label' => 'Mẫu giao diện', 'url' => '#'],
                                ['label' => 'Tính năng kéo thả', 'url' => '#'],
                                ['label' => 'Tên miền riêng', 'url' => '#'],
                            ],
                        ],
                        [
                            'title' => 'Hỗ trợ',
                            'links' => [
                                ['label' => 'Hướng dẫn sử dụng', 'url' => '#'],
                                ['label' => 'Hỏi đáp (FAQ)', 'url' => '#'],
                                ['label' => 'Liên hệ hỗ trợ', 'url' => '#'],
                            ],
                        ],
                    ],
                ],
                'styles' => [
                    'width' => '100%',
                    'backgroundColor' => '#050811',
                    'paddingTop' => '48px',
                    'paddingBottom' => '32px',
                    'paddingLeft' => '32px',
                    'paddingRight' => '32px',
                    'borderWidth' => '1px',
                    'borderStyle' => 'solid',
                    'borderColor' => 'rgba(255, 255, 255, 0.08)',
                ],
            ],
        ];
    }

    /**
     * List current user's builder sites
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $query = BuilderSite::where('user_id', $user->id);

        if ($request->has('search')) {
            $search = $request->get('search');
            $query->where('title', 'like', "%{$search}%");
        }

        $sites = $query->orderBy('updated_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $sites,
        ]);
    }

    /**
     * Create a new website
     */
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255',
            'data' => 'nullable|array',
            'settings' => 'nullable|array',
        ]);

        $user = Auth::user();

        // Generate clean unique slug
        $baseSlug = $request->filled('slug')
            ? Str::slug($request->slug)
            : Str::slug($request->title);

        if (empty($baseSlug)) {
            $baseSlug = 'website-' . Str::random(6);
        }

        $slug = $baseSlug;
        $counter = 1;
        while (BuilderSite::where('slug', $slug)->exists()) {
            $slug = "{$baseSlug}-" . Str::random(5);
            $counter++;
            if ($counter > 5) {
                $slug = "{$baseSlug}-" . time();
                break;
            }
        }

        $elements = $request->input('data');
        if (empty($elements) || !is_array($elements)) {
            $elements = $this->getDefaultStarterData();
        }

        $site = BuilderSite::create([
            'user_id' => $user->id,
            'title' => $request->title,
            'slug' => $slug,
            'data' => $elements,
            'settings' => $request->input('settings') ?? [
                'metaTitle' => $request->title,
                'metaDescription' => 'Website được thiết kế bởi OriginD Website Builder',
                'fontFamily' => 'Inter, sans-serif',
                'backgroundColor' => '#090d16',
            ],
            'status' => 'draft',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Tạo website mới thành công',
            'data' => $site,
        ], 201);
    }

    /**
     * Get website detail for builder
     */
    public function show($id)
    {
        $site = BuilderSite::findOrFail($id);

        if ($site->user_id !== Auth::id() && Auth::user()->role !== 'Admin') {
            return response()->json([
                'success' => false,
                'message' => 'Bạn không có quyền chỉnh sửa website này'
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $site,
        ]);
    }

    /**
     * Update website data, title, settings, or status
     */
    public function update(Request $request, $id)
    {
        $site = BuilderSite::findOrFail($id);

        if ($site->user_id !== Auth::id() && Auth::user()->role !== 'Admin') {
            return response()->json([
                'success' => false,
                'message' => 'Bạn không có quyền chỉnh sửa website này'
            ], 403);
        }

        $request->validate([
            'title' => 'nullable|string|max:255',
            'slug' => 'nullable|string|max:255',
            'data' => 'nullable|array',
            'settings' => 'nullable|array',
            'status' => 'nullable|in:draft,published',
            'thumbnail' => 'nullable|string',
        ]);

        if ($request->has('title') && !empty($request->title)) {
            $site->title = $request->title;
        }

        if ($request->filled('slug')) {
            $newSlug = Str::slug($request->slug);
            if (!empty($newSlug) && $newSlug !== $site->slug) {
                if (BuilderSite::where('slug', $newSlug)->where('id', '!=', $site->id)->exists()) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Đường dẫn (slug) "' . $newSlug . '" đã được sử dụng. Vui lòng chọn tên khác!',
                    ], 422);
                }
                $site->slug = $newSlug;
            }
        }

        if ($request->has('data')) {
            $site->data = $request->data;
        }

        if ($request->has('settings')) {
            $site->settings = $request->settings;
        }

        if ($request->has('thumbnail')) {
            $site->thumbnail = $request->thumbnail;
        }

        if ($request->has('status')) {
            $site->status = $request->status;
            if ($request->status === 'published' && !$site->published_at) {
                $site->published_at = now();
            }
        }

        $site->save();

        return response()->json([
            'success' => true,
            'message' => 'Lưu thiết kế thành công',
            'data' => $site,
        ]);
    }

    /**
     * Delete website
     */
    public function destroy($id)
    {
        $site = BuilderSite::findOrFail($id);

        if ($site->user_id !== Auth::id() && Auth::user()->role !== 'Admin') {
            return response()->json([
                'success' => false,
                'message' => 'Bạn không có quyền xóa website này'
            ], 403);
        }

        $site->delete();

        return response()->json([
            'success' => true,
            'message' => 'Xóa website thành công',
        ]);
    }

    /**
     * Publish website
     */
    public function publish(Request $request, $id)
    {
        $site = BuilderSite::findOrFail($id);

        if ($site->user_id !== Auth::id() && Auth::user()->role !== 'Admin') {
            return response()->json([
                'success' => false,
                'message' => 'Bạn không có quyền xuất bản website này'
            ], 403);
        }

        if ($request->filled('slug')) {
            $newSlug = Str::slug($request->slug);
            if (!empty($newSlug) && $newSlug !== $site->slug) {
                if (BuilderSite::where('slug', $newSlug)->where('id', '!=', $site->id)->exists()) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Đường dẫn (slug) "' . $newSlug . '" đã tồn tại. Vui lòng chọn đường dẫn khác!',
                    ], 422);
                }
                $site->slug = $newSlug;
            }
        }

        if ($request->has('data')) {
            $site->data = $request->data;
        }

        $site->status = 'published';
        $site->published_at = now();
        $site->save();

        return response()->json([
            'success' => true,
            'message' => 'Xuất bản website thành công!',
            'data' => $site,
        ]);
    }

    /**
     * Unpublish website
     */
    public function unpublish($id)
    {
        $site = BuilderSite::findOrFail($id);

        if ($site->user_id !== Auth::id() && Auth::user()->role !== 'Admin') {
            return response()->json([
                'success' => false,
                'message' => 'Bạn không có quyền thay đổi website này'
            ], 403);
        }

        $site->status = 'draft';
        $site->save();

        return response()->json([
            'success' => true,
            'message' => 'Đã chuyển website về bản nháp',
            'data' => $site,
        ]);
    }

    /**
     * Duplicate website
     */
    public function duplicate($id)
    {
        $site = BuilderSite::findOrFail($id);

        if ($site->user_id !== Auth::id() && Auth::user()->role !== 'Admin') {
            return response()->json([
                'success' => false,
                'message' => 'Bạn không có quyền nhân bản website này'
            ], 403);
        }

        $newSlug = $site->slug . '-copy-' . Str::random(4);
        while (BuilderSite::where('slug', $newSlug)->exists()) {
            $newSlug = $site->slug . '-copy-' . Str::random(6);
        }

        $copy = BuilderSite::create([
            'user_id' => Auth::id(),
            'title' => $site->title . ' (Bản sao)',
            'slug' => $newSlug,
            'data' => $site->data,
            'settings' => $site->settings,
            'status' => 'draft',
            'thumbnail' => $site->thumbnail,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Nhân bản website thành công',
            'data' => $copy,
        ], 201);
    }

    /**
     * Public show published website (no authentication required)
     */
    public function publicShow($slug)
    {
        $site = BuilderSite::where('slug', $slug)->first();

        if (!$site) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy trang web hoặc đường dẫn không tồn tại',
            ], 404);
        }

        // If not published, check if viewer is owner with sanctum token
        if ($site->status !== 'published') {
            $user = auth('sanctum')->user();
            if (!$user) {
                $token = request()->cookie('auth_token') ?? request()->header('Authorization');
                if ($token) {
                    $tokenClean = str_replace('Bearer ', '', $token);
                    $accessToken = \Laravel\Sanctum\PersonalAccessToken::findToken($tokenClean);
                    if ($accessToken) {
                        $user = $accessToken->tokenable;
                    }
                }
            }

            if (!$user || ($user->id !== $site->user_id && $user->role !== 'Admin')) {
                return response()->json([
                    'success' => false,
                    'status' => 'draft',
                    'message' => 'Trang web này đang ở trạng thái Bản nháp (Draft) và chưa được xuất bản công khai.',
                ], 403);
            }
        }

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $site->id,
                'title' => $site->title,
                'slug' => $site->slug,
                'data' => $site->data,
                'settings' => $site->settings,
                'status' => $site->status,
                'published_at' => $site->published_at,
                'created_at' => $site->created_at,
                'updated_at' => $site->updated_at,
                'author' => [
                    'name' => $site->user ? $site->user->name : 'OriginD Creator',
                ],
            ],
        ]);
    }
}
