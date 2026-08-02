<?php
$html = '<!DOCTYPE html><html><head><title>Test</title></head><body><h1 data-field="title">Nguyễn Hải Đăng</h1></body></html>';
$dom = new DOMDocument();
libxml_use_internal_errors(true);
$dom->loadHTML(mb_convert_encoding($html, 'HTML-ENTITIES', 'UTF-8'));
libxml_clear_errors();

$xpath = new DOMXPath($dom);
$node = $xpath->query("//*[@data-field='title']")->item(0);
$node->textContent = 'Lý Thường Kiệt <script>alert(1)</script>';

$outputHtml = $dom->saveHTML();
echo "--- BEFORE DECODE ---\n";
echo $outputHtml;

echo "\n--- AFTER DECODE (Vulnerable) ---\n";
echo html_entity_decode($outputHtml, ENT_QUOTES | ENT_HTML5, 'UTF-8');

echo "\n--- PROPER FIX ---\n";
$dom2 = new DOMDocument();
libxml_use_internal_errors(true);
$dom2->loadHTML(mb_convert_encoding($html, 'HTML-ENTITIES', 'UTF-8'));
libxml_clear_errors();
$xpath2 = new DOMXPath($dom2);
$node2 = $xpath2->query("//*[@data-field='title']")->item(0);
$node2->textContent = 'Lý Thường Kiệt <script>alert(1)</script>';
$fixedHtml = $dom2->saveHTML();
// Chỉ decode các thực thể UTF-8 (ví dụ &#233;) nhưng bỏ qua &lt;, &gt;, &quot;, &amp;
$fixedHtml = preg_replace_callback('/&#(?:x[a-fA-F0-9]+|[0-9]+);|&[a-zA-Z0-9]+;/', function($matches) {
    $entity = $matches[0];
    if (in_array($entity, ['&lt;', '&gt;', '&quot;', '&amp;', '&apos;'])) {
        return $entity; // Giữ nguyên các ký tự HTML đặc biệt
    }
    return html_entity_decode($entity, ENT_QUOTES | ENT_HTML5, 'UTF-8');
}, $fixedHtml);
echo $fixedHtml;
