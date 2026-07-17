import { useState, useEffect } from "react";
import GlassCard from "../../components/common/GlassCard";
import PageSection from "../../components/common/PageSection";
import { useAuthStore } from "../../store/authStore";
import { fetchDeposits, checkSepayDeposit } from "../../services/depositApi";
import { fetchMe } from "../../services/meApi";
import DepositModal from "../../components/common/DepositModal";

export default function Profile() {
  const token = useAuthStore((s) => s.token);
  const user: any = useAuthStore((s) => s.user);
  const [balance, setBalance] = useState<number>(Number(user?.balance || 0));
  const [isDepositOpen, setIsDepositOpen] = useState(false);

  const refreshBalance = () => {
    if (token) {
      fetchDeposits(token)
        .then((res) => {
          const newBal = Number(res.balance || 0);
          setBalance(newBal);
          useAuthStore.getState().updateBalance(newBal);
        })
        .catch(() => {});
    }
  };

  const checkSepayOrders = () => {
    if (token) {
      fetchDeposits(token)
        .then(async (res) => {
          const list = res.deposits || [];
          const pendingList = list.filter((d: any) => d.status === "pending");
          let hasApproved = false;
          for (const d of pendingList) {
            try {
              const checkRes = await checkSepayDeposit(token, d.id);
              if (checkRes.status === "approved") {
                hasApproved = true;
              }
            } catch (e) {}
          }
          if (hasApproved || window.location.search.includes("payment=success")) {
            refreshBalance();
          }
        })
        .catch(() => {});
    }
  };

  useEffect(() => {
    refreshBalance();
    checkSepayOrders();
    if (token) {
      fetchMe(token)
        .then((res) => {
          const u = (res as any)?.data || res;
          if (u) useAuthStore.getState().setUser(u);
        })
        .catch(() => {});
    }

    const handleFocus = () => {
      refreshBalance();
      checkSepayOrders();
      if (token) {
        fetchMe(token)
          .then((res) => {
            const u = (res as any)?.data || res;
            if (u) useAuthStore.getState().setUser(u);
          })
          .catch(() => {});
      }
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [token]);

  const planName = user?.subscription?.plan?.name || (user?.landing_page_limit > 1 ? `Gói ${user?.landing_page_limit} trang` : "Starter / Miễn phí");

  return (
    <div>
      <PageSection
        title="Hồ Sơ Của Bạn (Profile)"
        subtitle="Quản lý thông tin tài khoản, số dư khả dụng và cấu hình cá nhân"
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <GlassCard title="Thông tin cơ bản" subtitle="Tài khoản & Ví tiền">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 text-xl font-bold text-white shadow-lg">
                {(user?.name ?? "U")[0].toUpperCase()}
              </div>
              <div>
                <div className="text-white/95 font-bold text-lg">{user?.name ?? "Người dùng"}</div>
                <div className="text-white/60 text-sm font-mono">{user?.email ?? "user@example.com"}</div>
              </div>
            </div>

            {/* Banner hiển thị số dư nổi bật */}
            <div className="mt-5 rounded-2xl border border-emerald-400/40 bg-gradient-to-r from-emerald-500/15 via-teal-500/15 to-violet-500/15 p-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold text-emerald-200">
                  <span className="text-lg">💰</span>
                  <span>Số dư khả dụng:</span>
                </div>
                <div className="text-right">
                  <span className="font-black text-emerald-300 text-xl tracking-wide">
                    {balance.toLocaleString("vi-VN")} VNĐ
                  </span>
                </div>
              </div>
              <p className="mt-1 text-[11px] text-white/60 italic">
                * Dùng để gia hạn dịch vụ các trang Landing Page theo mức giá quy định của từng mẫu giao diện
              </p>
            </div>

            <div className="mt-5 space-y-3 text-sm border-t border-white/10 pt-4">
              <div className="flex justify-between gap-4">
                <span className="text-white/60">Gói tài khoản (Plan)</span>
                <span className="font-semibold text-violet-300">{planName}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-white/60">Trạng thái</span>
                <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-300">
                  ⚡ Hoạt động
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-white/60">Quyền hạn (Role)</span>
                <span className="text-white/80 font-medium">{user?.role ?? "User"}</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={() => setIsDepositOpen(true)}
                className="primary-btn w-full py-3 flex items-center justify-center gap-2 font-bold shadow-lg shadow-violet-500/30"
              >
                <span>💰 Nạp Thêm Tiền Vào Tài Khoản</span>
              </button>
            </div>
          </GlassCard>

          <GlassCard title="Cài đặt tài khoản" subtitle="Cập nhật bảo mật">
            <div className="space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-sm text-white/85 font-semibold">Email đăng nhập</div>
                <div className="text-xs text-white/60 font-mono mt-1">{user?.email ?? "Chưa có email"}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-sm text-white/85 font-semibold">Mật khẩu bảo mật</div>
                <div className="text-xs text-white/60 mt-1 flex items-center justify-between">
                  <span>••••••••••••</span>
                  <button type="button" className="text-violet-400 hover:underline">Đổi mật khẩu</button>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <button type="button" className="ghost-btn w-full py-2.5">Lưu thay đổi</button>
            </div>
          </GlassCard>

          <GlassCard title="Thống kê hoạt động" subtitle="Tổng hợp nhanh">
            <div className="space-y-4 text-sm">
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-3.5">
                <span className="text-white/70">Số dư hiện tại</span>
                <span className="font-bold text-emerald-300">{balance.toLocaleString("vi-VN")} đ</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-3.5">
                <span className="text-white/70">Templates đã dùng</span>
                <span className="font-bold text-violet-300">Kho giao diện</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-3.5">
                <span className="text-white/70">Landing Pages đã tạo</span>
                <span className="font-bold text-teal-300">{user?.landing_pages_count ?? 0} / {user?.landing_page_limit > 900000 ? "∞" : user?.landing_page_limit ?? 1} trang</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-3.5">
                <span className="text-white/70">Gói tài khoản hiện tại</span>
                <span className="font-bold text-amber-300">{planName}</span>
              </div>
            </div>
          </GlassCard>
        </div>
      </PageSection>

      <DepositModal
        isOpen={isDepositOpen}
        onClose={() => {
          setIsDepositOpen(false);
          checkSepayOrders();
          refreshBalance();
        }}
        onSuccess={() => {
          checkSepayOrders();
          refreshBalance();
        }}
      />
    </div>
  );
}
