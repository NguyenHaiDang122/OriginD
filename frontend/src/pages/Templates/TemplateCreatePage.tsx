import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { createLandingPage } from "../../services/landingPageApi";
import { previewTemplate, renderLandingPage } from "../../services/landingPageRenderApi";
import { PAGE_BASE_URL } from "../../config/api";
import { uploadImage } from "../../services/uploadApi";

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

const getCleanScalar = (val: any): string => {
  if (val === null || val === undefined) return "";
  if (Array.isArray(val)) {
    return val.length > 0 ? getCleanScalar(val[0]) : "";
  }
  if (typeof val === "string") {
    const trimmed = val.trim();
    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed.length > 0 ? getCleanScalar(parsed[0]) : "";
        }
      } catch {}
    }
    return val;
  }
  if (typeof val === "object") return JSON.stringify(val);
  return String(val);
};

export default function TemplateCreatePage({
  template,
  mode = "create",
  onSwitchMode,
  onCreated,
}: {
  template: {
    id: number;
    name: string;
    slug: string;
    description?: string | null;
    fields: TemplateField[];
  };
  mode?: "preview" | "create";
  onSwitchMode?: (newMode: "preview" | "create") => void;
  onCreated?: () => void;
}) {
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

  const initial = useMemo(() => {
    const obj: Record<string, any> = {};
    for (const f of template.fields || []) {
      obj[f.key] = getCleanScalar(f.default_value);
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
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");
  const [limitModalOpen, setLimitModalOpen] = useState(false);
  
  const [uploadingFields, setUploadingFields] = useState<Record<string, boolean>>({});
  useEffect(() => {
    let active = true;

    async function doPreview() {
      setPreviewLoading(true);
      setPreviewError(null);
      try {
        const res: any = await previewTemplate(template.id, values);
        if (active) {
          let htmlContent = "";
          if (res && typeof res === "object" && res.html) {
            htmlContent = res.html;
          } else if (typeof res === "string") {
            htmlContent = res;
          } else {
            htmlContent = "<p class='p-4 text-center text-white/50'>Không có dữ liệu preview</p>";
          }
          
          // Inject script to prevent navigation inside the preview iframe
          const interceptScript = `
            <script>
              document.addEventListener('click', function(e) {
                const a = e.target.closest('a');
                if (a) {
                  e.preventDefault();
                  e.stopPropagation(); // Chặn JS của template chạy (để tránh JS đổi hash)
                  
                  const href = a.getAttribute('href');
                  if (href && href.startsWith('#') && href.length > 1) {
                    const target = document.querySelector(href);
                    if (target) {
                      target.scrollIntoView({ behavior: 'smooth' });
                    }
                  }
                }
              }, true); // Sử dụng capture phase để bắt sự kiện trước template

              document.addEventListener('submit', function(e) {
                e.preventDefault();
                e.stopPropagation();
              }, true);
            </script>
          `;
          
          if (htmlContent.includes("</body>")) {
            htmlContent = htmlContent.replace("</body>", interceptScript + "</body>");
          } else {
            htmlContent += interceptScript;
          }
          
          setPreviewHtml(htmlContent);
        }
      } catch (err: any) {
        if (active) {
          setPreviewError(err?.response?.data?.message || "Lỗi khi render preview mẫu giao diện");
        }
      } finally {
        if (active) setPreviewLoading(false);
      }
    }

    const timer = setTimeout(doPreview, 500);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [template.id, values]);

  const handleImageUpload = async (file: File, fieldKey: string) => {
    if (!token) {
      setError("Bạn cần đăng nhập để tải ảnh lên");
      return;
    }
    setUploadingFields(s => ({ ...s, [fieldKey]: true }));
    setError(null);
    try {
      const res = await uploadImage(file, token);
      if (res.success && res.url) {
        setValues((s) => ({ ...s, [fieldKey]: res.url as string }));
        setSuccess("Tải ảnh lên thành công!");
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err: any) {
      alert(err.message || "Lỗi tải ảnh");
    } finally {
      setUploadingFields(s => ({ ...s, [fieldKey]: false }));
    }
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!token) {
      setError("Bạn cần đăng nhập");
      return;
    }

    if (isLimitReached) {
      setError(`Bạn đã hết lượt tạo Landing Page (${user?.landing_pages_count || 1}/${user?.landing_page_limit || 1} trang). Vui lòng nâng cấp dịch vụ!`);
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

  if (mode === "preview") {
    return (
      <div className="space-y-6">
        <GlassCard>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <h2 className="text-lg font-bold text-white">Xem trước mẫu: {template.name}</h2>
              </div>
              <p className="mt-1 text-xs text-white/60">
                Chế độ chỉ xem giao diện thực tế. Bạn không thể nhập liệu hay tạo trang ở chế độ xem mẫu này.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center rounded-xl border border-white/15 bg-black/40 p-1">
                <button
                  type="button"
                  onClick={() => setViewMode("desktop")}
                  className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all ${
                    viewMode === "desktop"
                      ? "bg-violet-600 text-white shadow-md"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  💻 Desktop
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("mobile")}
                  className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all ${
                    viewMode === "mobile"
                      ? "bg-violet-600 text-white shadow-md"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  📱 Mobile
                </button>
              </div>

              {onCreated ? (
                <button
                  type="button"
                  onClick={onCreated}
                  className="ghost-btn px-4 py-2 text-xs"
                >
                  ← Quay lại danh sách
                </button>
              ) : null}

              {onSwitchMode ? (
                <button
                  type="button"
                  onClick={() => {
                    if (!token) {
                      navigate("/login");
                      return;
                    }
                    if (isLimitReached) {
                      setLimitModalOpen(true);
                      return;
                    }
                    onSwitchMode("create");
                  }}
                  className="primary-btn px-5 py-2 text-xs font-semibold shadow-lg shadow-violet-500/20"
                >
                  Sử dụng mẫu này
                </button>
              ) : null}
            </div>
          </div>
        </GlassCard>

        <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-slate-950/60 p-4 backdrop-blur-xl shadow-2xl">
          {previewLoading ? (
            <div className="flex h-[500px] flex-col items-center justify-center gap-3 text-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
              <div className="text-sm font-medium text-white/80">Đang dựng bản xem trước giao diện...</div>
            </div>
          ) : viewMode === "desktop" ? (
            <iframe
              className="w-full h-[750px] rounded-2xl bg-white shadow-2xl transition-all duration-300 border-0"
              srcDoc={previewHtml}
              title={`Preview Desktop: ${template.name}`}
            />
          ) : (
            <div className="py-6 flex justify-center bg-black/40 rounded-2xl">
              <div className="mx-auto w-[375px] h-[750px] rounded-[52px] border-[14px] border-gray-900 bg-gray-900 shadow-2xl relative overflow-hidden shrink-0">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 h-6 w-32 bg-gray-900 rounded-b-2xl z-10 flex items-center justify-center">
                  <div className="h-1.5 w-14 bg-gray-800 rounded-full" />
                </div>
                <div className="w-full h-full rounded-[38px] overflow-hidden bg-white shrink-0" style={{ transform: 'translateZ(0)', WebkitMaskImage: '-webkit-radial-gradient(white, black)' }}>
                  <iframe
                    className="w-full h-full border-0"
                    srcDoc={previewHtml}
                    title={`Preview Mobile: ${template.name}`}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
        
        {limitModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
            <div className="bg-[#0f172a] border border-white/10 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl animate-fade-in relative">
              <button
                onClick={() => setLimitModalOpen(false)}
                className="absolute top-4 right-4 text-white/40 hover:text-white transition"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
              
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/20 text-3xl text-rose-400">
                  ⚠️
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Đã hết lượt tạo</h3>
                <p className="text-sm text-white/70 leading-relaxed mb-6">
                  Bạn đã dùng hết số lượt tạo Landing Page ({user?.landing_pages_count || 1}/{user?.landing_page_limit || 1} trang). Vui lòng nâng cấp dịch vụ để tạo thêm!
                </p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setLimitModalOpen(false)}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-white/70 hover:bg-white/5 font-semibold transition text-sm"
                  >
                    Đóng
                  </button>
                  <button
                    onClick={() => {
                      setLimitModalOpen(false);
                      navigate("/upgrade");
                    }}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-transparent border border-rose-500 text-rose-400 hover:bg-rose-500/10 font-bold transition text-sm"
                  >
                    Nâng cấp ngay
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
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
                      {PAGE_BASE_URL}/
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
                      <span>Link của bạn sẽ là: <strong className="text-violet-300">{PAGE_BASE_URL}/{customSlug.trim().toLowerCase().replace(/[^a-z0-9-_]/g, "-")}</strong></span>
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
                        ) : field.type?.toLowerCase() === "image" || (field as any).html_tag?.toLowerCase() === "img" ? (
                          <div className="mt-1 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                            <input
                              type="text"
                              value={v}
                              onChange={(e) => setValues((s) => ({ ...s, [field.key]: e.target.value }))}
                              className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 outline-none focus:border-white/30"
                              placeholder={getCleanScalar(field.default_value) || "Nhập link ảnh hoặc tải lên..."}
                            />
                            <div className="relative shrink-0">
                              <input 
                                type="file" 
                                accept="image/jpeg,image/png,image/jpg,image/gif,image/webp"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                disabled={uploadingFields[field.key]}
                                onChange={(e) => {
                                  if (e.target.files && e.target.files[0]) {
                                    handleImageUpload(e.target.files[0], field.key);
                                  }
                                  e.target.value = ''; // reset
                                }}
                              />
                              <button 
                                type="button" 
                                disabled={uploadingFields[field.key]}
                                className="h-[46px] px-4 inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 text-sm font-semibold text-white/90 hover:bg-white/15 hover:border-white/30 transition shadow-sm disabled:opacity-50 relative z-0"
                              >
                                {uploadingFields[field.key] ? (
                                  <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> Đang tải...</>
                                ) : (
                                  <>Upload ảnh</>
                                )}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <input
                            type="text"
                            value={v}
                            onChange={(e) => setValues((s) => ({ ...s, [field.key]: e.target.value }))}
                            className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 outline-none focus:border-white/30"
                            placeholder={getCleanScalar(field.default_value)}
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

              <div className="mt-6 flex flex-col sm:flex-row items-center justify-end gap-3">
                {!token ? (
                  <div className="w-full rounded-xl border border-amber-400/30 bg-amber-500/10 p-3.5 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
                    <span className="text-xs text-amber-200 font-medium">Bạn cần đăng nhập để có thể lưu và xuất bản trang landing page này.</span>
                    <Link to="/login" className="primary-btn shrink-0 px-4 py-2 text-xs font-semibold">Đăng nhập ngay</Link>
                  </div>
                ) : isLimitReached ? (
                  <div className="w-full rounded-xl border border-rose-400/30 bg-rose-500/10 p-3.5 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
                    <span className="text-xs text-rose-200 font-medium">
                      Bạn đã dùng hết số lượt tạo Landing Page ({user?.landing_pages_count || 1}/{user?.landing_page_limit || 1} trang). Vui lòng nâng cấp dịch vụ!
                    </span>
                    <Link to="/upgrade" className="shrink-0 px-4 py-2 rounded-xl bg-transparent border border-rose-500 text-rose-400 text-xs font-semibold hover:bg-rose-500/10 transition">
                      Gia hạn / Nâng cấp
                    </Link>
                  </div>
                ) : (
                  <button
                    type="submit"
                    className="primary-btn w-full justify-center py-3 sm:w-auto"
                    disabled={loading}
                  >
                    {loading ? "Đang tạo..." : "Tạo landing page ngay"}
                  </button>
                )}
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
              {previewError && (
                <div className="text-xs text-rose-300 bg-rose-500/20 px-2 py-1 rounded">
                  {previewError}
                </div>
              )}

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
                    <div className="w-full h-[640px] rounded-[36px] overflow-hidden bg-white transition-all duration-300" style={{ transform: 'translateZ(0)', WebkitMaskImage: '-webkit-radial-gradient(white, black)' }}>
                      <iframe
                        className="w-full h-full border-0"
                        srcDoc={previewHtml}
                        title="Live Preview Mobile"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </GlassCard>
        </div>
      </div>

      {limitModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-[#0f172a] border border-white/10 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl animate-fade-in relative">
            <button
              onClick={() => setLimitModalOpen(false)}
              className="absolute top-4 right-4 text-white/40 hover:text-white transition"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
            
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/20 text-3xl text-rose-400">
                ⚠️
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Đã hết lượt tạo</h3>
              <p className="text-sm text-white/70 leading-relaxed mb-6">
                Bạn đã dùng hết số lượt tạo Landing Page ({user?.landing_pages_count || 1}/{user?.landing_page_limit || 1} trang). Vui lòng nâng cấp dịch vụ để tạo thêm!
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setLimitModalOpen(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-white/70 hover:bg-white/5 font-semibold transition text-sm"
                >
                  Đóng
                </button>
                <button
                  onClick={() => {
                    setLimitModalOpen(false);
                    navigate("/upgrade");
                  }}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-transparent border border-rose-500 text-rose-400 hover:bg-rose-500/10 font-bold transition text-sm"
                >
                  Nâng cấp ngay
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

