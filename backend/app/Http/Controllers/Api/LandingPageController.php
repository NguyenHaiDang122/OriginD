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
            'user_id' => Auth::id(),
            'template_id' => $template->id,
            'title' => $request->title,
            'slug' => $slug,
            'data' => $request->data,
            'status' => 'draft',
        ]);

        return response()->json([
            'message' => 'Tạo Landing Page thành công',
            'data' => $page
        ], 201);
    }
    public function render(
        LandingPage $landingPage,
        LandingPageRendererService $renderer
    ){

        return response(
            $renderer->render($landingPage)
        )
        ->header(
            'Content-Type',
            'text/html'
        );

    }

    public function index(Request $request)
    {
        $pages = LandingPage::where('user_id', Auth::id())
            ->with('template.fields')
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
        if ($landingPage->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
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