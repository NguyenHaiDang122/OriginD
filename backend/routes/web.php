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
        body { background: #0f172a; color: #f8fafc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; }
        .box { background: #1e293b; padding: 40px; border-radius: 24px; border: 1px solid #334155; max-width: 480px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); }
        h1 { font-size: 22px; color: #facc15; margin: 12px 0 10px; }
        p { color: #94a3b8; font-size: 14.5px; line-height: 1.6; margin: 0; }
        .badge { display: inline-block; background: rgba(250, 204, 21, 0.15); border: 1px solid rgba(250, 204, 21, 0.4); color: #facc15; padding: 4px 14px; border-radius: 999px; font-size: 11px; font-weight: bold; letter-spacing: 0.5px; }
    </style>
</head>
<body>
    <div class="box">
        <div class="badge">📝 DRAFT (BẢN NHÁP)</div>
        <h1>Không có quyền truy cập</h1>
        <p>Trang Landing Page này hiện đang được chủ sở hữu thử nghiệm ở trạng thái <b>Bản nháp (Draft)</b> và chưa được xuất bản công khai.<br><br>Chỉ chủ sở hữu trang mới có quyền xem trước.</p>
    </div>
</body>
</html>
HTML;
            return response($htmlForbidden, 403)->header('Content-Type', 'text/html');
        }
    }

    return response(
        $renderer->render($page)
    )->header(
        'Content-Type',
        'text/html'
    );
});

