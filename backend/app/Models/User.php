<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;
use App\Models\Subscription;
use App\Models\LandingPage;
use App\Models\Deposit;


class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable, HasRoles;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'status',
        'balance',
        'landing_page_limit',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'balance' => 'decimal:2',
            'landing_page_limit' => 'integer',
        ];
    }
    
    public function subscription()
    {
        return $this->hasOne(Subscription::class)->latestOfMany();
    }

    public function landingPages()
    {
        return $this->hasMany(LandingPage::class);
    }

    public function deposits()
    {
        return $this->hasMany(Deposit::class);
    }

    public function getEffectiveLandingPageLimit(): int
    {
        if (!is_null($this->landing_page_limit)) {
            return (int) $this->landing_page_limit;
        }

        $subscription = $this->subscription;
        $plan = $subscription ? $subscription->plan : null;
        if (!$plan || in_array(strtolower($plan->slug), ['free', 'starter']) || $plan->landing_page_limit <= 1) {
            return 1;
        }

        return $plan->landing_page_limit > 0 ? (int) $plan->landing_page_limit : 999;
    }
}
