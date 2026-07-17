<?php

namespace App\Services;

use App\Models\User;
use App\Models\EmailOtp;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Str;
use App\Models\Plan;
use App\Models\Subscription;

class AuthService
{
    public function sendRegisterOtp(array $data): array
    {
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
                'expires_at' => now()->addMinutes(10),
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
                'otp' => ['Mã OTP không chính xác hoặc đã hết hạn (10 phút).'],
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
            'user' => $user,
            'token' => $token,
        ];
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