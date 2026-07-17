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
  const [checkingStatus, setCheckingStatus] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && token) {
      if (initialAmount) setAmount(initialAmount);
      setDeposit(null);
      setError(null);
      fetchDeposits(token)
        .then((res) => setBalance(Number(res.balance || 0)))
        .catch(() => {});
    }
  }, [isOpen, token, initialAmount]);

  useEffect(() => {
    if (!deposit || !isOpen) return;

    const checkNow = async () => {
      try {
        const res = await checkSepayDeposit(token, deposit.id);
        if (res.status === "approved") {
          if (res.balance !== undefined) setBalance(Number(res.balance));
          if (onSuccess) onSuccess();
          onClose();
        }
      } catch (e) {}
    };

    const timer = setInterval(checkNow, 1500);

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        checkNow();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("focus", checkNow);

    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("focus", checkNow);
    };
  }, [deposit, isOpen, token]);

  if (!isOpen) return null;

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

  function handleCopyCode() {
    if (deposit) {
      navigator.clipboard.writeText(deposit.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  async function handleCheckSepayStatus() {
    if (!deposit) return;
    setCheckingStatus(true);
    try {
      const res = await checkSepayDeposit(token, deposit.id);
      if (res.status === "approved") {
        if (res.balance !== undefined) setBalance(Number(res.balance));
        if (onSuccess) onSuccess();
        onClose();
        alert(res.message || "🎉 Đã xác nhận thanh toán thành công và cộng tiền vào ví!");
      } else {
        alert(res.message || "Đơn hàng vẫn đang ở trạng thái chờ thanh toán.");
      }
    } catch (e: any) {
      alert(e?.response?.data?.message || "Lỗi khi kiểm tra trạng thái thanh toán!");
    } finally {
      setCheckingStatus(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-3xl border border-white/20 bg-gradient-to-b from-slate-900/95 to-slate-950/95 p-6 sm:p-8 shadow-2xl text-white">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-all text-sm font-bold"
        >
          ✕
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 text-2xl shadow-lg shadow-violet-500/30">
            ord
          </div>
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
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
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
                type="number"
                min={10000}
                step={10000}
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder="Nhập số tiền VNĐ (vd: 150000)"
                className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 outline-none focus:border-violet-400 font-semibold"
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
              className="w-full rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-violet-500/30 hover:from-violet-500 hover:to-indigo-500 transition-all disabled:opacity-50"
            >
              {loading ? "Đang tạo đơn..." : "Tiếp tục - Mở cổng thanh toán SePay"}
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
          <div className="space-y-6">
            <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4 text-center">
              <span className="text-xs font-semibold text-emerald-300">
                ✅ Mã VietQR ACB đã được tạo! Quét bằng ứng dụng ngân hàng bất kỳ để chuyển khoản tự động.
              </span>
            </div>

            <div className="flex flex-col items-center justify-center bg-white p-4 rounded-2xl shadow-xl">
              <img
                src={`https://img.vietqr.io/image/ACB-19599691-compact2.jpg?amount=${deposit.amount}&addInfo=${encodeURIComponent(deposit.code)}&accountName=NGUYEN%20HAI%20DANG`}
                alt="VietQR ACB"
                className="w-64 h-auto sm:w-72 rounded-xl"
              />
            </div>

            <div className="rounded-2xl border border-white/15 bg-white/5 p-4 space-y-2.5 text-xs">
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-white/60">Ngân hàng:</span>
                <span className="font-bold text-white">ACB (Ngân hàng Á Châu)</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-white/60">Số tài khoản:</span>
                <span className="font-bold text-white text-sm tracking-wider">19599691</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-white/60">Chủ tài khoản:</span>
                <span className="font-bold text-white">NGUYEN HAI DANG</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-white/60">Số tiền:</span>
                <span className="font-extrabold text-violet-300 text-sm">
                  {Number(deposit.amount).toLocaleString("vi-VN")} VNĐ
                </span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-white/60">Nội dung CK (Bắt buộc):</span>
                <div className="flex items-center gap-2">
                  <span className="font-black text-amber-300 text-sm bg-amber-500/20 px-2 py-0.5 rounded border border-amber-400/40 tracking-wider">
                    {deposit.code}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="rounded bg-white/10 px-2 py-1 text-[10px] font-bold hover:bg-white/20 transition-all text-white"
                  >
                    {copied ? "Đã chép!" : "Copy"}
                  </button>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-white/60 text-center italic">
              * Hệ thống SePay sẽ tự động cộng tiền ngay khi nhận được thanh toán, hoặc bạn bấm kiểm tra trạng thái bên dưới.
            </p>

            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                onClick={handleCheckSepayStatus}
                disabled={checkingStatus}
                className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 py-3 text-xs font-bold text-white shadow-lg shadow-amber-500/30 hover:from-amber-600 hover:to-orange-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <span>🔄 Kiểm tra trạng thái thanh toán SePay {checkingStatus ? "..." : "(Bấm nếu đã chuyển khoản xong)"}</span>
              </button>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setDeposit(null)}
                  className="w-1/3 rounded-xl border border-white/15 bg-white/5 py-3 text-xs font-semibold text-white/80 hover:bg-white/10 transition-all"
                >
                  ← Tạo đơn khác
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (onSuccess) onSuccess();
                    onClose();
                  }}
                  className="w-2/3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3 text-xs font-bold text-white shadow-lg shadow-emerald-500/30 hover:from-emerald-500 hover:to-teal-500 transition-all"
                >
                  ✅ Hoàn tất & Đóng
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
