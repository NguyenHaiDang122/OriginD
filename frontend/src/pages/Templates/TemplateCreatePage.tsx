import { useEffect, useMemo, useState } from "react";

import { createLandingPage } from "../../services/landingPageApi";
import { previewTemplate, renderLandingPage } from "../../services/landingPageRenderApi";

import GlassCard from "../../components/common/GlassCard";

import PageSection from "../../components/common/PageSection";

import { useAuthStore } from "../../store/authStore";

export type TemplateField = {
  id: number;
  label: string;
  key: string;
  type: string;
  default_value: string | null;
  required: boolean;
  sort_order?: number;
};

export default function TemplateCreatePage({
  template,
  onCreated,
}: {
  template: {
    id: number;
    name: string;
    slug: string;
    description?: string | null;
    fields: TemplateField[];
  };
  onCreated?: () => void;
}) {
  const token = useAuthStore((s) => s.token);

  const initial = useMemo(() => {
    const obj: Record<string, any> = {};
    for (const f of template.fields || []) {
      if (f.default_value !== null && f.default_value !== undefined) {
        obj[f.key] = f.default_value;
      } else {
        obj[f.key] = "";
      }
    }
    return obj;
  }, [template.fields]);

  const [values, setValues] = useState<Record<string, any>>(initial);
  const [customSlug, setCustomSlug] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [previewHtml, setPreviewHtml] = useState<string>("");
  const [previewLoading, setPreviewLoading] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");

  useEffect(() => {
    let isMounted = true;
    setPreviewLoading(true);

    const timer = setTimeout(async () => {
      try {
        const html = await previewTemplate(template.id, values, token);
        if (isMounted) {
          setPreviewHtml(html);
        }
      } catch (err) {
        console.error("Preview error:", err);
      } finally {
        if (isMounted) {
          setPreviewLoading(false);
        }
      }
    }, 350);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [template.id, values, token]);


  async function onSubmit(e: React.FormEvent) {

    e.preventDefault();

    if (!token) {

      setError("Bạn cần đăng nhập");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const createdRes: any = await createLandingPage(
        template.id,
        { title: values.title ?? template.name, slug: customSlug.trim() || undefined, data: values },
        token
      );

      const createdPage = createdRes?.data ?? createdRes;
      const id = createdPage?.id as number | undefined;

      if (!id) {
        setSuccess("Tạo landing page thành công.");
        onCreated?.();
        return;
      }

      // Render HTML theo dữ liệu người dùng nhập
      await renderLandingPage(id, token);
      setSuccess("Tạo landing page thành công.");

      // Hiển thị link URL public của landing page
      const slug = (createdPage as any)?.slug as string | undefined;

      if (slug) {
        const url = `/page/${slug}`;
        setSuccess(`Tạo landing page thành công. Link: ${url}`);
      } else {
        setSuccess("Tạo landing page thành công.");
      }



      // Điều hướng về danh sách template (giữ behavior cũ)
      window.location.href = `/templates?createdId=${id}${slug ? "&slug=" + encodeURIComponent(slug) : ""}`;

    

    
    } catch (err: any) {
      setError(err?.response?.data?.message ?? err?.message ?? "Tạo thất bại");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <PageSection
        title={`Tạo từ template: ${template.name}`}
        subtitle="Nhập các trường bên trái và xem trước giao diện thực tế cập nhật ngay bên phải"
      />

      <div className="mt-4 grid grid-cols-1 gap-6 xl:grid-cols-12">
        {/* Left Column: Form nhập thông tin */}
        <div className="xl:col-span-5">
          <form onSubmit={onSubmit}>
            <GlassCard>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <div className="text-white/90 text-sm font-semibold">Nhập dữ liệu Landing Page</div>
                  <div className="text-white/60 text-xs">Dữ liệu sẽ tự động đồng bộ vào bản xem trước</div>
                </div>
                {onCreated ? (
                  <button
                    type="button"
                    onClick={onCreated}
                    className="ghost-btn px-3 py-1.5 text-xs"
                  >
                    Quay lại
                  </button>
                ) : null}
              </div>

              <div className="flex flex-col gap-4">
                <div className="rounded-2xl border border-violet-400/30 bg-violet-500/10 p-3.5">
                  <label className="block text-sm font-semibold text-violet-200">
                    Đường dẫn trang (URL Slug tuỳ chọn)
                  </label>
                  <div className="mt-1.5 flex items-center rounded-xl border border-white/20 bg-black/30 overflow-hidden focus-within:border-violet-400 transition">
                    <span className="bg-white/10 px-3 py-3 text-xs font-mono text-white/50 border-r border-white/10 select-none">
                      http://localhost:8000/page/
                    </span>
                    <input
                      type="text"
                      value={customSlug}
                      onChange={(e) => setCustomSlug(e.target.value)}
                      placeholder="vd: khuyen-mai-t7 (bỏ trống để tự tạo)"
                      className="w-full bg-transparent px-3 py-3 text-sm text-white placeholder:text-white/30 outline-none font-mono"
                    />
                  </div>
                  <div className="mt-1.5 text-[11px] text-white/60">
                    {customSlug.trim() ? (
                      <span>Link của bạn sẽ là: <strong className="text-violet-300">http://localhost:8000/page/{customSlug.trim().toLowerCase().replace(/[^a-z0-9-_]/g, "-")}</strong></span>
                    ) : (
                      <span>Nếu để trống, hệ thống sẽ tự động thêm dãy số ở sau tên trang.</span>
                    )}
                  </div>
                </div>

                {template.fields
                  ?.slice()
                  .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
                  .map((field) => {
                    const v = values[field.key] ?? "";
                    return (
                      <div key={field.id}>
                        <label className="block text-sm text-white/70">
                          {field.label}
                          {field.required ? " *" : ""}
                        </label>
                        {field.type?.toLowerCase() === "textarea" ? (
                          <textarea
                            value={v}
                            onChange={(e) => setValues((s) => ({ ...s, [field.key]: e.target.value }))}
                            className="mt-1 min-h-[90px] w-full resize-y rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 outline-none focus:border-white/30"
                          />
                        ) : field.type?.toLowerCase() === "number" ? (
                          <input
                            type="number"
                            value={v}
                            onChange={(e) => setValues((s) => ({ ...s, [field.key]: e.target.value }))}
                            className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 outline-none focus:border-white/30"
                          />
                        ) : (
                          <input
                            type="text"
                            value={v}
                            onChange={(e) => setValues((s) => ({ ...s, [field.key]: e.target.value }))}
                            className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 outline-none focus:border-white/30"
                            placeholder={field.default_value ?? ""}
                          />
                        )}
                      </div>
                    );
                  })}
              </div>

              {error ? (
                <div className="mt-4 rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                  {error}
                </div>
              ) : null}
              {success ? (
                <div className="mt-4 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                  {success}
                </div>
              ) : null}

              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  type="submit"
                  className="primary-btn w-full justify-center py-3 sm:w-auto"
                  disabled={loading}
                >
                  {loading ? "Đang tạo..." : "Tạo landing page ngay"}
                </button>
              </div>
            </GlassCard>
          </form>
        </div>

        {/* Right Column: Live Preview */}
        <div className="xl:col-span-7">
          <GlassCard>
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <div className="text-white/95 text-sm font-semibold">Live Preview</div>
                {previewLoading ? (
                  <span className="text-xs text-emerald-300/80 animate-pulse">(Đang cập nhật...)</span>
                ) : (
                  <span className="text-xs text-white/50">(Tự động làm mới khi nhập)</span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setViewMode("desktop")}
                  className={`px-3 py-1.5 text-xs rounded-xl font-medium transition-all ${
                    viewMode === "desktop"
                      ? "bg-white/20 text-white shadow-lg border border-white/30"
                      : "bg-white/5 text-white/60 hover:text-white border border-white/10"
                  }`}
                >
                  💻 Desktop
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("mobile")}
                  className={`px-3 py-1.5 text-xs rounded-xl font-medium transition-all ${
                    viewMode === "mobile"
                      ? "bg-white/20 text-white shadow-lg border border-white/30"
                      : "bg-white/5 text-white/60 hover:text-white border border-white/10"
                  }`}
                >
                  📱 Mobile
                </button>
              </div>
            </div>

            <div className="relative mt-3 overflow-hidden rounded-2xl border border-white/15 bg-slate-950/40 p-3 backdrop-blur-md">
              {viewMode === "desktop" ? (
                <iframe
                  className="w-full h-[650px] rounded-xl bg-white shadow-2xl transition-all duration-300"
                  srcDoc={previewHtml}
                  title="Live Preview Desktop"
                />
              ) : (
                <div className="py-2">
                  <div className="mx-auto max-w-[375px] rounded-[48px] border-[12px] border-gray-900 bg-gray-900 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 h-5 w-28 bg-gray-900 rounded-b-2xl z-10 flex items-center justify-center">
                      <div className="h-1.5 w-12 bg-gray-800 rounded-full" />
                    </div>
                    <iframe
                      className="w-full h-[640px] rounded-[36px] bg-white transition-all duration-300 pt-5"
                      srcDoc={previewHtml}
                      title="Live Preview Mobile"
                    />
                  </div>
                </div>
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

