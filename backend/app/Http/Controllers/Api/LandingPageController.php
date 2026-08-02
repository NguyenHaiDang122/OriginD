<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Template;
use App\Models\LandingPage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

use App\Services\LandingPageRendererService;

class LandingPageController extends Controller
{

    public function store(Request $request, Template $template)
    {
        $request->validate([
            'title' => 'required|string',
            'data' => 'required|array',
            'slug' => 'nullable|string',
        ]);

        $user = Auth::user();
        $subscription = $user ? $user->subscription : null;
        $plan = $subscription ? $subscription->plan : null;
        
        // Kiểm tra phân quyền Template theo Gói Cước
        $templatePlans = $template->plans;
        if ($templatePlans->isNotEmpty() && (!$user->roles || !$user->roles->some('name', 'Admin')) && $user->role !== 'Admin') {
            if (!$plan) {
                return response()->json([
                    'message' => 'Mẫu giao diện này yêu cầu nâng cấp gói cước. Vui lòng nâng cấp dịch vụ để sử dụng!'
                ], 403);
            }
            if (!$templatePlans->contains('id', $plan->id)) {
                $planNames = $templatePlans->pluck('name')->join(', ');
                return response()->json([
                    'message' => 'Mẫu giao diện này chỉ dành riêng cho gói: ' . $planNames . '. Vui lòng nâng cấp dịch vụ để sử dụng!'
                ], 403);
            }
        }

        $isFreeOrStarter = !$plan || in_array(strtolower($plan->slug), ['free', 'starter']) || $plan->landing_page_limit <= 1;

        $limit = $user->getEffectiveLandingPageLimit();
        // Kiểm tra dựa trên TỔNG SỐ TRANG ĐÃ TẠO (total_pages_created), 
        // không tính theo số trang hiện có để tránh việc xóa đi tạo lại.
        if ($user->total_pages_created >= $limit) {
            return response()->json([
                'message' => 'Bạn đã đạt giới hạn tối đa '.$limit.' Landing Page cho phép của tài khoản. Vui lòng gia hạn hoặc nâng cấp dịch vụ để tạo thêm!'
            ], 403);
        }

        if ($user && ($user->role === 'Admin' || ($user->roles && $user->roles->some('name', 'Admin')))) {
            $expiresAt = null;
        } else {
            $expiresAt = now()->addDays(30);
        }

        if ($request->filled('slug')) {
            $slug = Str::slug($request->slug);
            if (empty($slug)) {
                $slug = Str::slug($request->title).'-'.uniqid();
            } else {
                if (LandingPage::where('slug', $slug)->exists()) {
                    return response()->json([
                        'message' => 'Đường dẫn (slug) "'.$slug.'" đã được sử dụng, vui lòng chọn tên khác!'
                    ], 422);
                }
            }
        } else {
            $slug = Str::slug($request->title).'-'.uniqid();
        }

        $page = LandingPage::create([
            'user_id' => $user->id,
            'template_id' => $template->id,
            'title' => $request->title,
            'slug' => $slug,
            'data' => $request->data,
            'status' => 'draft',
            'expires_at' => $expiresAt,
        ]);

        // Tăng bộ đếm tổng số trang đã tạo của user
        $user->increment('total_pages_created');

        // Build Cache for the newly created page if it's published right away (usually draft, but just in case)
        if ($page->status === 'published') {
            \Illuminate\Support\Facades\Cache::forget(\App\Support\LandingPageCacheKey::fresh($page->id));
            if (\Illuminate\Support\Facades\Cache::add(\App\Support\LandingPageCacheKey::rebuilding($page->id), true, 60)) {
                dispatch(new \App\Jobs\BuildLandingPageCacheJob($page->id));
            }
        }

        return response()->json([
            'message' => 'Tạo Landing Page thành công',
            'data' => $page
        ], 201);
    }
    public function render(
        LandingPage $landingPage,
        LandingPageRendererService $renderer
    ){
        $result = $renderer->getOrBuildHtml($landingPage);

        if ($result->isStale) {
            // Anti Queue-Storm: Only one job per 60 seconds for rebuilding
            if (\Illuminate\Support\Facades\Cache::add(\App\Support\LandingPageCacheKey::rebuilding($landingPage->id), true, 60)) {
                dispatch(new \App\Jobs\BuildLandingPageCacheJob($landingPage->id));
            }
        }

        return response($result->html)->header('Content-Type', 'text/html');
    }

    public function index(Request $request)
    {
        $pages = LandingPage::where('user_id', Auth::id())
            ->with('template')
            ->orderBy('id', 'desc')
            ->get();

        return response()->json([
            'data' => $pages
        ]);
    }

    public function show(LandingPage $landingPage)
    {
        if ($landingPage->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json([
            'data' => $landingPage->load('template.fields')
        ]);
    }

    public function update(Request $request, LandingPage $landingPage)
    {
        if ($landingPage->user_id !== Auth::id() && Auth::user()->role !== 'Admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($landingPage->isExpired() && Auth::user()->role !== 'Admin') {
            return response()->json([
                'message' => 'Trang Landing Page này đã hết hạn lưu trữ. Vui lòng gia hạn dịch vụ trước khi tiếp tục chỉnh sửa!'
            ], 403);
        }

        $request->validate([
            'title' => 'nullable|string',
            'data' => 'nullable|array',
            'status' => 'nullable|string',
            'slug' => 'nullable|string',
        ]);

        if ($request->has('title') && !empty($request->title)) {
            $landingPage->title = $request->title;
        }
        if ($request->filled('slug')) {
            $newSlug = Str::slug($request->slug);
            if (!empty($newSlug) && $newSlug !== $landingPage->slug) {
                if (LandingPage::where('slug', $newSlug)->where('id', '!=', $landingPage->id)->exists()) {
                    return response()->json([
                        'message' => 'Đường dẫn (slug) "'.$newSlug.'" đã được sử dụng, vui lòng chọn tên khác!'
                    ], 422);
                }
                $landingPage->slug = $newSlug;
            }
        }
        if ($request->has('data')) {
            $landingPage->data = $request->data;
        }
        if ($request->has('status') && in_array($request->status, ['draft', 'published'])) {
            $landingPage->status = $request->status;
        }

        $landingPage->save();

        if ($landingPage->status === 'published') {
            // Force cache expiration so next request sees new data or triggers build
            \Illuminate\Support\Facades\Cache::forget(\App\Support\LandingPageCacheKey::fresh($landingPage->id));
            
            // Queue rebuild in background to warm cache
            if (\Illuminate\Support\Facades\Cache::add(\App\Support\LandingPageCacheKey::rebuilding($landingPage->id), true, 60)) {
                dispatch(new \App\Jobs\BuildLandingPageCacheJob($landingPage->id));
            }
        }

        return response()->json([
            'message' => 'Cập nhật Landing Page thành công',
            'data' => $landingPage->load('template.fields')
        ]);
    }

    public function destroy(LandingPage $landingPage)
    {
        if ($landingPage->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $landingPage->delete();

        return response()->json([
            'message' => 'Xóa Landing Page thành công'
        ]);
    }
}