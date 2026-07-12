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


    return response(
        $renderer->render($page)
    )->header(
        'Content-Type',
        'text/html'
    );

});
