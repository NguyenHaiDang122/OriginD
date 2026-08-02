<?php
require 'vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$file = 'public/favicon.ico';
if (!file_exists($file)) {
    echo "No favicon.ico to test with.\n";
    exit;
}
$base64Image = base64_encode(file_get_contents($file));

$apiKey = env('IMGBB_API_KEY');
var_dump($apiKey);
echo "Length: " . strlen($apiKey) . "\n";
echo "API Key: $apiKey\n";

$response = Illuminate\Support\Facades\Http::timeout(15)
    ->attach('image', file_get_contents($file), 'favicon.ico')
    ->post("https://api.imgbb.com/1/upload?key=$apiKey");

echo "Status: " . $response->status() . "\n";
echo "Body: " . $response->body() . "\n";
