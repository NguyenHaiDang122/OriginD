<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CustomDomain;
use App\Models\LandingPage;
use Illuminate\Http\Request;

class AdminCustomDomainController extends Controller
{
    public function index()
    {
        $domains = CustomDomain::with(['landingPage.user'])->latest()->get();
        return response()->json([
            'data' => $domains
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'landing_page' => 'required|string',
            'domain' => 'required|string',
        ]);

        $inputPage = trim($request->input('landing_page'));
        // Extract slug if user enters full URL like http://localhost:5173/page/slug-abc or /page/slug-abc
        $slug = preg_replace('#^.*?/page/([^/?#]+).*$#i', '$1', $inputPage);
        $slug = trim($slug, '/');

        $landingPage = LandingPage::where('slug', $slug)
            ->orWhere('id', $inputPage)
            ->first();

        if (!$landingPage) {
            return response()->json([
                'message' => 'Không tìm thấy Landing Page với link hoặc slug: "' . $inputPage . '"'
            ], 422);
        }

        // Clean up domain input (remove http://, https://, trailing slash, and leading www.)
        $domain = preg_replace('/^https?:\/\//i', '', trim($request->input('domain')));
        $domain = rtrim($domain, '/');
        $domain = preg_replace('/^www\./i', '', $domain);

        if (empty($domain)) {
            return response()->json([
                'message' => 'Tên miền không hợp lệ.'
            ], 422);
        }

        $existing = CustomDomain::where('domain', $domain)->first();
        if ($existing && $existing->landing_page_id !== $landingPage->id) {
            // Update to new landing page
            $existing->landing_page_id = $landingPage->id;
            $existing->status = 'active';
            $existing->save();
            $customDomain = $existing;
        } elseif ($existing) {
            $customDomain = $existing;
        } else {
            $customDomain = CustomDomain::create([
                'landing_page_id' => $landingPage->id,
                'domain' => $domain,
                'status' => 'active'
            ]);
        }

        return response()->json([
            'message' => 'Kết nối Domain "' . $domain . '" với Landing Page "' . $landingPage->title . '" thành công!',
            'data' => $customDomain->load(['landingPage.user'])
        ], 201);
    }

    public function destroy($id)
    {
        $domain = CustomDomain::findOrFail($id);
        $domainName = $domain->domain;
        $domain->delete();

        return response()->json([
            'message' => 'Đã hủy kết nối tên miền "' . $domainName . '".'
        ]);
    }
}
