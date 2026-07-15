import GlassCard from "../../components/common/GlassCard";
import PageSection from "../../components/common/PageSection";
import { useAuthStore } from "../../store/authStore";

export default function Profile() {
  const user: any = useAuthStore((s) => s.user);

  return (
    <div>
      <PageSection
        title="Hồ Sơ Của Bạn (Profile)"
        subtitle="Quản lý thông tin tài khoản và cấu hình cá nhân"
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <GlassCard title="Thông tin cơ bản" subtitle="Tài khoản cá nhân">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 text-xl font-bold text-white shadow-lg">
                {(user?.name ?? "U")[0].toUpperCase()}
              </div>
              <div>
                <div className="text-white/95 font-bold text-lg">{user?.name ?? "Người dùng"}</div>
                <div className="text-white/60 text-sm font-mono">{user?.email ?? "user@example.com"}</div>
              </div>
            </div>
            <div className="mt-6 space-y-3 text-sm border-t border-white/10 pt-4">
              <div className="flex justify-between gap-4">
                <span className="text-white/60">Gói tài khoản (Plan)</span>
                <span className="font-semibold text-violet-300">Starter / Miễn phí</span>
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
              <button className="primary-btn w-full py-2.5">Nâng cấp gói VIP</button>
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
                  <button className="text-violet-400 hover:underline">Đổi mật khẩu</button>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <button className="ghost-btn w-full py-2.5">Lưu thay đổi</button>
            </div>
          </GlassCard>

          <GlassCard title="Thống kê hoạt động" subtitle="Tổng hợp nhanh">
            <div className="space-y-4 text-sm">
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-3.5">
                <span className="text-white/70">Templates đã dùng</span>
                <span className="font-bold text-violet-300">Khám phá ngay</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-3.5">
                <span className="text-white/70">Landing Pages tạo</span>
                <span className="font-bold text-emerald-300">Xem tại Thống kê</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-3.5">
                <span className="text-white/70">Dịch Vụ Miễn Phí</span>
                <span className="font-bold text-amber-300">Sẵn sàng</span>
              </div>
            </div>
          </GlassCard>
        </div>
      </PageSection>
    </div>
  );
}
