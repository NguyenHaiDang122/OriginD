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

            return response($renderer->render($page))->header('Content-Type', 'text/html');
        }

        // Custom domain not connected or not configured
        $htmlNotFound = <<<HTML
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tên miền chưa được kết nối</title>
    <style>
        body { margin: 0; padding: 20px; background: #090d16; color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; text-align: center; }
        .card { background: #111827; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 24px; padding: 44px 36px; width: 100%; max-width: 480px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.6); }
        .icon-wrap { width: 64px; height: 64px; background: rgba(234, 179, 8, 0.12); border: 1px solid rgba(234, 179, 8, 0.25); border-radius: 20px; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; color: #eab308; }
        h1 { font-size: 20px; font-weight: 700; margin: 0 0 12px; color: #ffffff; }
        p { font-size: 14px; line-height: 1.65; color: #94a3b8; margin: 0; }
        .domain-badge { display: inline-block; background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.15); color: #f8fafc; padding: 4px 12px; border-radius: 8px; font-family: monospace; font-size: 13px; margin: 8px 0; font-weight: 600; }
    </style>
</head>
<body>
    <div class="card">
        <div class="icon-wrap">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
        </div>
        <h1>Tên miền chưa được cấu hình</h1>
        <p>Tên miền <span class="domain-badge">{$host}</span> đã được trỏ DNS về máy chủ nhưng chưa được liên kết với Landing Page nào trong hệ thống OriginD.</p>
        <p style="margin-top: 16px;">Vui lòng liên hệ Quản trị viên OriginD để tiến hành kết nối tên miền này.</p>
    </div>
</body>
</html>
HTML;
        return response($htmlNotFound, 404)->header('Content-Type', 'text/html');
    }
}
