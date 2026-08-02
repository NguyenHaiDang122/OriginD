<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;
use App\Models\EmailOtp;
use Laravel\Sanctum\PersonalAccessToken;
use Carbon\Carbon;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::call(function () {
    // 1. Delete expired OTPs
    EmailOtp::where('expires_at', '<', Carbon::now())->delete();

    // 2. Delete Personal Access Tokens unused for 30 days
    PersonalAccessToken::where('last_used_at', '<', Carbon::now()->subDays(30))->delete();
})->daily();
