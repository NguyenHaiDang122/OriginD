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
        'expires_at',
    ];


    protected $casts = [
        'data' => 'array',
        'expires_at' => 'datetime',
    ];


    public function template(): BelongsTo
    {
        return $this->belongsTo(Template::class);
    }


    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function customDomains()
    {
        return $this->hasMany(CustomDomain::class);
    }

    public function isExpired(): bool
    {
        if ($this->expires_at) {
            try {
                $date = $this->expires_at instanceof \DateTimeInterface
                    ? \Carbon\Carbon::instance($this->expires_at)
                    : \Carbon\Carbon::parse($this->expires_at);
                if ($date->isPast()) {
                    return true;
                }
            } catch (\Exception $e) {}
        }

        if ($this->user && $this->user->subscription && $this->user->subscription->expired_at) {
            try {
                $subDate = $this->user->subscription->expired_at instanceof \DateTimeInterface
                    ? \Carbon\Carbon::instance($this->user->subscription->expired_at)
                    : \Carbon\Carbon::parse($this->user->subscription->expired_at);
                if ($subDate->isPast()) {
                    return true;
                }
            } catch (\Exception $e) {}
        }

        return false;
    }
}