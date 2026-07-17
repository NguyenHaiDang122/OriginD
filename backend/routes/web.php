<?php

use Illuminate\Support\Facades\Route;
use App\Models\LandingPage;
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

        if (!$user && request()->has('token')) {
            $accessToken = \Laravel\Sanctum\PersonalAccessToken::findToken(request()->token);
            if ($accessToken) {
                $user = $accessToken->tokenable;
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
        .icon-wrap { width: 64px; height: 64px; background: rgba(234, 179, 8, 0.12); border: 1px solid rgba(234, 179, 8, 0.25); border-radius: 20px; display: flex; align-items: center; justify-center; margin: 0 auto 20px; color: #eab308; }
        .badge { display: inline-block; background: rgba(255, 255, 255, 0.06); border: 1px solid rgba(255, 255, 255, 0.1); color: #e2e8f0; padding: 4px 12px; border-radius: 8px; font-size: 11px; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 16px; }
        h1 { font-size: 20px; font-weight: 700; margin: 0 0 12px; color: #ffffff; line-height: 1.4; }
        p { font-size: 14px; line-height: 1.65; color: #94a3b8; margin: 0; }
    </style>
</head>
<body>
    <div class="bg-glow"></div>
    <div class="card">
        <div class="icon-wrap">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
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

    if ($page->isExpired()) {
        return response($renderer->renderExpiredPage($page), 403)->header('Content-Type', 'text/html');
    }

    return response(
        $renderer->render($page)
    )->header(
        'Content-Type',
        'text/html'
    );
});

// Fallback redirect for SePay return URLs when redirecting to backend origin instead of frontend SPA
Route::get('/profile', function (\Illuminate\Http\Request $request) {
    $frontendUrl = rtrim(env('FRONTEND_URL', 'http://localhost:5173'), '/');
    $query = $request->getQueryString();
    return redirect()->to($frontendUrl . '/profile' . ($query ? '?' . $query : ''));
});

