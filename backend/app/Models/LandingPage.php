<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LandingPage extends Model
{
    protected $fillable = [
        'user_id',
        'template_id',
        'title',
        'slug',
        'data',
        'domain',
        'status',
    ];


    protected $casts = [
        'data' => 'array',
    ];


    public function template(): BelongsTo
    {
        return $this->belongsTo(Template::class);
    }


    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}