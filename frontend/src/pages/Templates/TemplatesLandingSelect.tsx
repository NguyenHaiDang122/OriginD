import { useMemo, useState } from "react";

import { useAuthStore } from "../../store/authStore";
import GlassCard from "../../components/common/GlassCard";
import PageSection from "../../components/common/PageSection";

import { fetchTemplates } from "../../services/templateApi";

import TemplateCreatePage from "./TemplateCreatePage";



export default function TemplatesLandingSelect() {
  const token = useAuthStore((s) => s.token);

  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [activeTemplate, setActiveTemplate] = useState<any | null>(null);

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
      if (templateId && safeList.length > 0) {
        const found = safeList.find(
          (t: any) => String(t.id) === String(templateId) || String(t.slug) === String(templateId)
        );
        if (found) {
          setActiveTemplate(found);
        }
      }
    } catch (e: any) {
      setError(e?.response?.data?.message ?? e?.message ?? "Lỗi tải templates");
    } finally {
      setLoading(false);
    }
  }

  // load ngay
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useMemo(() => {
    loadTemplates();

    // Nếu vừa tạo xong, backend FE redirect về /templates?createdId=...
    const params = new URLSearchParams(window.location.search);
    const createdIdParam = params.get("createdId");
    const slugParam = params.get("slug");
    if (createdIdParam) {
      setCreatedUrl(`landing page id: ${createdIdParam}`);
    }
    if (slugParam) {
      setCreatedLink(`http://localhost:8000/page/${slugParam}`);
    }



  }, []);



  if (activeTemplate) {
    return (
      <TemplateCreatePage
        template={activeTemplate}
        onCreated={() => setActiveTemplate(null)}
      />
    );
  }

  return (
    <div>
      <PageSection
        title="Chọn template"
        subtitle="Admin up mẫu → user bấm Tạo → nhập fields để tạo landing page"
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
                    href={createdLink ? createdLink : (createdSlug ? `http://localhost:8000/page/${createdSlug}` : `http://localhost:8000/api/landing-pages/${createdId}/render`)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {createdLink ?? (createdSlug ? `http://localhost:8000/page/${createdSlug}` : "Xem landing page")}
                  </a>
                </div>
              </div>
            </div>
          ) : null}

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
                        }}
                      >
                        Xem
                      </button>
                      <button
                        type="button"
                        className="primary-btn px-4 py-1.5 text-xs font-semibold"
                        onClick={() => setActiveTemplate(tpl)}
                      >
                        Tạo
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

