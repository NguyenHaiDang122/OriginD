<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminUserController extends Controller
{
    /**
     * Display a listing of all users.
     */
    public function index()
    {
        $users = User::with(['subscription', 'landingPages'])->orderBy('id', 'desc')->get();
        return UserResource::collection($users);
    }

    /**
     * Display the specified user.
     */
    public function show($id)
    {
        $user = User::with(['subscription', 'landingPages'])->findOrFail($id);
        return new UserResource($user);
    }

    /**
     * Update user role (Admin vs User).
     */
    public function updateRole(Request $request, $id): JsonResponse
    {
        $request->validate([
            'role' => 'required|string|in:Admin,User',
        ]);

        $user = User::findOrFail($id);

        if ($user->id === auth()->id() && $request->role !== 'Admin') {
            return response()->json([
                'message' => 'Không thể tự hạ quyền Admin của chính tài khoản đang đăng nhập.'
            ], 403);
        }

        $user->syncRoles([$request->role]);

        return response()->json([
            'message' => 'Đã cập nhật quyền thành công.',
            'user' => new UserResource($user),
        ]);
    }

    /**
     * Update user account status (active vs locked).
     */
    public function updateStatus(Request $request, $id): JsonResponse
    {
        $request->validate([
            'status' => 'required|string|in:active,locked',
        ]);

        $user = User::findOrFail($id);

        if ($user->id === auth()->id() && $request->status === 'locked') {
            return response()->json([
                'message' => 'Không thể tự khóa tài khoản Admin đang đăng nhập.'
            ], 403);
        }

        $user->status = $request->status;
        $user->save();

        if ($user->status === 'locked') {
            // Revoke all tokens if locked
            $user->tokens()->delete();
        }

        return response()->json([
            'message' => $user->status === 'locked' ? 'Đã khóa tài khoản thành công.' : 'Đã mở khóa tài khoản thành công.',
            'user' => new UserResource($user),
        ]);
    }

    /**
     * Remove the specified user.
     */
    public function destroy($id): JsonResponse
    {
        $user = User::findOrFail($id);

        if ($user->id === auth()->id()) {
            return response()->json([
                'message' => 'Không thể tự xóa chính tài khoản Admin đang đăng nhập.'
            ], 403);
        }

        $user->tokens()->delete();
        $user->delete();

        return response()->json([
            'message' => 'Đã xóa tài khoản người dùng thành công.',
        ]);
    }

    /**
     * Update user balance.
     */
    public function updateBalance(Request $request, $id): JsonResponse
    {
        $request->validate([
            'balance' => 'required|numeric|min:0',
        ]);

        $user = User::findOrFail($id);
        $user->balance = (int) $request->balance;
        $user->save();

        return response()->json([
            'message' => 'Đã cập nhật số dư cho tài khoản thành công.',
            'user' => new UserResource($user->load(['subscription', 'landingPages'])),
        ]);
    }

    /**
     * Update user custom landing page limit.
     */
    public function updateLandingPageLimit(Request $request, $id): JsonResponse
    {
        $request->validate([
            'landing_page_limit' => 'nullable|integer|min:0',
        ]);

        $user = User::findOrFail($id);
        $user->landing_page_limit = $request->has('landing_page_limit') && !is_null($request->landing_page_limit) && $request->landing_page_limit !== '' ? (int) $request->landing_page_limit : null;
        $user->save();

        return response()->json([
            'message' => 'Đã cập nhật giới hạn số trang Landing Page cho tài khoản thành công.',
            'user' => new UserResource($user->load(['subscription', 'landingPages'])),
        ]);
    }

    /**
     * Update creation & expiration dates for a user's landing page.
     */
    public function updateLandingPageDates(Request $request, $userId, $landingPageId): JsonResponse
    {
        $request->validate([
            'created_at' => 'nullable|date',
            'expires_at' => 'nullable|date',
        ]);

        $user = User::findOrFail($userId);
        $lp = $user->landingPages()->findOrFail($landingPageId);

        if ($request->has('created_at') && !empty($request->created_at)) {
            $lp->created_at = \Carbon\Carbon::parse($request->created_at);
        }
        if ($request->has('expires_at') && !empty($request->expires_at)) {
            $lp->expires_at = \Carbon\Carbon::parse($request->expires_at);
        }
        $lp->save();

        return response()->json([
            'message' => 'Đã cập nhật ngày tạo và ngày hết hạn cho Landing Page thành công.',
            'landing_page' => [
                'id' => $lp->id,
                'title' => $lp->title,
                'slug' => $lp->slug,
                'status' => $lp->status,
                'created_at' => $lp->created_at ? $lp->created_at->format('Y-m-d H:i:s') : null,
                'expires_at' => $lp->expires_at ? $lp->expires_at->format('Y-m-d H:i:s') : null,
            ],
            'user' => new UserResource($user->load(['subscription', 'landingPages'])),
        ]);
    }
}
