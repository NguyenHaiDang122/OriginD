import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import GlassCard from "../../components/common/GlassCard";
import PageSection from "../../components/common/PageSection";
import { fetchAdminTemplates } from "../../services/templateApi";
import { useAuthStore } from "../../store/authStore";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user) as any;

  const [templateCount, setTemplateCount] = useState<number | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function loadStats() {
      if (!token) return;
      setLoadingStats(true);
      try {
        const res = await fetchAdminTemplates(token);
        const list = Array.isArray((res as any)?.data)
          ? (res as any).data
          : Array.isArray(res)
            ? res
            : [];
        if (mounted) {
          setTemplateCount(list.length);
        }
      } catch {
        if (mounted) setTemplateCount(0);
      } finally {
        if (mounted) setLoadingStats(false);
      }
    }
    loadStats();
    return () => {
      mounted = false;
    };
  }, [token]);

  return (
    <div className="space-y-8">
      {/* Admin Hero Section */}
      <section className="relative overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-r from-slate-900/90 via-indigo-950/60 to-slate-900/90 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl">
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -left-24 -bottom-24 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />

        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300 mb-3">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)] animate-pulse" />
              OriginD • Admin Control Panel
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white/95">
              Trung tâm Quản trị Hệ thống
            </h1>
            <p className="mt-2 text-sm sm:text-base text-white/65 max-w-2xl">
              Xin chào <span className="font-semibold text-white/90">{user?.name ?? user?.email ?? "Administrator"}</span>. Đây là trang điều hành chính. Chọn các danh mục quản trị dưới đây để thiết lập dữ liệu và kiểm soát hệ thống.
            </p>
          </div>

          <div className="flex flex-col sm:items-end gap-2 shrink-0">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center sm:text-right backdrop-blur-md">
              <div className="text-xs text-white/50">Tổng số Templates</div>
              <div className="text-2xl font-black text-violet-300">
                {loadingStats ? "..." : templateCount ?? 0}
              </div>
            </div>
          </div>
        </div>
      </section>

      <PageSection
        title="Menu Quản Trị Hệ Thống"
        subtitle="Chọn phân hệ chức năng bạn muốn vận hành"
      />

      {/* Admin Menu Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Card 1: Quản Trị Templates (Main Request) */}
        <div
          onClick={() => navigate("/admin/templates")}
          className="group relative cursor-pointer overflow-hidden rounded-3xl border border-violet-400/30 bg-gradient-to-br from-violet-900/30 via-slate-900/60 to-indigo-900/30 p-6 backdrop-blur-xl transition duration-300 hover:-translate-y-1.5 hover:border-violet-400/60 hover:shadow-2xl hover:shadow-violet-500/15 flex flex-col justify-between min-h-[220px]"
        >
          <div className="pointer-events-none absolute right-0 top-0 h-40 w-40 rounded-full bg-violet-500/10 blur-2xl group-hover:bg-violet-500/20 transition duration-500" />

          <div>
            <div className="flex items-center justify-between">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-3xl shadow-lg transition duration-300 group-hover:scale-110">
                🎨
              </div>
              <span className="rounded-full border border-violet-400/30 bg-violet-500/15 px-3 py-1 text-xs font-bold text-violet-300">
                Quan trọng • Cốt lõi
              </span>
            </div>

            <h3 className="mt-5 text-xl font-bold text-white/95 group-hover:text-violet-200 transition">
              Quản trị Templates (Thư viện mẫu)
            </h3>
            <p className="mt-2 text-sm text-white/65 leading-relaxed">
              Quản lý toàn diện mẫu website: Upload file ZIP chứa <code className="text-violet-300 bg-white/10 px-1.5 py-0.5 rounded text-xs">index.html</code>, tự động quét biến fields, thêm/sửa ảnh xem trước (Thumbnail), ẩn/hiện (Publish/Draft) hoặc xóa mẫu.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
            <span className="text-xs font-semibold text-white/50 group-hover:text-white/80 transition">
              Truy cập phân hệ quản lý mẫu
            </span>
            <div className="primary-btn px-4 py-2 text-xs font-bold shadow-md">
              Vào Quản Lý Templates →
            </div>
          </div>
        </div>

        {/* Card 2: Thống Kê & Hiệu Suất */}
        <div
          onClick={() => navigate("/stats")}
          className="group relative cursor-pointer overflow-hidden rounded-3xl border border-white/15 bg-white/5 p-6 backdrop-blur-xl transition duration-300 hover:-translate-y-1.5 hover:border-white/30 hover:bg-white/[0.08] hover:shadow-2xl flex flex-col justify-between min-h-[220px]"
        >
          <div>
            <div className="flex items-center justify-between">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-3xl shadow-lg transition duration-300 group-hover:scale-110">
                📊
              </div>
              <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/60">
                Phân tích dữ liệu
              </span>
            </div>

            <h3 className="mt-5 text-xl font-bold text-white/95 group-hover:text-emerald-300 transition">
              Thống kê & Báo cáo Hiệu suất
            </h3>
            <p className="mt-2 text-sm text-white/65 leading-relaxed">
              Xem báo cáo tổng quan về số lượng trang landing page đã được người dùng khởi tạo, lượt truy cập thực tế và hiệu suất của toàn bộ hệ thống.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
            <span className="text-xs font-semibold text-white/50 group-hover:text-white/80 transition">
              Xem biểu đồ & số liệu
            </span>
            <div className="ghost-btn px-4 py-2 text-xs border-white/20">
              Xem Thống Kê →
            </div>
          </div>
        </div>

        {/* Card 3: Yêu cầu & Hỗ trợ kỹ thuật */}
        <div
          onClick={() => navigate("/support")}
          className="group relative cursor-pointer overflow-hidden rounded-3xl border border-white/15 bg-white/5 p-6 backdrop-blur-xl transition duration-300 hover:-translate-y-1.5 hover:border-white/30 hover:bg-white/[0.08] hover:shadow-2xl flex flex-col justify-between min-h-[220px]"
        >
          <div>
            <div className="flex items-center justify-between">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-3xl shadow-lg transition duration-300 group-hover:scale-110">
                💬
              </div>
              <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/60">
                Chăm sóc khách hàng
              </span>
            </div>

            <h3 className="mt-5 text-xl font-bold text-white/95 group-hover:text-blue-300 transition">
              Yêu cầu & Hỗ trợ kỹ thuật
            </h3>
            <p className="mt-2 text-sm text-white/65 leading-relaxed">
              Kiểm tra các thắc mắc, yêu cầu hỗ trợ tích hợp hay phản hồi từ người dùng OriginD để kịp thời giải đáp và cải thiện dịch vụ.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
            <span className="text-xs font-semibold text-white/50 group-hover:text-white/80 transition">
              Quản lý phản hồi
            </span>
            <div className="ghost-btn px-4 py-2 text-xs border-white/20">
              Trang Hỗ Trợ →
            </div>
          </div>
        </div>

        {/* Card 4: Quản lý Người dùng & Phân quyền */}
        <div
          onClick={() => navigate("/admin/users")}
          className="group relative cursor-pointer overflow-hidden rounded-3xl border border-amber-400/30 bg-gradient-to-br from-amber-900/25 via-slate-900/60 to-slate-900/90 p-6 backdrop-blur-xl transition duration-300 hover:-translate-y-1.5 hover:border-amber-400/60 hover:shadow-2xl hover:shadow-amber-500/15 flex flex-col justify-between min-h-[220px]"
        >
          <div>
            <div className="flex items-center justify-between">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-3xl shadow-lg transition duration-300 group-hover:scale-110">
                👥
              </div>
              <span className="rounded-full border border-amber-400/30 bg-amber-500/15 px-3 py-1 text-xs font-bold text-amber-300">
                Thành viên • Vai trò
              </span>
            </div>

            <h3 className="mt-5 text-xl font-bold text-white/95 group-hover:text-amber-300 transition">
              Tài khoản & Phân quyền User/Admin
            </h3>
            <p className="mt-2 text-sm text-white/65 leading-relaxed">
              Quản lý toàn bộ danh sách thành viên: Cấp/hạ quyền <code className="text-amber-300 bg-white/10 px-1.5 py-0.5 rounded text-xs">Admin ↔ User</code>, khóa/mở khóa tài khoản nghi vấn, tìm kiếm thành viên và xóa tài khoản vi phạm.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
            <span className="text-xs font-semibold text-white/50 group-hover:text-white/80 transition">
              Truy cập quản trị người dùng
            </span>
            <div className="primary-btn px-4 py-2 text-xs font-bold border-amber-400/40 bg-amber-500/20 text-amber-200 hover:bg-amber-500/30">
              Quản Lý Users →
            </div>
          </div>
        </div>
      </div>

      {/* Quick Status / Guidance Bottom Banner */}
      <GlassCard>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-sm font-bold text-white/90">
              💡 Hướng dẫn luồng quản trị Templates:
            </div>
            <div className="mt-1 text-xs text-white/60 leading-relaxed">
              Bước 1: Chuẩn bị file <code className="text-white/80">.zip</code> chứa <code className="text-white/80">index.html</code> với các thuộc tính <code className="text-white/80">data-field="..."</code>.<br />
              Bước 2: Bấm vào mục <strong>Quản trị Templates</strong> ở trên → Điền Tên, Slug, chọn ảnh Thumbnail và chọn file ZIP → bấm Upload.<br />
              Bước 3: Kiểm tra trạng thái và chuyển sang <code className="text-emerald-300">published</code> để người dùng có thể thấy và sử dụng ngoài trang chủ!
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate("/admin/templates")}
            className="primary-btn px-5 py-2.5 text-xs font-bold shrink-0 self-start sm:self-center"
          >
            Vào Upload Template Ngay →
          </button>
        </div>
      </GlassCard>
    </div>
  );
}
