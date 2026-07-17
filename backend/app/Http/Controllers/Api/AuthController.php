<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Services\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function register(RegisterRequest $request): JsonResponse
    {
        $result = $this->authService->register(
            $request->validated()
        );

        return response()->json([
            'message' => 'Đăng ký thành công.',
            'token' => $result['token'],
            'user' => new UserResource($result['user']),
        ], 201);
    }

    public function sendRegisterOtp(RegisterRequest $request): JsonResponse
    {
        $result = $this->authService->sendRegisterOtp($request->validated());

        return response()->json($result);
    }

    public function verifyRegisterOtpAndRegister(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255',
            'password' => 'required|string|min:6',
            'otp' => 'required|string|size:6',
        ]);

        $result = $this->authService->verifyRegisterOtpAndRegister($data);

        return response()->json([
            'message' => 'Đăng ký tài khoản thành công.',
            'token' => $result['token'],
            'user' => new UserResource($result['user']),
        ], 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $result = $this->authService->login(
            $request->validated()
        );

        return response()->json([
            'message' => 'Đăng nhập thành công.',
            'token' => $result['token'],
            'user' => new UserResource($result['user']),
        ]);
    }

    public function googleLogin(Request $request): JsonResponse
    {
        $request->validate([
            'credential' => 'required|string',
        ]);

        $result = $this->authService->googleLogin($request->input('credential'));

        return response()->json([
            'message' => 'Đăng nhập Google thành công.',
            'token' => $result['token'],
            'user' => new UserResource($result['user']),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $this->authService->logout($request->user());

        return response()->json([
            'message' => 'Đăng xuất thành công.',
        ]);
    }

    public function me(Request $request): UserResource
    {
        return new UserResource($request->user());
    }

    public function __construct(
        private readonly AuthService $authService
    ) {
    }
}