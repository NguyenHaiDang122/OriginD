<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use App\Models\LandingPage;
use App\Models\CustomDomain;
use App\Services\LandingPageRendererService;

Route::get('/page/{slug}', function (
    $slug,
    LandingPageRendererService $renderer
) {
    $page = LandingPage::where('slug', $slug)
        ->where('status', '!=', 'deleted')
        ->firstOrFail();

    if ($page->status === 'draft') {
        $user = auth('sanctum')->user();

        if (!$user) {
            $token = request()->cookie('auth_token') ?? request()->token;
            if ($token) {
                $accessToken = \Laravel\Sanctum\PersonalAccessToken::findToken($token);
                if ($accessToken) {
                    $user = $accessToken->tokenable;
                }
            }
        }

        if (!$user || $page->user_id !== $user->id) {
            $htmlForbidden = <<<HTML
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Trang đang ở trạng thái Bản nháp (Draft)</title>
    <style>
        * { box-sizing: border-box; }
        body { margin: 0; padding: 20px; background: #090d16; color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; text-align: center; }
        .bg-glow { position: fixed; width: 500px; height: 500px; background: radial-gradient(circle, rgba(234,179,8,0.12) 0%, rgba(139,92,246,0.06) 50%, transparent 70%); top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 0; pointer-events: none; }
        .card { position: relative; z-index: 1; background: #111827; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 24px; padding: 44px 36px; width: 100%; max-width: 460px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.6); }
        .icon-wrap { width: 64px; height: 64px; background: rgba(239, 68, 68, 0.12); border: 1px solid rgba(239, 68, 68, 0.25); border-radius: 20px; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; color: #ef4444; }
        .badge { display: inline-block; background: rgba(255, 255, 255, 0.06); border: 1px solid rgba(255, 255, 255, 0.1); color: #e2e8f0; padding: 4px 12px; border-radius: 8px; font-size: 11px; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 16px; }
        h1 { font-size: 20px; font-weight: 700; margin: 0 0 12px; color: #ffffff; line-height: 1.4; }
        p { font-size: 14px; line-height: 1.65; color: #94a3b8; margin: 0; }
    </style>
</head>
<body>
    <div class="bg-glow"></div>
    <div class="card">
        <div class="icon-wrap">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
        </div>
        <div class="badge">Bản nháp (Draft)</div>
        <h1>Không có quyền truy cập</h1>
        <p>Trang Landing Page này hiện đang được thử nghiệm ở trạng thái <b>Bản nháp</b> và chưa xuất bản công khai.<br><br>Chỉ chủ sở hữu trang mới có quyền xem trước.</p>
    </div>
</body>
</html>
HTML;
            return response($htmlForbidden, 403)->header('Content-Type', 'text/html');
        }
    }

    $result = $renderer->getOrBuildHtml($page);
    
    if ($result->isStale) {
        if (\Illuminate\Support\Facades\Cache::add(\App\Support\LandingPageCacheKey::rebuilding($page->id), true, 60)) {
            dispatch(new \App\Jobs\BuildLandingPageCacheJob($page->id));
        }
    }

    return response($result->html)->header('Content-Type', 'text/html');
});

// Fallback redirect for SePay return URLs when redirecting to backend origin instead of frontend SPA
Route::get('/profile', function (\Illuminate\Http\Request $request) {
    $frontendUrl = rtrim(config('app.frontend_url'), '/');
    $query = $request->getQueryString();
    return redirect()->to($frontendUrl . '/profile' . ($query ? '?' . $query : ''));
});

// Redirect for Website Builder published sites to frontend SPA
Route::get('/site/{slug}', function ($slug) {
    $frontendUrl = rtrim(config('app.frontend_url') ?: 'http://localhost:5173', '/');
    return redirect()->to($frontendUrl . '/site/' . $slug);
});

// Catch-all route for Custom Domain routing
Route::any('/{any?}', function (Request $request, LandingPageRendererService $renderer, $any = null) {
    $host = preg_replace('/^www\./i', '', preg_replace('/:\d+$/', '', $request->getHost()));
    $host = strtolower(trim($host));

    $mainHosts = ['origind.id.vn', 'localhost', '127.0.0.1', '::1'];
    $appHost = preg_replace('/^www\./i', '', preg_replace('/:\d+$/', '', parse_url(config('app.url'), PHP_URL_HOST) ?: ''));
    if ($appHost && !in_array(strtolower($appHost), $mainHosts)) {
        $mainHosts[] = strtolower($appHost);
    }

    if (in_array($host, $mainHosts)) {
        abort(404);
    }

    $customDomain = CustomDomain::where(function ($query) use ($host) {
        $query->where('domain', $host)
              ->orWhere('domain', 'www.' . $host);
    })->where('status', 'active')->first();

    if ($customDomain && $customDomain->landingPage) {
        $page = $customDomain->landingPage;
        
        if ($page->status === 'deleted') {
            return response('<h1>Trang đã bị xóa</h1>', 404)->header('Content-Type', 'text/html');
        }
        
        $result = $renderer->getOrBuildHtml($page);
        
        if ($result->isStale) {
            if (\Illuminate\Support\Facades\Cache::add(\App\Support\LandingPageCacheKey::rebuilding($page->id), true, 60)) {
                dispatch(new \App\Jobs\BuildLandingPageCacheJob($page->id));
            }
        }

        return response($result->html)->header('Content-Type', 'text/html');
    }

    $safeHost = htmlspecialchars($host, ENT_QUOTES, 'UTF-8');
    $htmlNotFound = <<<HTML
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tên miền chưa kết nối - OriginD</title>
    <style>
        body { margin: 0; padding: 20px; background: #030712; color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; text-align: center; }
        .card { background: linear-gradient(145deg, #111827 0%, #0f172a 100%); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 28px; padding: 50px 40px; width: 100%; max-width: 480px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.1); position: relative; overflow: hidden; }
        .card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 4px; background: linear-gradient(90deg, #3b82f6, #06b6d4, #3b82f6); background-size: 200% 100%; animation: gradientMove 3s linear infinite; }
        @keyframes gradientMove { 0% { background-position: 100% 0; } 100% { background-position: -100% 0; } }
        @keyframes spinGear { 100% { transform: rotate(360deg); } }
        .icon-wrap { width: 72px; height: 72px; background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.2); border-radius: 24px; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; color: #3b82f6; box-shadow: 0 0 30px rgba(59,130,246,0.15); }
        h1 { font-size: 24px; font-weight: 800; margin: 0 0 16px; color: #ffffff; letter-spacing: -0.5px; }
        p { font-size: 15px; line-height: 1.6; color: #94a3b8; margin: 0 0 16px; }
        .domain-badge { display: inline-block; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); color: #e2e8f0; padding: 6px 16px; border-radius: 10px; font-family: ui-monospace, monospace; font-size: 14px; margin: 12px 0; font-weight: 600; letter-spacing: 0.5px; }
        .highlight { color: #38bdf8; font-weight: 600; }
        .btn-group { display: flex; gap: 12px; justify-content: center; margin-top: 24px; }
        .btn-primary { display: inline-flex; align-items: center; justify-content: center; background: #ffffff; color: #0f172a; font-weight: 700; text-decoration: none; padding: 12px 24px; border-radius: 14px; font-size: 14px; transition: all 0.2s ease; box-shadow: 0 4px 14px rgba(255,255,255,0.15); }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(255,255,255,0.25); background: #f8fafc; }
        .btn-zalo { display: inline-flex; align-items: center; justify-content: center; background: #0068ff; color: #ffffff; font-weight: 700; text-decoration: none; padding: 12px 24px; border-radius: 14px; font-size: 14px; transition: all 0.2s ease; box-shadow: 0 4px 14px rgba(0,104,255,0.3); }
        .btn-zalo:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,104,255,0.4); background: #0054cc; }
    </style>
</head>
<body>
    <div class="card">
        <div class="icon-wrap">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="animation: spinGear 4s linear infinite;"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
        </div>
        <h1>Tên miền chưa kết nối</h1>
        <p>Tên miền <br><span class="domain-badge">{$safeHost}</span><br> đã được trỏ về máy chủ nhưng chưa được liên kết với trang đích.</p>
        <p>Vui lòng quay lại <span class="highlight">OriginD</span> và liên hệ Admin để được hỗ trợ. Quá trình cấu hình hoàn tất chỉ mất khoảng <strong>5 phút</strong>.</p>
        <div class="btn-group">
            <a href="https://origind.id.vn" class="btn-primary">Về OriginD</a>
            <a href="https://zalo.me/0866984097" target="_blank" class="btn-zalo">Hỗ trợ Zalo</a>
        </div>
    </div>
</body>
</html>
HTML;
    return response($htmlNotFound, 404)->header('Content-Type', 'text/html');
})->where('any', '.*');

