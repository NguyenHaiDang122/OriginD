<?php

namespace App\Services;

use App\Models\LandingPage;
use App\Models\Template;
use Illuminate\Support\Facades\Auth;

class LandingPageService
{

    public function create(
        Template $template,
        array $data
    ): LandingPage
    {

        return LandingPage::create([

            'user_id' => Auth::id(),

            'template_id' => $template->id,

            'title' => $data['title'],

            'slug' => $data['slug'],

            'data' => $data['fields'],

            'status' => 'draft',

        ]);

    }


}