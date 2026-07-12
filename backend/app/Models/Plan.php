<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Plan extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'price',
        'landing_page_limit',
        'custom_domain',
        'premium_templates',
    ];

    public function subscriptions()
    {
        return $this->hasMany(Subscription::class);
    }
}