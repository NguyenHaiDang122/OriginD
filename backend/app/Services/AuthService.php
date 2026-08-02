<?php

namespace App\Services;

use App\Models\User;
use App\Models\EmailOtp;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\RateLimiter;
use App\Models\Plan;
use App\Models\Subscription;

class AuthService
{
    public function sendRegisterOtp(array $data): array
    {
        $dailyKey = 'otp-daily:' . $data['email'];
        if (RateLimiter::tooManyAttempts($dailyKey, 10)) {
            $seconds = RateLimiter::availableIn($dailyKey);
            $hours = ceil($seconds / 3600);
            throw ValidationException::withMessages([
                'email' => ["Email này đã vượt quá giới hạn 10 mã OTP/ngày. Vui lòng thử lại sau $hours giờ."],
            ]);
        }

        $resendKey = 'otp-resend:' . $data['email'];
        if (RateLimiter::tooManyAttempts($resendKey, 1)) {
            $seconds = RateLimiter::availableIn($resendKey);
            throw ValidationException::withMessages([
                'email' => ["Vui lòng chờ $seconds giây trước khi yêu cầu mã mới."],
            ]);
        }
        RateLimiter::hit($resendKey, 60);
        RateLimiter::hit($dailyKey, 86400);

        if (User::where('email', $data['email'])->exists()) {
            throw ValidationException::withMessages([
                'email' => ['Email này đã được đăng ký trên hệ thống.'],
            ]);
        }

        $otp = (string) rand(100000, 999999);

        EmailOtp::updateOrCreate(
            ['email' => $data['email']],
            [
                'otp' => $otp,
                'expires_at' => now()->addMinutes(5),
            ]
        );

        try {
            Mail::send('emails.register-otp', [
                'name' => $data['name'],
                'otp' => $otp,
            ], function ($message) use ($data) {
                $message->to($data['email'], $data['name'])
                        ->subject('Mã xác nhận OTP Đăng ký tài khoản - OriginD');
            });
        } catch (\Exception $e) {
            throw ValidationException::withMessages([
                'email' => ['Không thể gửi email OTP. Vui lòng kiểm tra lại cấu hình Gmail hoặc địa chỉ email của bạn. (' . $e->getMessage() . ')'],
            ]);
        }

        return [
            'message' => 'Mã xác nhận OTP 6 chữ số đã được gửi đến địa chỉ email của bạn.',
            'email' => $data['email'],
        ];
    }

    public function verifyRegisterOtpAndRegister(array $data): array
    {
        $record = EmailOtp::where('email', $data['email'])->first();

        if (!$record || $record->otp !== $data['otp'] || $record->expires_at->isPast()) {
            throw ValidationException::withMessages([
                'otp' => ['Mã OTP không chính xác hoặc đã hết hạn (5 phút).'],
            ]);
        }

        $record->delete();

        return $this->register($data);
    }

