import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { fetchPlans, upgradeSubscription } from "../../services/planApi";
import type { PlanResource } from "../../services/planApi";
import { fetchDeposits } from "../../services/depositApi";
import { fetchMe } from "../../services/meApi";
import DepositModal from "../../components/common/DepositModal";

export default function Upgrade() {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user) as any;
  const setUser = useAuthStore((s) => s.setUser);

  const [plans, setPlans] = useState<PlanResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [upgradingId, setUpgradingId] = useState<number | null>(null);
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: "insufficient" | "confirm";
    plan: PlanResource | null;
  }>({ isOpen: false, type: "confirm", plan: null });

  const loadAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPlans(token);
      setPlans(data);
    } catch (e: any) {
      setError(e?.message || "Không thể tải danh sách gói tài khoản.");
    } finally {
      setLoading(false);
    }

    if (token) {
      fetchDeposits(token)
        .then((depRes) => {
          if (depRes && depRes.balance !== undefined && user) {
            setUser({ ...user, balance: Number(depRes.balance) });
          }
        })
        .catch(() => {});
    }
  };

  useEffect(() => {
    loadAll();
  }, [token]);

  const handleUpgrade = async (plan: PlanResource) => {
    if (!token) {
      alert("Vui lòng đăng nhập để nâng cấp gói tài khoản!");
      return;
    }

    if (plan.price > 0 && (!user || Number(user.balance || 0) < Number(plan.price))) {
      setConfirmModal({ isOpen: true, type: "insufficient", plan });
      return;
    }

    setConfirmModal({ isOpen: true, type: "confirm", plan });
  };

  const executeUpgrade = async () => {
    const plan = confirmModal.plan;
    if (!plan || !token) return;
    setConfirmModal({ isOpen: false, type: "confirm", plan: null });

    setUpgradingId(plan.id);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await upgradeSubscription(token, plan.id);
      setSuccessMsg(res.message || "Nâng cấp gói tài khoản thành công!");
      if (res?.user) {
        const u = res.user.data || res.user;
        setUser(u);
      } else if (res.balance !== undefined && user) {
        setUser({ ...user, balance: Number(res.balance) });
      }
      try {
        const meRes = await fetchMe(token);
        const u = (meRes as any)?.data || meRes;
        if (u) setUser(u);
      } catch (err) {}
      loadAll();
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || "Nâng cấp gói thất bại.";
      alert(msg);
      setError(msg);
      if (msg.toLowerCase().includes("không đủ")) {
        setIsDepositOpen(true);
      }
    } finally {
      setUpgradingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      {/* Background gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-violet-600/15 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-emerald-600/15 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header section */}
        <div className="text-center mb-12">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-violet-500/10 border border-violet-400/30 text-violet-300 mb-3">
            OriginD Membership & Benefits
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white mb-4">
            Nâng Hạng Tài Khoản
          </h1>
          <p className="text-base sm:text-lg text-white/70 max-w-2xl mx-auto">
            Sử dụng số dư đã nạp trong ví của bạn để nâng hạng các gói đặc quyền. Bạn sẽ được gia hạn thêm thời gian sử dụng, mở rộng giới hạn tạo Landing Page và truy cập trọn bộ giao diện cao cấp.
          </p>

          {/* Current balance card */}
          {user ? (
            <div className="mt-8 inline-flex flex-wrap items-center justify-center gap-4 px-6 py-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-xl">
              <div className="text-left">
                <div className="text-xs text-white/60">Tài khoản hiện tại</div>
                <div className="text-sm font-semibold text-white/90">
                  {user.name} ({user.email})
                </div>
              </div>
              <div className="h-8 w-px bg-white/10 hidden sm:block" />
              <div className="text-left">
                <div className="text-xs text-white/60">Số dư ví (VNĐ)</div>
                <div className="text-lg font-black text-emerald-400 font-mono">
                  {Number(user.balance || 0).toLocaleString("vi-VN")} đ
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDepositOpen(true)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 font-bold text-xs text-white shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
              >
                + Nạp thêm tiền
              </button>
            </div>
          ) : null}
        </div>

        {/* Alerts */}
        {error ? (
          <div className="mb-8 max-w-3xl mx-auto p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-200 text-sm text-center">
            {error}
          </div>
        ) : null}

        {successMsg ? (
          <div className="mb-8 max-w-3xl mx-auto p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-200 text-sm font-medium text-center shadow-lg shadow-emerald-500/10 animate-fade-in">
            ↪︎ {successMsg}
          </div>
        ) : null}

        {/* Plans Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20 text-white/50 text-sm">
            Đang tải thông tin các gói tài khoản...
          </div>
        ) : plans.length === 0 ? (
          <div className="text-center py-20 text-white/50 text-sm bg-white/5 rounded-2xl border border-white/10">
            Chưa có gói tài khoản nào được định nghĩa trong hệ thống.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {plans.map((p) => {
              const isFree = Number(p.price) <= 0;
              const isPopular = p.is_popular;

              return (
                <div
                  key={p.id}
                  className={`relative flex flex-col justify-between p-6 sm:p-8 rounded-3xl backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1 ${
                    isPopular
                      ? "bg-gradient-to-b from-violet-900/40 via-slate-900/80 to-slate-900 border-2 border-violet-500/60 shadow-2xl shadow-violet-500/20"
                      : "bg-white/5 border border-white/10 hover:border-white/20 shadow-xl"
                  }`}
                >
                  {isPopular ? (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 text-[11px] font-extrabold text-white uppercase tracking-wider shadow-lg">
                      OriginD
                    </div>
                  ) : null}

                  <div>
                    <div className="flex justify-between items-start gap-4 mb-3">
                      <h3 className="text-2xl font-black text-white">{p.name}</h3>
                      <span className="px-2.5 py-1 rounded-lg bg-white/10 text-xs font-mono font-bold text-white/80">
                        Vĩnh viễn
                      </span>
                    </div>

                    <p className="text-sm text-white/65 min-h-[40px] mb-6">
                      {p.description || "Đầy đủ tiện ích và tính năng vượt trội giúp tối ưu hóa chuyển đổi Landing Page."}
                    </p>

                    <div className="mb-6 pb-6 border-b border-white/10">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight">
                          {isFree ? "Miễn Phí" : `${Number(p.price).toLocaleString("vi-VN")} đ`}
                        </span>
                        {!isFree ? (
                          <span className="text-xs text-emerald-400 font-semibold">/ Vĩnh viễn</span>
                        ) : null}
                      </div>
                    </div>

                    {/* Features checklist */}
                    <div className="space-y-3.5 mb-8 text-sm">
                      <div className="flex items-center gap-3 text-white/90">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs">
                          ✓
                        </span>
                        <span>
                          Giới hạn tạo: <strong className="text-white font-mono">{p.landing_page_limit > 900000 ? "Không giới hạn" : (isFree ? `${p.landing_page_limit} trang` : `+ ${p.landing_page_limit} trang`)}</strong>
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-white/90">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs">
                          ✓
                        </span>
                        <Link to="/domain-guide" className="text-white/90 hover:text-emerald-400 hover:underline transition underline-offset-4 decoration-emerald-400/30">
                          Hỗ trợ kết nối tên miền riêng ( click vào để xem chi tiết )
                        </Link>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleUpgrade(p)}
                    disabled={isFree || upgradingId === p.id}
                    className={`w-full py-3 px-4 rounded-2xl font-bold text-sm transition-all duration-200 ${
                      isFree
                        ? "bg-white/5 text-white/40 cursor-not-allowed border border-white/5"
                        : isPopular
                        ? "bg-transparent border border-violet-500 text-violet-300 hover:bg-violet-500/10 active:scale-[0.98]"
                        : "bg-transparent border border-white/30 text-white hover:bg-white/10 active:scale-[0.98]"
                    }`}
                  >
                    {upgradingId === p.id
                      ? "Đang xử lý nâng hạng..."
                      : isFree
                      ? "Gói Tài Khoản Mặc Định"
                      : `Nâng Hạng ${p.name} Ngay`}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer notes */}
        <div className="mt-12 p-6 rounded-2xl bg-white/5 border border-white/10 text-xs text-white/60 space-y-2">
          <div className="font-semibold text-white/80">Lưu ý về chính sách nâng hạng:</div>
          <ul className="list-disc pl-5 space-y-1">
            <li>Số tiền nâng gói được trừ trực tiếp từ số dư ví hiện có trong tài khoản của bạn.</li>
            <li>Ngay sau khi nâng hạng thành công, giới hạn tạo trang sẽ được cộng thêm theo gói tương ứng của bạn.</li>
            <li>Nếu bạn muốn nạp tiền hoặc gặp trở ngại trong quá trình thanh toán, vui lòng nhấn nút "Hỗ trợ" trên thanh menu để liên hệ đội ngũ kỹ thuật OriginD.</li>
            <li>Để sử dụng tên miền riêng vui lòng liên hệ hỗ trợ để được tư vấn kích hoạt tối ưu nhất.</li>
          </ul>
        </div>
      </div>

      <DepositModal
        isOpen={isDepositOpen}
        onClose={() => setIsDepositOpen(false)}
        onSuccess={() => loadAll()}
      />

      {/* Confirmation & Insufficient Balance Modal */}
      {confirmModal.isOpen && confirmModal.plan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 animate-backdrop">
          <div className="bg-[#0f172a] border border-white/10 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl animate-popup relative">
            <button
              onClick={() => setConfirmModal({ isOpen: false, type: "confirm", plan: null })}
              className="absolute top-4 right-4 text-white/40 hover:text-white transition"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
            
            {confirmModal.type === "insufficient" ? (
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/20 text-3xl text-rose-400">
                  ⚠️
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Số dư không đủ</h3>
                <p className="text-sm text-white/70 leading-relaxed mb-6">
                  Số dư của bạn (<strong className="text-rose-400">{Number(user?.balance || 0).toLocaleString("vi-VN")} VNĐ</strong>) không đủ để nâng cấp gói "{confirmModal.plan.name}" (<strong className="text-emerald-400">{Number(confirmModal.plan.price).toLocaleString("vi-VN")} VNĐ</strong>). Vui lòng nạp thêm tiền!
                </p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setConfirmModal({ isOpen: false, type: "confirm", plan: null })}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-white/70 hover:bg-white/5 font-semibold transition text-sm"
                  >
                    Đóng
                  </button>
                  <button
                    onClick={() => {
                      setConfirmModal({ isOpen: false, type: "confirm", plan: null });
                      setIsDepositOpen(true);
                    }}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-transparent border border-emerald-500 text-emerald-400 hover:bg-emerald-500/10 font-bold transition text-sm"
                  >
                    Nạp tiền ngay
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <h3 className="text-xl font-bold text-white mb-2">Xác nhận nâng hạng</h3>
                <p className="text-sm text-white/70 leading-relaxed mb-6">
                  Bạn có chắc chắn muốn sử dụng <strong className="text-emerald-400">{Number(confirmModal.plan.price).toLocaleString("vi-VN")} VNĐ</strong> từ số dư ví để nâng cấp lên gói <strong className="text-violet-300">"{confirmModal.plan.name}"</strong>?
                </p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setConfirmModal({ isOpen: false, type: "confirm", plan: null })}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-white/70 hover:bg-white/5 font-semibold transition text-sm"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    onClick={executeUpgrade}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-transparent border border-violet-500/50 text-violet-400 hover:border-violet-400 hover:bg-violet-500/10 font-bold transition text-sm"
                  >
                    Xác nhận mua
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
