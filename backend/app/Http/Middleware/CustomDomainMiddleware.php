<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\CustomDomain;
use App\Services\LandingPageRendererService;

class CustomDomainMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        $host = preg_replace('/^www\./i', '', preg_replace('/:\d+$/', '', $request->getHost()));
        $host = strtolower(trim($host));

        // Define main system hosts where OriginD SPA / Admin operates
        $mainHosts = ['origind.id.vn', 'localhost', '127.0.0.1', '::1'];
        $appHost = preg_replace('/^www\./i', '', preg_replace('/:\d+$/', '', parse_url(config('app.url'), PHP_URL_HOST) ?: ''));
        if ($appHost && !in_array(strtolower($appHost), $mainHosts)) {
            $mainHosts[] = strtolower($appHost);
        }

        // If request is on a main host, proceed normally
        if (in_array($host, $mainHosts)) {
            return $next($request);
        }

        // Otherwise, this request is on a Custom Domain! Check custom_domains table
        $customDomain = CustomDomain::where(function ($query) use ($host) {
            $query->where('domain', $host)
                  ->orWhere('domain', 'www.' . $host);
        })->where('status', 'active')->first();

        if ($customDomain && $customDomain->landingPage) {
            $page = $customDomain->landingPage;
            
            if ($page->status === 'deleted') {
                return response('<h1>Trang đã bị xóa</h1>', 404)->header('Content-Type', 'text/html');
            }

            $renderer = app(LandingPageRendererService::class);
            
            if ($page->isExpired()) {
                return response($renderer->renderExpiredPage($page), 403)->header('Content-Type', 'text/html');
            }

            $result = $renderer->getOrBuildHtml($page);
            
            if ($result->isStale) {
                if (\Illuminate\Support\Facades\Cache::add(\App\Support\LandingPageCacheKey::rebuilding($page->id), true, 60)) {
                    dispatch(new \App\Jobs\BuildLandingPageCacheJob($page->id));
                }
            }

            return response($result->html)->header('Content-Type', 'text/html');
        }

        // Custom domain not connected or not configured
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
    }
}
