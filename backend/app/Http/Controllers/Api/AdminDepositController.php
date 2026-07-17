<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Deposit;
use Illuminate\Http\Request;

class AdminDepositController extends Controller
{
    public function index(Request $request)
    {
        $deposits = Deposit::with('user:id,name,email,balance')
            ->orderBy('id', 'desc')
            ->get();

        return response()->json([
            'data' => $deposits,
        ]);
    }

    public function approve(Deposit $deposit)
    {
        if ($deposit->status !== 'pending') {
            return response()->json([
                'message' => 'Đơn nạp này đã được xử lý trước đó (' . $deposit->status . ')'
            ], 400);
        }

        $deposit->status = 'approved';
        $deposit->save();

        $user = $deposit->user;
        if ($user) {
            $user->balance += $deposit->amount;
            $user->save();
        }

        return response()->json([
            'message' => 'Đã duyệt đơn nạp tiền thành công! Đã cộng ' . number_format($deposit->amount) . ' đ vào tài khoản ' . ($user->email ?? 'User'),
            'data' => $deposit->load('user:id,name,email,balance'),
        ]);
    }

    public function reject(Deposit $deposit)
    {
        if ($deposit->status !== 'pending') {
            return response()->json([
                'message' => 'Đơn nạp này đã được xử lý trước đó (' . $deposit->status . ')'
            ], 400);
        }

        $deposit->status = 'rejected';
        $deposit->save();

        return response()->json([
            'message' => 'Đã từ chối đơn nạp tiền.',
            'data' => $deposit->load('user:id,name,email,balance'),
        ]);
    }
}