    public function register(array $data): array
    {
        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
        ]);
        $user->assignRole('User');

        $freePlan = Plan::where('slug', 'free')->first();

        Subscription::create([
            'user_id' => $user->id,
            'plan_id' => $freePlan->id,
            'started_at' => now(),
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return [
            'message' => 'Đăng ký tài khoản thành công.',
            'token' => $token,
            'user' => $user,
        ];
    }

    public function sendForgotPasswordOtp(string $email): array
    {
        $dailyKey = 'otp-daily:' . $email;
        if (RateLimiter::tooManyAttempts($dailyKey, 10)) {
            $seconds = RateLimiter::availableIn($dailyKey);
            $hours = ceil($seconds / 3600);
            throw ValidationException::withMessages([
                'email' => ["Email này đã vượt quá giới hạn 10 mã OTP/ngày. Vui lòng thử lại sau $hours giờ."],
            ]);
        }

        $resendKey = 'otp-resend-forgot:' . $email;
        if (RateLimiter::tooManyAttempts($resendKey, 1)) {
            $seconds = RateLimiter::availableIn($resendKey);
            throw ValidationException::withMessages([
                'email' => ["Vui lòng chờ $seconds giây trước khi yêu cầu mã mới."],
            ]);
        }
        RateLimiter::hit($resendKey, 60);
        RateLimiter::hit($dailyKey, 86400);

        $user = User::where('email', $email)->first();

        // 1. Anti-Enumeration: Always return success message even if user doesn't exist.
        if (!$user) {
            return [
                'message' => 'Nếu email tồn tại trong hệ thống, mã OTP đã được gửi đến bạn.',
            ];
        }

        // 2. Clear old OTPs (if any) by using updateOrCreate.
        // It ensures only 1 OTP exists for this email.
        $otp = (string) rand(100000, 999999);

        EmailOtp::updateOrCreate(
            ['email' => $email],
            [
                'otp' => $otp,
                'expires_at' => now()->addMinutes(5), // 5 minutes expiration
            ]
        );

        // 3. Send email
        try {
            Mail::send('emails.forgot-password-otp', [
                'name' => $user->name,
                'otp' => $otp,
            ], function ($message) use ($email, $user) {
                $message->to($email, $user->name)
                        ->subject('Mã xác nhận quên mật khẩu - OriginD');
            });
        } catch (\Exception $e) {
            // Log error silently to not reveal user existence on failure, or return generic error
            \Log::error("Forgot password email failed for $email: " . $e->getMessage());
        }

        return [
            'message' => 'Nếu email tồn tại trong hệ thống, mã OTP đã được gửi đến bạn.',
        ];
    }

    public function resetPasswordWithOtp(string $email, string $otp, string $newPassword): array
    {
        $throttleKey = 'reset-pwd:' . $email;
        $maxAttempts = 5;

        // 1. Exponential Backoff logic via RateLimiter & Cache
        // RateLimiter tracks attempts, but we also need custom logic to double the lockout time.
        // Let's store the current lockout penalty multiplier in cache.
        $penaltyKey = 'reset-pwd-penalty:' . $email;
        $penaltyMultiplier = \Cache::get($penaltyKey, 1);
        $lockoutMinutes = 30 * $penaltyMultiplier; 
        
        if (RateLimiter::tooManyAttempts($throttleKey, $maxAttempts)) {
            $seconds = RateLimiter::availableIn($throttleKey);
            $minutes = ceil($seconds / 60);
            throw ValidationException::withMessages([
                'otp' => ["Bạn đã nhập sai quá 5 lần. Vui lòng thử lại sau $minutes phút."],
            ]);
        }

        $user = User::where('email', $email)->first();
        if (!$user) {
            // Should not happen if they actually received an OTP, but just in case
            RateLimiter::hit($throttleKey, $lockoutMinutes * 60);
            $this->checkAndApplyPenalty($throttleKey, $maxAttempts, $penaltyKey, $penaltyMultiplier);
            throw ValidationException::withMessages([
                'otp' => ['Mã OTP không chính xác hoặc đã hết hạn.'],
            ]);
        }

        $record = EmailOtp::where('email', $email)->first();

        // 2. Verify OTP
        if (!$record || $record->otp !== $otp || $record->expires_at->isPast()) {
            RateLimiter::hit($throttleKey, $lockoutMinutes * 60);
            $this->checkAndApplyPenalty($throttleKey, $maxAttempts, $penaltyKey, $penaltyMultiplier);
            
            throw ValidationException::withMessages([
                'otp' => ['Mã OTP không chính xác hoặc đã hết hạn.'],
            ]);
        }

        // 3. Success: Reset password
        $user->password = Hash::make($newPassword);
        $user->save();

        // 4. Invalidate all existing tokens
        $user->tokens()->delete();

        // 5. Delete OTP record (single use)
        $record->delete();

        // 6. Reset rate limiters completely
        RateLimiter::clear($throttleKey);
        \Cache::forget($penaltyKey);

        return [
            'message' => 'Đổi mật khẩu thành công.',
        ];
    }

    private function checkAndApplyPenalty(string $throttleKey, int $maxAttempts, string $penaltyKey, int $currentMultiplier)
    {
        if (RateLimiter::attempts($throttleKey) >= $maxAttempts) {
            // Increase penalty for next time they get locked out
            \Cache::put($penaltyKey, $currentMultiplier * 2, now()->addDays(1));
        }
    }

    public function login(array $data): array
    {
        $user = User::where('email', $data['email'])->first();

        if (!$user || !Hash::check($data['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Email hoặc mật khẩu không đúng.'],
            ]);
        }

        if ($user->status === 'locked') {
            throw ValidationException::withMessages([
                'email' => ['Tài khoản của bạn đã bị khóa. Vui lòng liên hệ Quản trị viên để được hỗ trợ.'],
            ]);
        }

        // Check maintenance mode
        $maintenanceSettings = \Illuminate\Support\Facades\Cache::remember('maintenance_settings', 60, function () {
            $setting = \App\Models\Setting::where('key', 'maintenance_settings')->first();
            return $setting ? $setting->value : null;
        });

        if (isset($maintenanceSettings['maintenance_mode']) && $maintenanceSettings['maintenance_mode'] === true) {
            if ($user->role !== 'Admin' && (!$user->roles || !$user->roles->some('name', 'Admin'))) {
                throw new \Illuminate\Http\Exceptions\HttpResponseException(response()->json([
                    'message' => $maintenanceSettings['maintenance_message'] ?? 'Hệ thống đang được bảo trì. Vui lòng quay lại sau.',
                    'maintenance' => true
                ], 503));
            }
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return [
            'user' => $user,
            'token' => $token,
        ];
    }


    public function googleLogin(string $credential): array
    {
        $response = \Illuminate\Support\Facades\Http::get('https://oauth2.googleapis.com/tokeninfo', [
            'id_token' => $credential,
        ]);

        if (!$response->successful()) {
            throw ValidationException::withMessages([
                'email' => ['Xác thực Google thất bại. Vui lòng thử lại.'],
            ]);
        }

        $payload = $response->json();
        $email = $payload['email'] ?? null;
        $name = $payload['name'] ?? ($payload['given_name'] ?? 'Google User');

        if (!$email) {
            throw ValidationException::withMessages([
                'email' => ['Không lấy được email từ tài khoản Google của bạn.'],
            ]);
        }

        $user = User::where('email', $email)->first();

        if ($user) {
            if ($user->status === 'locked') {
                throw ValidationException::withMessages([
                    'email' => ['Tài khoản của bạn đã bị khóa. Vui lòng liên hệ Quản trị viên để được hỗ trợ.'],
                ]);
            }
        } else {
            $user = User::create([
                'name' => $name,
                'email' => $email,
                'password' => Hash::make(Str::random(24)),
            ]);
            $user->assignRole('User');

            $freePlan = Plan::where('slug', 'free')->first();
            if ($freePlan) {
                Subscription::create([
                    'user_id' => $user->id,
                    'plan_id' => $freePlan->id,
                    'started_at' => now(),
                ]);
            }
        }

        // Check maintenance mode
        $maintenanceSettings = \Illuminate\Support\Facades\Cache::remember('maintenance_settings', 60, function () {
            $setting = \App\Models\Setting::where('key', 'maintenance_settings')->first();
            return $setting ? $setting->value : null;
        });

        if (isset($maintenanceSettings['maintenance_mode']) && $maintenanceSettings['maintenance_mode'] === true) {
            if ($user->role !== 'Admin' && (!$user->roles || !$user->roles->some('name', 'Admin'))) {
                throw new \Illuminate\Http\Exceptions\HttpResponseException(response()->json([
                    'message' => $maintenanceSettings['maintenance_message'] ?? 'Hệ thống đang được bảo trì. Vui lòng quay lại sau.',
                    'maintenance' => true
                ], 503));
            }
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return [
            'user' => $user,
            'token' => $token,
        ];
    }

    public function logout(User $user): void
    {
        $user->currentAccessToken()->delete();
    }
}