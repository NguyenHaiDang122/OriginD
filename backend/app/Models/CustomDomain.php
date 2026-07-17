<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CustomDomain extends Model
{
    protected $fillable = [
        'landing_page_id',
        'domain',
        'status',
    ];

    public function landingPage()
    {
        return $this->belongsTo(LandingPage::class);
    }
}
