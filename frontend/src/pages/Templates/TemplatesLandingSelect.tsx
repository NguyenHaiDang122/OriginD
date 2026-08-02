import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuthStore } from "../../store/authStore";
import GlassCard from "../../components/common/GlassCard";
import PageSection from "../../components/common/PageSection";

import { fetchTemplates, getCachedTemplates } from "../../services/templateApi";
import { API_BASE_URL, PAGE_BASE_URL } from "../../config/api";

import TemplateCreatePage from "./TemplateCreatePage";



export default function TemplatesLandingSelect() {
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [activeTemplate, setActiveTemplate] = useState<any | null>(null);
  const [activeMode, setActiveMode] = useState<"preview" | "create">("create");

  const [_createdUrl, setCreatedUrl] = useState<string | null>(null);
  const [createdLink, setCreatedLink] = useState<string | null>(null);

  const createdId = useMemo(() => {
    if (typeof window === "undefined") return null;
    return new URLSearchParams(window.location.search).get("createdId");
  }, []);

  const createdSlug = useMemo(() => {
    if (typeof window === "undefined") return null;
    return new URLSearchParams(window.location.search).get("slug");
  }, []);





  const sortedTemplates = useMemo(() => {
    return templates.slice();
  }, [templates]);

  async function loadTemplates(force = false) {
    if (!force) {
      const cached = getCachedTemplates();
      if (cached) {
        const listCached = Array.isArray((cached as any)?.data)
          ? (cached as any).data
          : Array.isArray(cached)
            ? (cached as any)
            : (cached as any);
        if (listCached && listCached.length > 0) {
          setTemplates(listCached);
        }
      }
    }
    
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTemplates(token);
      // API có thể trả về { data: [...] } hoặc trực tiếp array
      const list = Array.isArray((data as any)?.data)
        ? (data as any).data
        : Array.isArray(data)
          ? (data as any)
          : (data as any);

      const safeList = list ?? [];
      setTemplates(safeList);

      const params = new URLSearchParams(window.location.search);
      const templateId = params.get("templateId");
      const modeParam = params.get("mode");
      if (templateId && safeList.length > 0) {
        const found = safeList.find(
          (t: any) => String(t.id) === String(templateId) || String(t.slug) === String(templateId)
        );
        if (found) {
          if (modeParam === "create" && !token) {
            navigate("/login");
            return;
          }
          setActiveTemplate(found);
          setActiveMode(modeParam === "preview" ? "preview" : "create");
        }
      }
    } catch (e: any) {
      setError(e?.response?.data?.message ?? e?.message ?? "Lỗi tải templates");
    } finally {
      setLoading(false);
    }
  }

  // load ngay
  useEffect(() => {
    loadTemplates();

    // Nếu vừa tạo xong, backend FE redirect về /templates?createdId=...
    const params = new URLSearchParams(window.location.search);
    const createdIdParam = params.get("createdId");
    const slugParam = params.get("slug");
    if (createdIdParam) {
      setCreatedUrl(`landing page id: ${createdIdParam}`);
    }
    if (slugParam) {
      setCreatedLink(`${PAGE_BASE_URL}/${slugParam}`);
    }
  }, []);



  if (activeTemplate) {
    return (
      <TemplateCreatePage
        template={activeTemplate}
        mode={activeMode}
        onSwitchMode={(newMode) => {
          if (newMode === "create" && !token) {
            navigate("/login");
            return;
          }
          setActiveMode(newMode);
        }}
        onCreated={() => {
          setActiveTemplate(null);
          setActiveMode("create");
        }}
      />
    );
  }

  return (
    <div>
      <PageSection
        title="Chọn mẫu website (Templates)"
        subtitle="Tạo nhanh Portfolio cá nhân. Nhập thông tin cá nhân, ảnh đại diện, dự án & liên kết mạng xã hội để sinh ngay trang web chuyên nghiệp, hoàn toàn miễn phí."
      >
        <GlassCard>
          {error ? (
            <div className="mb-4 rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {error}
            </div>
          ) : null}

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-white/95 font-semibold">Templates</div>
              <div className="text-white/60 text-sm">Bấm “Tạo” để mở form nhập dữ liệu</div>
            </div>
            <button
              className="ghost-btn"
              type="button"
              onClick={() => loadTemplates(true)}
              disabled={loading}
            >
              {loading ? "Đang tải..." : "Làm mới"}
            </button>
          </div>
        </GlassCard>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {createdId ? (
            <div className="col-span-full mb-2">
              <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                Landing page created (id: {createdId}).
                <div className="mt-2">
                  <a
                    className="text-white/90 underline underline-offset-4 hover:text-white"
                    href={createdLink ? createdLink : (createdSlug ? `${PAGE_BASE_URL}/${createdSlug}` : `${API_BASE_URL}/landing-pages/${createdId}/render`)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {createdLink ?? (createdSlug ? `${PAGE_BASE_URL}/${createdSlug}` : "Xem landing page")}
                  </a>
                </div>
              </div>
            </div>
          ) : null}

          {isLimitReached && (
            <div className="col-span-full mb-4 rounded-2xl border border-amber-400/30 bg-amber-500/10 p-4 text-amber-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <div className="font-bold text-sm">Bạn đã dùng hết số lượt tạo Landing Page ({user?.landing_pages_count || 1}/{user?.landing_page_limit || 1} trang)</div>
                <div className="text-xs text-amber-200/80 mt-0.5">
                  Gói tài khoản hiện tại không cho phép tạo thêm Landing Page mới. Bạn vẫn có thể xem trước (Preview) các mẫu giao diện dưới đây.
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate("/upgrade")}
                className="shrink-0 px-4 py-2 rounded-xl bg-transparent border border-amber-500 text-amber-400 text-xs font-semibold hover:bg-amber-500/10 transition"
              >
                Gia hạn / Nâng cấp ngay
              </button>
            </div>
          )}

          {sortedTemplates.map((tpl: any) => (
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
                      <div className="absolute top-3 left-3 flex items-center gap-2">
                        <div className="flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-slate-900/80 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-bold tracking-wide uppercase text-emerald-300 shadow-sm">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span>Live</span>
                        </div>
                        {tpl.is_featured && (
                          <div className="flex items-center justify-center rounded-full border border-yellow-400/30 bg-slate-900/80 backdrop-blur-md px-2 py-0.5 text-[10px] text-yellow-400 shadow-sm shadow-yellow-500/20" title="Được ghim Nổi bật">
                            ★ Nổi bật
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="absolute top-3 left-3 flex items-center gap-2">
                        <div className="rounded-full border border-white/15 bg-slate-900/80 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-bold tracking-wide uppercase text-white/70">
                          Draft
                        </div>
                        {tpl.is_featured && (
                          <div className="flex items-center justify-center rounded-full border border-yellow-400/30 bg-slate-900/80 backdrop-blur-md px-2 py-0.5 text-[10px] text-yellow-400 shadow-sm shadow-yellow-500/20" title="Được ghim Nổi bật">
                            ★ Nổi bật
                          </div>
                        )}
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
                  {tpl.plans && tpl.plans.length > 0 && (
                    <div className="mt-3 flex items-center gap-1.5 text-[11px] font-medium text-rose-400" title="Chỉ dành cho các gói cước được cấp quyền">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                      </svg>
                      <span>Plan: {tpl.plans.slice().sort((a: any, b: any) => (Number(a.price) || 0) - (Number(b.price) || 0)).map((p: any) => p.name).join(", ")} mới có thể sử dụng</span>
                    </div>
                  )}
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
                      className="ghost-btn px-3.5 py-1.5 text-xs border-white/15 hover:bg-white/10"
                      onClick={() => {
                        setActiveTemplate(tpl);
                        setActiveMode("preview");
                      }}
                    >
                      Xem
                    </button>
                    <button
                      type="button"
                      className={
                        isLimitReached
                          ? "px-4 py-1.5 text-xs font-semibold rounded-xl transition cursor-not-allowed border border-white/10 bg-white/5 text-white/35"
                          : tpl.plans && tpl.plans.length > 0 && user && user.role !== 'Admin' && (!user.subscription || !tpl.plans.some((p: any) => p.id === user.subscription.plan_id))
                            ? "ghost-btn px-3.5 py-1.5 text-xs border-white/15 hover:bg-white/10"
                            : "px-4 py-1.5 text-xs font-semibold rounded-xl transition primary-btn"
                      }
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
                        if (tpl.plans && tpl.plans.length > 0 && user && user.role !== 'Admin' && (!user.subscription || !tpl.plans.some((p: any) => p.id === user.subscription.plan_id))) {
                          navigate("/upgrade");
                          return;
                        }
                        setActiveTemplate(tpl);
                        setActiveMode("create");
                      }}
                    >
                      {isLimitReached ? "Hết lượt tạo" : (tpl.plans && tpl.plans.length > 0 && user && user.role !== 'Admin' && (!user.subscription || !tpl.plans.some((p: any) => p.id === user.subscription.plan_id)) ? "Nâng cấp" : "Tạo")}
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {!loading && sortedTemplates.length === 0 ? (
              <div className="mt-6 text-sm text-white/60 text-center w-full col-span-full">
                Chưa có template nào.
              </div>
            ) : null}
          </div>
      </PageSection>
    </div>
  );
}

