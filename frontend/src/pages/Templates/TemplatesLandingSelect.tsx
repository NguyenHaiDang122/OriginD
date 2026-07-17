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

  async function loadTemplates() {
    const cached = getCachedTemplates();
    if (cached) {
      const listCached = Array.isArray((cached as any)?.data)
        ? (cached as any).data
        : Array.isArray(cached)
          ? (cached as any)
          : (cached as any);
      if (listCached && listCached.length > 0) {
        setTemplates(listCached);
        setLoading(false);
      } else {
        setLoading(true);
      }
    } else {
      setLoading(true);
    }
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
              onClick={loadTemplates}
              disabled={loading}
            >
              {loading ? "Đang tải..." : "Làm mới"}
            </button>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
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
                onClick={() => navigate("/dashboard")}
                className="shrink-0 px-4 py-2 rounded-xl border border-amber-400/40 bg-amber-500/20 text-xs font-semibold hover:bg-amber-500/30 transition text-amber-100"
              >
                Gia hạn / Nâng cấp ngay
              </button>
            </div>
          )}

          {sortedTemplates.map((tpl: any) => (
              <div
                key={tpl.id}
                className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl transition hover:border-white/20 hover:bg-white/[0.07]"
              >
                <div className="relative flex flex-col h-full">
                  {/* Ô hình ảnh phía trên */}
                  <div className="mb-4 aspect-video w-full overflow-hidden rounded-2xl border border-white/10 bg-black/30 group-hover:border-white/20 transition">
                    {tpl.thumbnail ? (
                      <img
                        src={tpl.thumbnail}
                        alt={tpl.name}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-violet-600/20 via-slate-900/60 to-blue-600/20 p-4 text-center">
                        <span className="text-2xl mb-1">🖼️</span>
                        <span className="text-xs font-medium text-white/50">{tpl.name}</span>
                        <span className="text-[10px] text-white/30 mt-0.5">Chưa có ảnh xem trước</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-white/95 font-semibold text-lg">{tpl.name}</div>
                      {tpl.version && (
                        <span className="text-[10px] rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-white/70">
                          v{tpl.version}
                        </span>
                      )}
                    </div>
                    <div className="mt-1 text-xs text-white/60 line-clamp-2">
                      {tpl.description ?? tpl.slug}
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3 pt-2 border-t border-white/10">
                    <div className="text-xs text-white/55">
                      Fields: <span className="font-semibold text-white/80">{tpl.fields?.length ?? 0}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="ghost-btn px-3 py-1.5 text-xs"
                        onClick={() => {
                          setActiveTemplate(tpl);
                          setActiveMode("preview");
                        }}
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
                          setActiveTemplate(tpl);
                          setActiveMode("create");
                        }}
                      >
                        {isLimitReached ? "Hết lượt tạo" : "Tạo"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {!loading && sortedTemplates.length === 0 ? (
            <div className="mt-6 text-sm text-white/60">
              Chưa có template nào.
            </div>
          ) : null}
        </GlassCard>
      </PageSection>
    </div>
  );
}

