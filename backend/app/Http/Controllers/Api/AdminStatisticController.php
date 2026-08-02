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

        $monthParam = $request->query('month');
        $isSpecificMonth = $monthParam && preg_match('/^\d{4}-\d{2}$/', $monthParam);
        
        if ($isSpecificMonth) {
            $targetDate = Carbon::createFromFormat('Y-m', $monthParam)->startOfMonth();
            $today = ($targetDate->format('Y-m') === Carbon::today()->format('Y-m')) ? Carbon::today() : null;
            $startOfMonth = $targetDate->copy()->startOfMonth();
            $endOfMonth = $targetDate->copy()->endOfMonth();
            $startOfYear = $targetDate->copy()->startOfYear();
            $endOfYear = $targetDate->copy()->endOfYear();
        } else {
            $today = Carbon::today();
            $startOfMonth = Carbon::now()->startOfMonth();
            $endOfMonth = Carbon::now()->endOfMonth();
            $startOfYear = Carbon::now()->startOfYear();
            $endOfYear = Carbon::now()->endOfYear();
        }

        $revenueTodayQuery = Deposit::where('status', 'approved');
        if ($today) {
            $revenueTodayQuery->whereDate('created_at', $today);
        } else {
            $revenueTodayQuery->whereRaw('1 = 0'); // force 0 if not current month
        }
        $revenueToday = $revenueTodayQuery->sum('amount');

        $revenueMonth = Deposit::where('status', 'approved')
            ->whereBetween('created_at', [$startOfMonth, $endOfMonth])
            ->sum('amount');

        $revenueYear = Deposit::where('status', 'approved')
            ->whereBetween('created_at', [$startOfYear, $endOfYear])
            ->sum('amount');

        // 2. Statistics Counts
        $usersQuery = User::role('User');
        $adminsQuery = User::role('Admin');
        $landingPagesQuery = LandingPage::query();

        if ($isSpecificMonth) {
            $usersQuery->whereBetween('created_at', [$startOfMonth, $endOfMonth]);
            $adminsQuery->whereBetween('created_at', [$startOfMonth, $endOfMonth]);
            $landingPagesQuery->whereBetween('created_at', [$startOfMonth, $endOfMonth]);
        }

        $totalUsers = $usersQuery->count();
        $totalAdmins = $adminsQuery->count();
        $totalLandingPages = $landingPagesQuery->count();

        $chartFilter = $request->query('chart_filter', '30_days'); // 30_days, month, year

        if ($chartFilter === 'year') {
            $startDate = $startOfYear->copy();
            $endDate = $endOfYear->copy();
            
            // Group users by month
            $newUsersByDate = User::whereBetween('created_at', [$startDate, $endDate])
                ->select(DB::raw('DATE_FORMAT(created_at, "%Y-%m") as date'), DB::raw('count(*) as count'))
                ->groupBy('date')
                ->get()
                ->keyBy('date');

            // Group landing pages by month
            $newPagesByDate = LandingPage::whereBetween('created_at', [$startDate, $endDate])
                ->select(DB::raw('DATE_FORMAT(created_at, "%Y-%m") as date'), DB::raw('count(*) as count'))
                ->groupBy('date')
                ->get()
                ->keyBy('date');

            // Group revenue by month
            $revenueByDate = Deposit::where('status', 'approved')
                ->whereBetween('created_at', [$startDate, $endDate])
                ->select(DB::raw('DATE_FORMAT(created_at, "%Y-%m") as date'), DB::raw('sum(amount) as total'))
                ->groupBy('date')
                ->get()
                ->keyBy('date');

            $chartData = [];
            for ($i = 1; $i <= 12; $i++) {
                $monthStr = str_pad($i, 2, '0', STR_PAD_LEFT);
                $dateKey = $startDate->year . '-' . $monthStr;
                $chartData[] = [
                    'date' => "T$i",
                    'new_users' => isset($newUsersByDate[$dateKey]) ? (int)$newUsersByDate[$dateKey]->count : 0,
                    'new_pages' => isset($newPagesByDate[$dateKey]) ? (int)$newPagesByDate[$dateKey]->count : 0,
                    'revenue' => isset($revenueByDate[$dateKey]) ? (float)$revenueByDate[$dateKey]->total : 0,
                ];
            }
        } else {
            // Daily logic (30_days or month)
            if ($chartFilter === 'month') {
                $startDate = $startOfMonth->copy();
                $endDate = $endOfMonth->copy();
                $daysToLoop = $startOfMonth->daysInMonth;
            } else {
                $startDate = Carbon::today()->subDays(29);
                $endDate = Carbon::today()->endOfDay();
                $daysToLoop = 30;
            }
            
            $newUsersByDate = User::whereBetween('created_at', [$startDate, $endDate])
                ->select(DB::raw('DATE(created_at) as date'), DB::raw('count(*) as count'))
                ->groupBy('date')
                ->get()
                ->keyBy('date');

            $newPagesByDate = LandingPage::whereBetween('created_at', [$startDate, $endDate])
                ->select(DB::raw('DATE(created_at) as date'), DB::raw('count(*) as count'))
                ->groupBy('date')
                ->get()
                ->keyBy('date');

            $revenueByDate = Deposit::where('status', 'approved')
                ->whereBetween('created_at', [$startDate, $endDate])
                ->select(DB::raw('DATE(created_at) as date'), DB::raw('sum(amount) as total'))
                ->groupBy('date')
                ->get()
                ->keyBy('date');

            $chartData = [];
            for ($i = 0; $i < $daysToLoop; $i++) {
                $dateStr = $startDate->copy()->addDays($i)->format('Y-m-d');
                $chartData[] = [
                    'date' => Carbon::parse($dateStr)->format('d/m'),
                    'new_users' => isset($newUsersByDate[$dateStr]) ? (int)$newUsersByDate[$dateStr]->count : 0,
                    'new_pages' => isset($newPagesByDate[$dateStr]) ? (int)$newPagesByDate[$dateStr]->count : 0,
                    'revenue' => isset($revenueByDate[$dateStr]) ? (float)$revenueByDate[$dateStr]->total : 0,
                ];
            }
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
