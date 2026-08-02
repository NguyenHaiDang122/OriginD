<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Deposit;
use App\Models\LandingPage;
use App\Models\Subscription;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class DepositController extends Controller
{
    public function index(Request $request)
    {
        $deposits = Deposit::where('user_id', Auth::id())
            ->orderBy('id', 'desc')
            ->get();

        return response()->json([
            'data' => $deposits,
            'balance' => Auth::user()->balance ?? 0,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:10000',
            'note' => 'nullable|string',
        ]);

        $user = Auth::user();
        $orderCode = intval(date('ymdHis') . mt_rand(10, 99));

        // Generate unique code ORIGIND + random uppercase string
        do {
            $code = 'ORIGIND' . strtoupper(Str::random(6));
        } while (Deposit::where('code', $code)->exists());

        $deposit = Deposit::create([
            'user_id' => $user->id,
            'amount' => $request->amount,
            'code' => $code,
            'status' => 'pending',
            'note' => $request->note,
        ]);

        $sepayFields = null;
        $sepayUrl = null;
        $merchantId = config('services.sepay.merchant_id');
        $secretKey = config('services.sepay.secret_key');
        $sepayEnv = config('services.sepay.env');

        if (!empty($merchantId) && !empty($secretKey)) {
            try {
                $frontendUrl = rtrim($request->header('origin') ?? config('app.frontend_url'), '/');
                $sepay = new \SePay\SePayClient($merchantId, $secretKey, $sepayEnv);
                $checkoutData = \SePay\Builders\CheckoutBuilder::make()
                    ->currency('VND')
                    ->orderInvoiceNumber($code)
                    ->orderAmount(intval($request->amount))
                    ->operation('PURCHASE')
                    ->orderDescription($code)
                    ->successUrl($frontendUrl . '/profile?payment=success&code=' . $code)
                    ->errorUrl($frontendUrl . '/profile?payment=error&code=' . $code)
                    ->cancelUrl($frontendUrl . '/profile?payment=cancel&code=' . $code)
                    ->build();

                $sepayFields = $sepay->checkout()->generateFormFields($checkoutData);
                $sepayUrl = $sepay->checkout()->getCheckoutUrl($sepayEnv);

                // Execute server-side curl POST to SePay init endpoint to get the final GET checkout URL (Bypasses Cloudflare cross-origin form block)
                $ch = curl_init($sepayUrl);
                curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                curl_setopt($ch, CURLOPT_POST, true);
                curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($sepayFields));
                curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
                curl_setopt($ch, CURLOPT_FOLLOWLOCATION, false);
                curl_exec($ch);
                $redirectUrl = curl_getinfo($ch, CURLINFO_REDIRECT_URL);
                curl_close($ch);

                $finalUrl = $redirectUrl ?: $sepayUrl;
                $deposit->checkout_url = $finalUrl;
                $deposit->save();

                $deposit->setAttribute('sepay_fields', $redirectUrl ? null : $sepayFields);
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error('SePay form generation failed: ' . $e->getMessage());
            }
        }

        return response()->json([
            'message' => 'Tạo yêu cầu nạp tiền thành công!',
            'data' => $deposit,
        ], 201);
    }

    public function sepayWebhook(Request $request)
    {
        try {
            // 1. Webhook Authorization Check
            $webhookToken = config('services.sepay.webhook_token') ?: config('services.sepay.api_token');
            if (!empty($webhookToken)) {
                $authHeader = $request->header('Authorization', '');
                $apikeyHeader = $request->header('Apikey', '');
                if (!str_contains($authHeader, $webhookToken) && $apikeyHeader !== $webhookToken && $request->bearerToken() !== $webhookToken && $request->input('token') !== $webhookToken) {
                    return response()->json(['success' => false, 'message' => 'Unauthorized Webhook'], 403);
                }
            }

            $content = $request->input('content') ?? $request->input('description') ?? $request->input('order_invoice_number') ?? $request->input('code') ?? '';
            $amount = floatval($request->input('transferAmount') ?? $request->input('amount') ?? $request->input('order_amount') ?? 0);
            $status = strtoupper($request->input('order_status') ?? $request->input('status') ?? 'SUCCESS');

            if (in_array($status, ['SUCCESS', 'PAID', 'CAPTURED', 'COMPLETED', 'PAID_SUCCESS']) || $request->input('transferType') === 'in' || !empty($content)) {
                $deposit = Deposit::where('status', 'pending')->get()->first(function ($item) use ($content) {
                    return str_contains($content, $item->code) || str_contains($item->code, $content);
                });

                if ($deposit && $deposit->status === 'pending') {
                    // 2. Amount Validation Check
                    if ($amount < floatval($deposit->amount)) {
                        return response()->json(['success' => false, 'message' => 'Amount too low']);
                    }

                    // 3. Race Condition Fix: Use DB transaction and pessimistic locking
                    \Illuminate\Support\Facades\DB::transaction(function () use ($deposit) {
                        $lockedDeposit = Deposit::where('id', $deposit->id)->lockForUpdate()->first();
                        if ($lockedDeposit && $lockedDeposit->status === 'pending') {
                            $lockedDeposit->status = 'approved';
                            $lockedDeposit->save();

                            $user = $lockedDeposit->user;
                            if ($user) {
                                $user->balance += $lockedDeposit->amount;
                                $user->save();
                            }
                        }
                    });
                }
            }

            return response()->json(['success' => true, 'message' => 'Processed']);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('SePay webhook error: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => $e->getMessage()], 400);
        }
    }

    public function checkSepayStatus(Request $request, $id)
    {
        try {
            $deposit = Deposit::where('id', $id)->where('user_id', Auth::id())->firstOrFail();

            if ($deposit->status === 'approved') {
                return response()->json([
                    'status' => 'approved',
                    'message' => 'Đơn nạp tiền này đã được thanh toán và duyệt thành công!',
                    'balance' => Auth::user()->balance
                ]);
            }

            $merchantId = config('services.sepay.merchant_id');
            $secretKey = config('services.sepay.secret_key');
            $apiToken = config('services.sepay.api_token') ?: $secretKey;
            $sepayEnv = config('services.sepay.env');

            // 1. Check SePay Payment Gateway Orders API
            if (!empty($merchantId) && !empty($secretKey)) {
                try {
                    $sepay = new \SePay\SePayClient($merchantId, $secretKey, $sepayEnv);
                    $res = $sepay->orders()->list(['q' => $deposit->code]);
                    $orders = is_array($res) && isset($res['data']) ? $res['data'] : (is_array($res) ? $res : []);

                    foreach ($orders as $o) {
                        $inv = is_array($o) ? ($o['order_invoice_number'] ?? $o['code'] ?? '') : ($o->order_invoice_number ?? $o->code ?? '');
                        $st = strtoupper(is_array($o) ? ($o['order_status'] ?? $o['status'] ?? '') : ($o->order_status ?? $o->status ?? ''));
                        if (($inv === $deposit->code || str_contains($inv, $deposit->code)) && in_array($st, ['SUCCESS', 'PAID', 'CAPTURED', 'COMPLETED', 'PAID_SUCCESS'])) {
                            \Illuminate\Support\Facades\DB::transaction(function () use ($deposit) {
                                $lockedDeposit = Deposit::where('id', $deposit->id)->lockForUpdate()->first();
                                if ($lockedDeposit && $lockedDeposit->status === 'pending') {
                                    $lockedDeposit->status = 'approved';
                                    $lockedDeposit->save();

                                    $user = $lockedDeposit->user;
                                    if ($user) {
                                        $user->balance += $lockedDeposit->amount;
                                        $user->save();
                                    }
                                }
                            });
                            
                            $deposit->refresh();

                            return response()->json([
                                'status' => 'approved',
                                'message' => 'SePay Payment Gateway xác nhận đã thanh toán thành công! Đã cộng ' . number_format($deposit->amount) . ' đ vào ví.',
                                'balance' => $deposit->user ? $deposit->user->balance : 0
                            ]);
                        }
                    }
                } catch (\Exception $ex) {
                    \Illuminate\Support\Facades\Log::warning('SePay PG check warning: ' . $ex->getMessage());
                }
            }

            // 2. Check SePay BankHub Transactions API (my.sepay.vn) for direct bank transfers via VietQR
            if (!empty($apiToken)) {
                try {
                    $ch = curl_init("https://my.sepay.vn/userapi/transactions/list?limit=50");
                    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                    curl_setopt($ch, CURLOPT_TIMEOUT, 3);
                    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 2);
                    curl_setopt($ch, CURLOPT_HTTPHEADER, [
                        "Authorization: Bearer " . $apiToken,
                        "Content-Type: application/json"
                    ]);
                    $response = curl_exec($ch);
                    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
                    curl_close($ch);

                    if ($httpCode === 200 && $response) {
                        $data = json_decode($response, true);
                        $transactions = $data['transactions'] ?? $data['data'] ?? (is_array($data) ? $data : []);

                        foreach ($transactions as $t) {
                            $content = is_array($t) ? ($t['transaction_content'] ?? $t['content'] ?? $t['description'] ?? '') : '';
                            $amountIn = is_array($t) ? floatval($t['amount_in'] ?? $t['transferAmount'] ?? $t['amount'] ?? 0) : 0;

                            \Illuminate\Support\Facades\Log::info("Checking BankHub: Content=[$content] vs Code=[{$deposit->code}], AmountIn=[$amountIn] vs DepositAmount=[" . floatval($deposit->amount) . "]");

                            if (stripos($content, $deposit->code) !== false && !empty($content) && $amountIn >= floatval($deposit->amount)) {
                                \Illuminate\Support\Facades\DB::transaction(function () use ($deposit) {
                                    $lockedDeposit = Deposit::where('id', $deposit->id)->lockForUpdate()->first();
                                    if ($lockedDeposit && $lockedDeposit->status === 'pending') {
                                        $lockedDeposit->status = 'approved';
                                        $lockedDeposit->save();

                                        $user = $lockedDeposit->user;
                                        if ($user) {
                                            $user->balance += $lockedDeposit->amount;
                                            $user->save();
                                        }
                                    }
                                });
                                
                                $deposit->refresh();

                                return response()->json([
                                    'status' => 'approved',
                                    'message' => 'SePay BankHub xác nhận bạn đã chuyển khoản thành công! Đã cộng ' . number_format($deposit->amount) . ' đ vào tài khoản.',
                                    'balance' => $deposit->user ? $deposit->user->balance : 0
                                ]);
                            }
                        }
                    } elseif ($httpCode === 401) {
                        return response()->json([
                            'status' => 'pending',
                            'message' => '⚠️ Bạn đã chuyển khoản qua VietQR nhưng SePay báo PENDING vì API Token trong .env chưa đúng cho SePay BankHub. Để check chuyển khoản VietQR tự động, vui lòng vào my.sepay.vn -> Cài đặt (API & Webhook) -> Tạo API Token rồi thêm SEPAY_API_TOKEN=mã_token_đó vào file backend/.env !'
                        ]);
                    }
                } catch (\Exception $ex) {
                    \Illuminate\Support\Facades\Log::warning('SePay BankHub check warning: ' . $ex->getMessage());
                }
            }

            return response()->json([
                'status' => 'pending',
                'message' => '⏳ Trạng thái hiện tại: PENDING (Chờ xác nhận). Nếu bạn vừa chuyển khoản qua VietQR, vui lòng đợi vài giây cho ngân hàng đồng bộ. (Lưu ý: Nếu test ở Localhost, bạn nhớ cấu hình SEPAY_API_TOKEN trong .env để check được chuyển khoản trực tiếp!)'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Lỗi kiểm tra SePay: ' . $e->getMessage()
            ], 400);
        }
    }

    public function renew(Request $request)
    {
        $user = Auth::user();
        $landingPageId = $request->input('landing_page_id');
        $months = (int) $request->input('months', 1);
        if ($months < 1) $months = 1;

        $page = null;
        $baseCost = 50000;
        if ($landingPageId) {
            $page = LandingPage::with('template')->where('id', $landingPageId)->where('user_id', $user->id)->first();
            if (!$page) {
                return response()->json([
                    'message' => 'Trang Landing Page cần gia hạn không tồn tại hoặc không thuộc quyền sở hữu của bạn.'
                ], 404);
            }
            $baseCost = ($page->template && !is_null($page->template->renewal_price)) ? (int) $page->template->renewal_price : 50000;
        }

        $cost = $baseCost * $months;

        if ($user->balance < $cost) {
            return response()->json([
                'message' => 'Rất tiếc, số dư hiện tại (' . number_format($user->balance) . ' VNĐ) không đủ để thanh toán ' . number_format($cost) . ' VNĐ. Vui lòng nạp thêm tiền vào tài khoản!'
            ], 400);
        }

        $user->balance -= $cost;
        $user->save();

        if ($page) {
            $curDate = $page->expires_at ? \Carbon\Carbon::parse($page->expires_at) : null;
            $baseDate = ($curDate && $curDate->isFuture()) ? $curDate : now();
            $page->expires_at = $baseDate->addDays(30 * $months);
            $page->save();
        } else {
            // Extend all expired or expiring pages for user
            foreach ($user->landingPages as $p) {
                $curDate = $p->expires_at ? \Carbon\Carbon::parse($p->expires_at) : null;
                $baseDate = ($curDate && $curDate->isFuture()) ? $curDate : now();
                $p->expires_at = $baseDate->addDays(30 * $months);
                $p->save();
            }
        }

        // Gói tài khoản (Subscription) có hiệu lực vĩnh viễn không hết hạn, chỉ gia hạn thời gian cho các Landing Page ở trên.

        return response()->json([
            'message' => 'Gia hạn trang thành công thêm ' . ($months * 30) . ' ngày! Số dư hiện tại của bạn là ' . number_format($user->balance) . ' VNĐ.',
            'balance' => $user->balance,
        ]);
    }
}
