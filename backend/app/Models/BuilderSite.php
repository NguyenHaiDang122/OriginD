<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BuilderSite extends Model
{
    protected $fillable = [
        'user_id',
        'title',
        'slug',
        'data',
        'settings',
        'status',
        'thumbnail',
        'published_at',
    ];

    protected $casts = [
        'data' => 'array',
        'settings' => 'array',
        'published_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
