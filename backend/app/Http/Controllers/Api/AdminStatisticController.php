<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\LandingPage;
use App\Models\Deposit;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class AdminStatisticController extends Controller
{
    public function getStatistics(Request $request)
    {
        $user = $request->user();
        if (!$user || ($user->role !== 'Admin' && (!$user->roles || !$user->roles->some('name', 'Admin')))) {
            return response()->json(['message' => 'Không có quyền truy cập.'], 403);
        }

        // 1. Calculate Revenue
        $today = Carbon::today();
        $startOfMonth = Carbon::now()->startOfMonth();
        $startOfYear = Carbon::now()->startOfYear();

        $revenueToday = Deposit::where('status', 'approved')
            ->whereDate('created_at', $today)
            ->sum('amount');

        $revenueMonth = Deposit::where('status', 'approved')
            ->where('created_at', '>=', $startOfMonth)
            ->sum('amount');

        $revenueYear = Deposit::where('status', 'approved')
            ->where('created_at', '>=', $startOfYear)
            ->sum('amount');

        // 2. Statistics Counts
        $totalUsers = User::role('User')->count();
        $totalAdmins = User::role('Admin')->count();
        $totalLandingPages = LandingPage::count();

        // 3. Chart Data (New Users in last 30 days)
        $thirtyDaysAgo = Carbon::today()->subDays(29);
        
        // Group users by date
        $newUsersByDate = User::where('created_at', '>=', $thirtyDaysAgo)
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('count(*) as count'))
            ->groupBy('date')
            ->get()
            ->keyBy('date');

        // Group landing pages by date
        $newPagesByDate = LandingPage::where('created_at', '>=', $thirtyDaysAgo)
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('count(*) as count'))
            ->groupBy('date')
            ->get()
            ->keyBy('date');

        // Group revenue by date
        $revenueByDate = Deposit::where('status', 'approved')
            ->where('created_at', '>=', $thirtyDaysAgo)
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('sum(amount) as total'))
            ->groupBy('date')
            ->get()
            ->keyBy('date');

        $chartData = [];
        for ($i = 0; $i < 30; $i++) {
            $dateStr = $thirtyDaysAgo->copy()->addDays($i)->format('Y-m-d');
            $chartData[] = [
                'date' => Carbon::parse($dateStr)->format('d/m'),
                'new_users' => isset($newUsersByDate[$dateStr]) ? (int)$newUsersByDate[$dateStr]->count : 0,
                'new_pages' => isset($newPagesByDate[$dateStr]) ? (int)$newPagesByDate[$dateStr]->count : 0,
                'revenue' => isset($revenueByDate[$dateStr]) ? (float)$revenueByDate[$dateStr]->total : 0,
            ];
        }

        return response()->json([
            'revenue' => [
                'today' => $revenueToday,
                'this_month' => $revenueMonth,
                'this_year' => $revenueYear,
            ],
            'stats' => [
                'total_users' => $totalUsers,
                'total_admins' => $totalAdmins,
                'total_landing_pages' => $totalLandingPages,
            ],
            'chart_data' => $chartData
        ]);
    }
}
