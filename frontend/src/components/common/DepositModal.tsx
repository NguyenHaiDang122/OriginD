import { useState, useEffect } from "react";
import { createDeposit, fetchDeposits, checkSepayDeposit, type DepositRecord } from "../../services/depositApi";
import { useAuthStore } from "../../store/authStore";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialAmount?: number;
};

export default function DepositModal({ isOpen, onClose, onSuccess, initialAmount }: Props) {
  const token = useAuthStore((s) => s.token);
  const [amount, setAmount] = useState<number>(initialAmount || 50000);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [deposit, setDeposit] = useState<DepositRecord | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [copiedType, setCopiedType] = useState<"code" | "account" | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false);
  const [sessionExpired, setSessionExpired] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(10 * 60);

  useEffect(() => {
    if (isOpen && token) {
      setAmount(initialAmount || 50000);
      setCustomAmount("");
      setDeposit(null);
      setError(null);
      fetchDeposits(token)
        .then((res) => setBalance(Number(res.balance || 0)))
        .catch(() => {});
    }
  }, [isOpen, token, initialAmount]);

  useEffect(() => {
    if (!deposit || !isOpen) {
      setSessionExpired(false);
      return;
    }

    const startTime = Date.now();
    let isExpired = false;
    setTimeLeft(10 * 60);

    const countdownTimer = setInterval(() => {
      if (isExpired) return;
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const remaining = 10 * 60 - elapsed;
      
      // delay check thanh toán (hết 10 phút thì dừng check)
      if (remaining <= 0) {
        isExpired = true;
        setSessionExpired(true);
        setTimeLeft(0);
      } else {
        setTimeLeft(remaining);
      }
    }, 1000);

    const checkNow = async () => {
      if (isExpired) return;

      try {
        const res = await checkSepayDeposit(token, deposit.id);
        if (res.status === "approved") {
          isExpired = true;
          if (res.balance !== undefined) {
            setBalance(Number(res.balance));
          }
          if (onSuccess) onSuccess();
          
          setPaymentSuccess(true);
          setTimeout(() => {
            setPaymentSuccess(false);
            onClose();
          }, 3000);
        }
      } catch (e) {}
    };

    const timer = setInterval(checkNow, 5000);

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        checkNow();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("focus", checkNow);

    return () => {
      clearInterval(timer);
      clearInterval(countdownTimer);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("focus", checkNow);
    };
  }, [deposit, isOpen, token]);

  if (!isOpen) return null;

  if (paymentSuccess) {
    return (
      <>
        <style>{`
          @keyframes fadeOutGlobal {
            0% { opacity: 1; transform: scale(0.95); }
            10% { opacity: 1; transform: scale(1); }
            75% { opacity: 1; transform: scale(1); }
            100% { opacity: 0; transform: scale(1.05); }
          }
        `}</style>
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4"
          style={{ animation: 'fadeOutGlobal 3s ease-in-out forwards' }}
        >
          <div className="relative w-full max-w-sm rounded-3xl border border-emerald-400/20 bg-emerald-500/5 p-8 text-center backdrop-blur-2xl shadow-[0_0_50px_-15px_rgba(52,211,153,0.25)] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/5 via-transparent to-teal-500/5 pointer-events-none" />
            <h3 className="relative text-lg md:text-xl font-bold tracking-[0.1em] text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-emerald-300 uppercase mb-3 drop-shadow-sm">
              Thanh Toán Thành Công
            </h3>
            <div className="relative inline-block rounded-full border border-emerald-400/30 bg-emerald-500/10 px-4 py-1.5 text-sm font-bold text-emerald-200 tracking-wide shadow-[0_0_15px_-5px_rgba(52,211,153,0.3)]">
              +{Number(deposit?.amount || 0).toLocaleString('vi-VN')} VNĐ
            </div>
          </div>
        </div>
      </>
    );
  }

  const presets = [50000, 100000, 200000, 500000];

  async function handleCreateQR() {
    const finalAmount = customAmount ? Number(customAmount) : amount;
    if (finalAmount < 10000) {
      setError("Số tiền nạp tối thiểu là 10,000 VNĐ");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await createDeposit(token, { amount: finalAmount });
      setDeposit(res.data);
    } catch (e: any) {
      setError(e?.response?.data?.message || "Không thể tạo yêu cầu nạp tiền");
    } finally {
      setLoading(false);
    }
  }

  function handleCopy(type: "code" | "account", text: string) {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-3xl border border-white/20 bg-gradient-to-b from-slate-900/95 to-slate-950/95 p-6 sm:p-6 shadow-2xl text-white">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-all text-sm font-bold"
        >
          ✕
        </button>

        <div className="flex items-center gap-3 mb-6">
          <img 
            src="/logo.png" 
            alt="OriginD Logo" 
            className="h-12 w-12 rounded-2xl object-cover shadow-lg shadow-black/20"
          />
          <div>
            <h3 className="text-xl font-extrabold tracking-tight">Nạp tiền vào tài khoản</h3>
            <p className="text-xs text-white/60">
              Số dư hiện tại: <span className="font-bold text-violet-300 text-sm">{balance.toLocaleString("vi-VN")} đ</span>
            </p>
          </div>
        </div>

        {!deposit ? (
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-white/70 mb-3">
                1. Chọn nhanh số tiền nạp (VNĐ)
              </label>
              <div className="grid grid-cols-2 gap-3">
                {presets.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      setAmount(preset);
                      setCustomAmount("");
                    }}
                    className={`rounded-xl border py-3 text-sm font-bold transition-all ${
                      amount === preset && !customAmount
                        ? "border-violet-400 bg-violet-600/30 text-white shadow-lg shadow-violet-500/20 scale-105"
                        : "border-white/15 bg-white/5 text-white/80 hover:bg-white/10"
                    }`}
                  >
                    {preset.toLocaleString("vi-VN")} đ
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-white/70 mb-2">
                Hoặc nhập số tiền khác
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={customAmount ? Number(customAmount).toLocaleString("vi-VN") : ""}
                onChange={(e) => {
                  const rawValue = e.target.value.replace(/\D/g, "");
                  setCustomAmount(rawValue);
                }}
                placeholder="Nhập số tiền VNĐ (vd: 150.000)"
                className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 outline-none focus:border-violet-400 font-semibold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>

            {error ? (
              <div className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-xs text-rose-200">
                {error}
              </div>
            ) : null}

            <button
              type="button"
              onClick={handleCreateQR}
              disabled={loading}
              className="w-full rounded-2xl bg-transparent border border-violet-400/40 py-3.5 text-sm font-bold text-violet-100 hover:bg-violet-500/10 hover:border-violet-400/60 transition-all disabled:opacity-50"
            >
              {loading ? "Đang tạo đơn..." : "Tiếp tục - Mở cổng thanh toán tự động"}
            </button>
          </div>
        ) : deposit.checkout_url || deposit.sepay_fields ? (
          <div className="space-y-6">
            <div className="rounded-3xl border border-violet-400/40 bg-gradient-to-b from-violet-900/40 via-indigo-950/60 to-slate-900/80 p-6 text-center space-y-5 shadow-2xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-violet-500/20 border border-violet-400/30 px-3.5 py-1 text-xs font-bold text-violet-300 tracking-wide">
                ⚡ CỔNG THANH TOÁN TỰ ĐỘNG SEPAY
              </div>

              <div className="space-y-1 py-2">
                <p className="text-xs text-white/60 font-medium">Số tiền cần thanh toán:</p>
                <div className="text-3xl font-black tracking-tight text-white drop-shadow-md">
                  {Number(deposit.amount).toLocaleString("vi-VN")} <span className="text-violet-400 text-xl font-bold">VNĐ</span>
                </div>
              </div>

              <p className="text-xs text-white/80 leading-relaxed px-3">
                Hệ thống đã chuẩn bị phiên thanh toán bảo mật với <b>SePay Payment Gateway</b>. Vui lòng bấm vào nút bên dưới để tiến hành thanh toán (Hỗ trợ quét VietQR tự động, Chuyển khoản 24/7 & Thẻ ATM):
              </p>

              {deposit.sepay_fields ? (
                <form method="POST" action={deposit.checkout_url || "https://pg.sepay.vn/v1/checkout/init"} target="_blank">
                  {Object.entries(deposit.sepay_fields).map(([k, v]) => (
                    <input key={k} type="hidden" name={k} value={String(v)} />
                  ))}
                  <button
                    type="submit"
                    className="w-full rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 py-4 text-sm font-black text-white shadow-xl shadow-violet-500/40 hover:from-violet-500 hover:to-purple-500 transition-all transform hover:scale-[1.02] active:scale-95 border border-violet-300/30 flex items-center justify-center gap-2"
                  >
                    <span>🌐 BẤM ĐỂ MỞ TRANG THANH TOÁN SEPAY →</span>
                  </button>
                </form>
              ) : (
                <a
                  href={deposit.checkout_url}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 py-4 text-sm font-black text-white shadow-xl shadow-violet-500/40 hover:from-violet-500 hover:to-purple-500 transition-all transform hover:scale-[1.02] active:scale-95 border border-violet-300/30"
                >
                  <span>🌐 BẤM ĐỂ MỞ TRANG THANH TOÁN SEPAY →</span>
                </a>
              )}

              <div className="pt-3 flex items-center justify-center text-xs text-emerald-300/90 border-t border-white/10 mt-5 px-1">
                <span className="flex items-center gap-2 font-semibold">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  Hệ thống đang tự động xác nhận thanh toán (siêu tốc)...
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-3 flex flex-col sm:flex-row items-center justify-center gap-1.5">
              <span className="text-[11px] sm:text-xs font-semibold text-emerald-300">
                QUÉT MÃ QR ĐỂ NẠP TIỀN TỰ ĐỘNG -
              </span>
              <div className="flex items-center gap-1 text-[11px] sm:text-xs font-bold text-emerald-300">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="tracking-wider">
                  {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                </span>
              </div>
            </div>

            {deposit && !sessionExpired && (
              <div className="mt-6 flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-stretch">
                  <div className="flex-shrink-0 flex items-center justify-center bg-white p-3 rounded-2xl shadow-xl w-fit">
                    <img
                      src={`https://qr.sepay.vn/img?acc=19599691&bank=ACB&amount=${deposit.amount}&des=${deposit.code}`}
                      alt="VietQR"
                      className="h-32 w-32 sm:h-36 sm:w-36 object-contain rounded-xl"
                    />
                  </div>
                  
                  <div className="w-full flex-1 rounded-2xl bg-white/5 p-4 border border-white/10 flex flex-col justify-center space-y-2 relative overflow-hidden">
                    <div className="flex flex-col border-b border-white/10 pb-2 gap-0.5">
                      <span className="text-white/60 text-[11px] uppercase tracking-wider">Chủ tài khoản:</span>
                      <span className="font-bold text-white tracking-wider text-sm">NGUYEN HAI DANG</span>
                    </div>
                    <div className="flex flex-col border-b border-white/10 pb-2 gap-0.5">
                      <span className="text-white/60 text-[11px] uppercase tracking-wider">Số tài khoản:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white tracking-wider text-sm">19599691</span>
                        <button
                          type="button"
                          onClick={() => handleCopy("account", "19599691")}
                          className="rounded bg-white/10 px-2 py-0.5 text-[10px] font-bold hover:bg-white/20 transition-all text-white flex-shrink-0"
                        >
                          {copiedType === "account" ? "Đã chép!" : "Copy"}
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col pb-1 gap-0.5">
                      <span className="text-white/60 text-[11px] uppercase tracking-wider">Nội dung CK:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-amber-300 text-sm bg-amber-500/20 px-2 py-0.5 rounded border border-amber-400/40 tracking-wider break-all text-center">
                          {deposit.code}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy("code", deposit.code)}
                          className="rounded bg-white/10 px-2.5 py-0.5 text-[10px] font-bold hover:bg-white/20 transition-all text-white flex-shrink-0"
                        >
                          {copiedType === "code" ? "Đã chép!" : "Copy"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="w-full rounded-xl border border-emerald-400/20 bg-emerald-500/10 py-3.5 flex items-center justify-center gap-3 shadow-inner">
                  <div className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </div>
                  <span className="text-xs font-bold text-emerald-400 tracking-wide">
                    Hệ thống OriginD đang kiểm tra thanh toán...
                  </span>
                </div>
              </div>
            )}


            {sessionExpired && (
              <div className="mt-8 flex flex-col items-center">
                <div className="w-full rounded-2xl bg-rose-500/10 p-6 border border-rose-500/20 text-center">
                  <div className="w-12 h-12 rounded-full bg-rose-500/20 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-bold text-rose-300 mb-2">Phiên thanh toán hết hạn</h4>
                  <p className="text-sm text-white/70 mb-6">Đã quá 10 phút không ghi nhận thanh toán. Vui lòng tạo phiên thanh toán mới nếu bạn muốn tiếp tục nạp tiền.</p>
                  <button
                    onClick={() => {
                      setDeposit(null);
                      setSessionExpired(false);
                    }}
                    className="px-6 py-2 rounded-xl bg-white/10 text-white font-medium hover:bg-white/20 transition-colors border border-white/20"
                  >
                    Tạo phiên mới
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
