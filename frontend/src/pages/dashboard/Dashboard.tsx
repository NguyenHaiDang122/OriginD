import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import GlassCard from "../../components/common/GlassCard";
import { fetchTemplates, getCachedTemplates } from "../../services/templateApi";
import { useAuthStore } from "../../store/authStore";

export default function Dashboard() {
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user) as any;

  const isLimitReached = Boolean(
    user && (
      user.can_create_landing_page === false ||
      (typeof user.landing_pages_count === "number" && typeof user.landing_page_limit === "number" && user.landing_pages_count >= user.landing_page_limit) ||
      (user.role !== "Admin" && (!user.roles || !user.roles.some((r: any) => r.name === "Admin")) && typeof user.landing_page_limit !== "number" && ((typeof user.landing_pages_count === "number" && user.landing_pages_count >= 1) || (user.landing_pages && Object.keys(user.landing_pages).length >= 1)))
    )
  );

  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      const cached = getCachedTemplates();
      if (cached) {
        const listCached = Array.isArray((cached as any)?.data)
          ? (cached as any).data
          : Array.isArray(cached)
            ? cached
            : [];
        if (listCached.length > 0 && mounted) {
          setTemplates(listCached);
          setLoading(false);
        }
      } else {
        setLoading(true);
      }
      try {
        const res = await fetchTemplates(token);
        const list = Array.isArray((res as any)?.data)
          ? (res as any).data
          : Array.isArray(res)
            ? res
            : [];
        if (mounted) {
          setTemplates(list);
          setError(null);
        }
      } catch (err: any) {
        if (mounted && !cached) {
          setError("Không thể tải danh sách mẫu. Vui lòng thử lại sau.");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [token]);

  return (
    <div>
      {/* Hero giới thiệu OriginD */}
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 px-5 py-8 sm:px-8 sm:py-10">
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-gradient-to-br from-indigo-500/40 via-violet-500/30 to-fuchsia-500/20 blur-2xl" />
        <div className="pointer-events-none absolute -left-24 -bottom-24 h-64 w-64 rounded-full bg-gradient-to-br from-indigo-500/20 via-violet-500/20 to-fuchsia-500/20 blur-2xl" />

        <div className="relative">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/80">
                <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.55)]" />
                OriginD • Tạo website nhanh chóng
              </div>
              <h1 className="mt-3 text-4xl font-black tracking-tight text-white/95 sm:text-5xl">
                Tạo website chỉ trong vài phút
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-white/60 sm:text-base">
                Chọn mẫu, bấm tạo, tùy chỉnh nội dung và xuất bản. Thiết kế glass/premium đồng bộ với header.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={() => {
                    if (isLimitReached) {
                      alert(`Bạn đã dùng hết số lượt tạo Landing Page (${user?.landing_pages_count || 1}/${user?.landing_page_limit || 1} trang). Vui lòng nâng cấp dịch vụ để tạo thêm!`);
                      return;
                    }
                    navigate("/templates");
                  }}
                  disabled={isLimitReached}
                  className={`justify-center sm:w-auto transition ${
                    isLimitReached
                      ? "cursor-not-allowed border border-white/10 bg-white/5 text-white/35 px-6 py-3 rounded-xl font-semibold text-sm"
                      : "primary-btn hover:scale-105"
                  }`}
                  title={isLimitReached ? "Bạn đã hết lượt tạo Landing Page" : "Bắt đầu tạo website"}
                >
                  {isLimitReached ? "Hết lượt tạo website" : "Bắt đầu tạo website"}
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/templates")}
                  className="ghost-btn justify-center sm:w-auto"
                >
                  Xem demo mẫu
                </button>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-3">
                {[
                  { k: "1-5", v: "phút" },
                  { k: "0", v: "cài đặt" },
                  { k: "SEO", v: "sẵn sàng" },
                ].map((x, idx) => (
                  <div key={idx} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                    <div className="text-xl font-extrabold text-white/95">{x.k}</div>
                    <div className="mt-1 text-xs text-white/60">{x.v}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Preview */}
            <div className="w-full max-w-xl">
              <div className="relative rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 to-white/0 p-3 backdrop-blur-xl">
                <div className="h-full rounded-2xl border border-white/10 bg-[#0b1220] p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500" />
                      <div>
                        <div className="text-sm font-bold text-white/90">OriginD Studio</div>
                        <div className="text-xs text-white/55">Preview website</div>
                      </div>
                    </div>
                    <div className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/70">
                      Live
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-3">
                    {["Hero", "Features", "Pricing", "CTA"].map((t, idx) => (
                      <div key={idx} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-4">
                        <div className="text-xs text-white/60">Section</div>
                        <div className="mt-1 text-sm font-semibold text-white/85">{t}</div>
                        <div className="mt-3 h-2 w-full rounded-full bg-white/10" />
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                    <div>
                      <div className="text-sm font-semibold text-white/90">Chỉ mất vài phút</div>
                      <div className="text-xs text-white/60">Tạo - chỉnh - xuất bản</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (isLimitReached) {
                          alert(`Bạn đã dùng hết số lượt tạo Landing Page (${user?.landing_pages_count || 1}/${user?.landing_page_limit || 1} trang). Vui lòng nâng cấp dịch vụ để tạo thêm!`);
                          return;
                        }
                        navigate("/templates");
                      }}
                      disabled={isLimitReached}
                      className={
                        isLimitReached
                          ? "cursor-not-allowed border border-white/10 bg-white/5 text-white/35 px-4 py-2 rounded-xl font-semibold text-sm"
                          : "primary-btn px-4 py-2 text-sm"
                      }
                      title={isLimitReached ? "Bạn đã hết lượt tạo Landing Page" : "Tạo ngay"}
                    >
                      {isLimitReached ? "Hết lượt tạo" : "Tạo ngay"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content: Từ phần Chọn mẫu website • Thư viện mẫu trở xuống */}
      <div className="mt-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Chọn mẫu website</h2>
            <p className="mt-1 text-sm text-white/60">Thư viện mẫu • bấm xem hoặc bấm tạo</p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/templates")}
            className="ghost-btn px-4 py-2 text-sm self-start sm:self-center flex items-center gap-2 group border-white/15 hover:border-white/30"
          >
            <span>Xem tất cả mẫu</span>
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </button>
        </div>

        {/* Grid card hình ảnh mẫu từ API */}
        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((idx) => (
              <div
                key={idx}
                className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl animate-pulse"
              >
                <div className="aspect-video w-full rounded-2xl bg-white/10 mb-4" />
                <div className="h-5 w-2/3 rounded-lg bg-white/10 mb-2" />
                <div className="h-3 w-full rounded-lg bg-white/5 mb-4" />
                <div className="pt-3 border-t border-white/10 flex justify-between items-center">
                  <div className="h-4 w-20 rounded bg-white/10" />
                  <div className="flex gap-2">
                    <div className="h-8 w-12 rounded-xl bg-white/10" />
                    <div className="h-8 w-12 rounded-xl bg-white/10" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <GlassCard>
            <div className="text-center py-8">
              <div className="text-rose-300 font-semibold mb-2">{error}</div>
              <button
                type="button"
                onClick={() => navigate("/templates")}
                className="primary-btn px-5 py-2 text-sm mt-3"
              >
                Thử vào trang Templates
              </button>
            </div>
          </GlassCard>
        ) : templates.length === 0 ? (
          <GlassCard>
            <div className="text-center py-10">
              <div className="text-4xl mb-3">📭</div>
              <div className="text-white/90 font-bold text-lg mb-1">Chưa có template nào trong thư viện</div>
              <div className="text-white/60 text-sm max-w-md mx-auto mb-6">
                Hiện chưa có mẫu website nào được phát hành. Vui lòng quay lại sau hoặc vào trang Quản trị để thêm mới.
              </div>
              <button
                type="button"
                onClick={() => navigate("/templates")}
                className="primary-btn px-6 py-2.5 text-sm"
              >
                Vào trang Thư viện mẫu
              </button>
            </div>
          </GlassCard>
        ) : (
          <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {templates.slice(0, 6).map((tpl: any) => (
              <div
                key={tpl.id}
                className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-white/25 hover:bg-white/[0.08] hover:shadow-2xl hover:shadow-violet-500/10 flex flex-col justify-between"
              >
                <div>
                  {/* Ô hình ảnh Thumbnail */}
                  <div className="relative mb-4 aspect-video w-full overflow-hidden rounded-2xl border border-white/10 bg-black/40 group-hover:border-white/20 transition">
                    {tpl.thumbnail ? (
                      <img
                        src={tpl.thumbnail}
                        alt={tpl.name}
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-violet-600/20 via-slate-900/80 to-indigo-600/20 p-4 text-center">
                        <span className="text-3xl mb-1.5 transition-transform duration-300 group-hover:scale-110">🖼️</span>
                        <span className="text-xs font-semibold text-white/70 truncate max-w-full px-2">{tpl.name}</span>
                        <span className="text-[10px] text-white/40 mt-0.5">Chưa có ảnh xem trước</span>
                      </div>
                    )}
                    {tpl.status === "published" ? (
                      <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-slate-900/80 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-bold tracking-wide uppercase text-emerald-300 shadow-sm">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>Live</span>
                      </div>
                    ) : (
                      <div className="absolute top-3 left-3 rounded-full border border-white/15 bg-slate-900/80 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-bold tracking-wide uppercase text-white/70">
                        Draft
                      </div>
                    )}
                    {tpl.version && (
                      <div className="absolute top-3 right-3 rounded-full border border-white/15 bg-black/60 backdrop-blur-md px-2 py-0.5 text-[10px] font-mono text-white/70">
                        v{tpl.version}
                      </div>
                    )}
                  </div>

                  {/* Thông tin Template */}
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-base font-bold text-white/95 group-hover:text-violet-300 transition truncate">
                      {tpl.name}
                    </h3>
                  </div>
                  <p className="mt-1.5 text-xs text-white/60 line-clamp-2 leading-relaxed">
                    {tpl.description ? tpl.description : `Mẫu giao diện chuyên nghiệp cho ${tpl.name}. Tùy chỉnh nội dung chỉ với vài thao tác.`}
                  </p>
                </div>

                {/* Footer Buttons */}
                <div className="mt-5 flex items-center justify-between gap-3 pt-3 border-t border-white/10">
                  <div className="text-xs text-white/50 flex items-center gap-1.5">
                    <span>⚡ Fields:</span>
                    <span className="font-semibold text-white/80">{tpl.fields?.length ?? 0}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => navigate(`/templates?templateId=${tpl.id}&mode=preview`)}
                      className="ghost-btn px-3.5 py-1.5 text-xs border-white/15 hover:bg-white/10"
                    >
                      Xem
                    </button>
                    <button
                      type="button"
                      className={`px-4 py-1.5 text-xs font-semibold rounded-xl transition ${
                        isLimitReached
                          ? "cursor-not-allowed border border-white/10 bg-white/5 text-white/35"
                          : "primary-btn"
                      }`}
                      disabled={isLimitReached}
                      title={
                        isLimitReached
                          ? `Bạn đã hết lượt tạo Landing Page (${user?.landing_pages_count || 1}/${user?.landing_page_limit || 1} trang). Vui lòng nâng cấp dịch vụ!`
                          : "Tạo trang web với mẫu này"
                      }
                      onClick={() => {
                        if (!token) {
                          navigate("/login");
                          return;
                        }
                        if (isLimitReached) {
                          alert(`Bạn đã hết lượt tạo Landing Page (${user?.landing_pages_count || 1}/${user?.landing_page_limit || 1} trang). Vui lòng gia hạn hoặc nâng cấp gói để tạo thêm!`);
                          return;
                        }
                        navigate(`/templates?templateId=${tpl.id}&mode=create`);
                      }}
                    >
                      {isLimitReached ? "Hết lượt tạo" : "Tạo"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </section>
        )}

        {/* Premium CTA Section */}
        <section className="mt-12">
          <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-r from-violet-900/40 via-indigo-900/30 to-slate-900/60 p-8 sm:p-10 backdrop-blur-2xl shadow-2xl">
            <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-violet-500/30 blur-3xl" />
            <div className="pointer-events-none absolute -left-20 -bottom-20 h-60 w-60 rounded-full bg-indigo-500/20 blur-3xl" />

            <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="max-w-xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-300 mb-3">
                  🚀 Sẵn sàng xuất bản?
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Sẵn sàng tạo website cho riêng bạn?
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/70">
                  Khám phá toàn bộ bộ sưu tập mẫu giao diện hiện đại. Chọn mẫu yêu thích → chỉnh sửa nội dung → xuất bản ngay tức thì!
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => navigate("/support")}
                  className="ghost-btn justify-center px-5 py-3 text-sm border-white/20 hover:bg-white/10"
                >
                  Hướng dẫn sử dụng
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (isLimitReached) {
                      alert(`Bạn đã dùng hết số lượt tạo Landing Page (${user?.landing_pages_count || 1}/${user?.landing_page_limit || 1} trang). Vui lòng nâng cấp dịch vụ để tạo thêm!`);
                      return;
                    }
                    navigate("/templates");
                  }}
                  disabled={isLimitReached}
                  className={`justify-center px-6 py-3 text-sm font-bold transition ${
                    isLimitReached
                      ? "cursor-not-allowed border border-white/10 bg-white/5 text-white/35 rounded-xl"
                      : "primary-btn hover:scale-105"
                  }`}
                  title={isLimitReached ? "Bạn đã hết lượt tạo Landing Page" : "Tạo website ngay"}
                >
                  {isLimitReached ? "Hết lượt tạo" : "Tạo website ngay"}
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
