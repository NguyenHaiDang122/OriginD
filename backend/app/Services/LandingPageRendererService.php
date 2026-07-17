<?php

namespace App\Services;

use App\Models\LandingPage;
use App\Models\Template;
use DOMDocument;
use DOMXPath;
use Illuminate\Support\Facades\File;

class LandingPageRendererService
{

    public function render(LandingPage $page)
    {
        if ($page->isExpired()) {
            return $this->renderExpiredPage($page);
        }
        return $this->renderPreview($page->template, $page->data ?? []);
    }

    public function renderExpiredPage(?LandingPage $page = null): string
    {
        $frontendUrl = rtrim(env('FRONTEND_URL', 'http://localhost:5173'), '/');
        $profileUrl = $frontendUrl . '/profile';

        return <<<HTML
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Website đã hết hạn dịch vụ - OriginD</title>
    <style>
        * { box-sizing: border-box; }
        body { margin: 0; padding: 20px; background: #090d16; color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; text-align: center; }
        .bg-glow { position: fixed; width: 500px; height: 500px; background: radial-gradient(circle, rgba(244,63,94,0.12) 0%, rgba(139,92,246,0.06) 50%, transparent 70%); top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 0; pointer-events: none; }
        .card { position: relative; z-index: 1; background: #111827; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 24px; padding: 44px 36px; width: 100%; max-width: 460px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.6); }
        .icon-wrap { width: 64px; height: 64px; background: rgba(244, 63, 94, 0.12); border: 1px solid rgba(244, 63, 94, 0.25); border-radius: 20px; display: flex; align-items: center; justify-center; margin: 0 auto 20px; color: #f43f5e; }
        .icon-wrap svg { display: block; margin: auto; flex-shrink: 0; }
        .badge { display: inline-block; background: rgba(255, 255, 255, 0.06); border: 1px solid rgba(255, 255, 255, 0.1); color: #e2e8f0; padding: 4px 12px; border-radius: 8px; font-size: 11px; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 16px; }
        h1 { font-size: 20px; font-weight: 700; margin: 0 0 12px; color: #ffffff; line-height: 1.4; }
        p { font-size: 14px; line-height: 1.65; color: #94a3b8; margin: 0 0 28px; }
        .btn { display: inline-flex; align-items: center; justify-content: center; width: 100%; max-width: 240px; background: #7c3aed; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 14px; padding: 12px 24px; border-radius: 12px; transition: all 0.2s ease; border: 1px solid rgba(255,255,255,0.1); }
        .btn:hover { background: #6d28d9; transform: translateY(-1px); }
    </style>
</head>
<body>
    <div class="bg-glow"></div>
    <div class="card">
        <div class="icon-wrap">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 7.5V12.5" stroke-width="2.5"></path><circle cx="12" cy="15.5" r="1" fill="currentColor" stroke="none"></circle></svg>
        </div>
        <div class="badge">Hết hạn dịch vụ</div>
        <h1>Trang Website đã hết hạn lưu trữ</h1>
        <p>Trang website mẫu này đã kết thúc thời hạn duy trì cho phép. Vui lòng chủ sở hữu truy cập lại nền tảng OriginD để gia hạn dịch vụ và kích hoạt lại website ngay lập tức.</p>
        <a href="{$profileUrl}" class="btn">Gia hạn dịch vụ ngay</a>
    </div>
</body>
</html>
HTML;
    }

    public function renderPreview(Template $template, array $data)
    {

        $basePath = storage_path(
            'app/public/'.$template->template_path
        );


        $htmlFile = collect(File::allFiles($basePath))
            ->first(function ($file) {

                return strtolower($file->getFilename()) === 'index.html';

            });


        if (!$htmlFile) {

            throw new \Exception(
                'Không tìm thấy index.html trong template'
            );

        }


        $html = file_get_contents(
            $htmlFile->getRealPath()
        );
        $templateUrl = asset(
            'storage/'.$template->template_path
        );


        $html = str_replace(
            [
                'src="images/',
                'href="css/',
                'src="js/',
                'src="./images/',
                'href="./css/',
                'src="./js/'
            ],
            [
                'src="'.$templateUrl.'/images/',
                'href="'.$templateUrl.'/css/',
                'src="'.$templateUrl.'/js/',
                'src="'.$templateUrl.'/images/',
                'href="'.$templateUrl.'/css/',
                'src="'.$templateUrl.'/js/'
            ],
            $html
        );
        


        $dom = new DOMDocument();


        libxml_use_internal_errors(true);


        $dom->loadHTML(
            mb_convert_encoding(
                $html,
                'HTML-ENTITIES',
                'UTF-8'
            )
        );


        libxml_clear_errors();


        $xpath = new DOMXPath($dom);



        foreach($data as $key=>$value){


            $nodes = $xpath->query(
                "//*[@data-field='$key']"
            );


            foreach ($nodes as $node) {


                if (!$node instanceof \DOMElement) {
                    continue;
                }


                // If $value is a JSON array string like '["Họ Tên"]', decode it first so we can extract the clean text
                if (is_string($value) && str_starts_with(trim($value), '[') && str_ends_with(trim($value), ']')) {
                    $decoded = json_decode($value, true);
                    if (is_array($decoded)) {
                        $value = $decoded;
                    }
                }

                switch (strtolower($node->nodeName)) {


                    case 'img':

                        if (is_array($value)) {
                            $scalars = array_values(array_filter($value, 'is_scalar'));
                            $imgStr = trim((string) ($scalars[0] ?? ''));
                        } elseif (is_object($value)) {
                            $imgStr = trim(json_encode($value, JSON_UNESCAPED_UNICODE));
                        } else {
                            $imgStr = trim((string) ($value ?? ''));
                        }

                        if (
                            str_starts_with($imgStr, 'http://') ||
                            str_starts_with($imgStr, 'https://') ||
                            str_starts_with($imgStr, '//') ||
                            str_starts_with($imgStr, 'data:image/')
                        ) {
                            $node->setAttribute('src', $imgStr);
                        } else if ($imgStr !== '') {
                            $node->setAttribute(
                                'src',
                                asset('storage/'.$template->template_path.'/'.ltrim($imgStr, '/'))
                            );
                        }

                        break;


                    case 'a':

                        if (is_array($value)) {
                            $scalars = array_values(array_filter($value, 'is_scalar'));
                            $aStr = trim((string) ($scalars[0] ?? ''));
                        } elseif (is_object($value)) {
                            $aStr = trim(json_encode($value, JSON_UNESCAPED_UNICODE));
                        } else {
                            $aStr = trim((string) ($value ?? ''));
                        }

                        if (
                            str_starts_with($aStr, 'http://') ||
                            str_starts_with($aStr, 'https://') ||
                            str_starts_with($aStr, 'mailto:') ||
                            str_starts_with($aStr, 'tel:') ||
                            (str_starts_with($aStr, '#') && !str_contains($aStr, ' '))
                        ) {
                            $node->setAttribute('href', $aStr);
                        } else if ($aStr !== '') {
                            $node->textContent = $aStr;
                        }

                        break;


                    default:

                        if ($value === null) {
                            $node->textContent = '';
                        } else if (is_array($value)) {
                            $scalars = array_filter($value, 'is_scalar');
                            $node->textContent = implode(', ', array_map('strval', $scalars));
                        } else if (is_object($value)) {
                            $node->textContent = json_encode($value, JSON_UNESCAPED_UNICODE);
                        } else {
                            $node->textContent = (string) $value;
                        }

                        break;

                }

            }

        }


        $outputHtml = $dom->saveHTML();

        return html_entity_decode($outputHtml, ENT_QUOTES | ENT_HTML5, 'UTF-8');
    }

}