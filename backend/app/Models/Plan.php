<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Plan extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'description',
        'price',
        'duration_days',
        'landing_page_limit',
        'custom_domain',
        'premium_templates',
        'is_popular',
        'is_hidden',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'duration_days' => 'integer',
            'landing_page_limit' => 'integer',
            'custom_domain' => 'boolean',
            'premium_templates' => 'boolean',
            'is_popular' => 'boolean',
            'is_hidden' => 'boolean',
        ];
    }

    public function subscriptions()
    {
        return $this->hasMany(Subscription::class);
    }

    public function templates()
    {
        return $this->belongsToMany(Template::class);
    }
}