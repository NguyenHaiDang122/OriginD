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
        $users = User::with('subscription')->orderBy('id', 'desc')->get();
        return UserResource::collection($users);
    }

    /**
     * Display the specified user.
     */
    public function show($id)
    {
        $user = User::findOrFail($id);
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
}
