<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Template;
use App\Models\LandingPage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

use App\Services\LandingPageRendererService;

class LandingPageController extends Controller
{

    public function store(Request $request, Template $template)
    {

        $request->validate([
            'title' => 'required|string',
            'data' => 'required|array',
        ]);


        $page = LandingPage::create([

            'user_id' => Auth::id(),

            'template_id' => $template->id,

            'title' => $request->title,

            'slug' => Str::slug($request->title).'-'.uniqid(),

            'data' => $request->data,

            'status' => 'draft',

        ]);


        return response()->json([

            'message' => 'Tạo Landing Page thành công',

            'data' => $page

        ],201);

    }
    public function render(
        LandingPage $landingPage,
        LandingPageRendererService $renderer
    ){

        return response(
            $renderer->render($landingPage)
        )
        ->header(
            'Content-Type',
            'text/html'
        );

    }

}