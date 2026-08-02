import { useEffect, useMemo, useState } from "react";

import GlassCard from "../../components/common/GlassCard";
import PageSection from "../../components/common/PageSection";
import { useAuthStore } from "../../store/authStore";
import {
  deleteLandingPage,
  fetchMyLandingPages,
  fetchLandingPage,
  updateLandingPage,
} from "../../services/landingPageApi";
import { previewTemplate } from "../../services/landingPageRenderApi";
import { PAGE_BASE_URL } from "../../config/api";
import { renewService } from "../../services/depositApi";
import DepositModal from "../../components/common/DepositModal";
import { uploadImage } from "../../services/uploadApi";

function FakeStatRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      <span className="text-sm text-white/70">{label}</span>
      <span className="text-sm font-bold text-white/90 text-right">{value}</span>
    </div>
  );
}

export default function Stats() {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user) as any;


  const [pages, setPages] = useState<any[]>(() => {
    try {
      const raw = sessionStorage.getItem("cached_user_pages");
      if (raw) return JSON.parse(raw);
    } catch(e) {}
    return [];
  });
  const [loading, setLoading] = useState(pages.length === 0);
  const [error, setError] = useState<string | null>(null);

  const [selectedPage, setSelectedPage] = useState<any | null>(null);

  // Edit Modal/Panel State
  const [editingPage, setEditingPage] = useState<any | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [editStatus, setEditStatus] = useState("draft");
  const [editValues, setEditValues] = useState<Record<string, any>>({});
  const [editPreviewHtml, setEditPreviewHtml] = useState("");
  const [editPreviewLoading, setEditPreviewLoading] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editViewMode, setEditViewMode] = useState<"desktop" | "mobile">("desktop");
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [renewLoadingId, setRenewLoadingId] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [uploadingFields, setUploadingFields] = useState<Record<string, boolean>>({});

  const [renewTargetPage, setRenewTargetPage] = useState<any | null>(null);
  const [renewMonths, setRenewMonths] = useState<number>(1);

  function openRenewModal(p: any) {
    setRenewTargetPage(p);
    setRenewMonths(1);
  }

  async function handleConfirmRenew() {
    if (!renewTargetPage) return;
    const p = renewTargetPage;
    const baseCost = p.template?.renewal_price != null ? p.template.renewal_price : 50000;
    const totalCost = baseCost * renewMonths;
    const totalCostStr = totalCost.toLocaleString("vi-VN");

    setRenewLoadingId(p.id);
    try {
      const res = await renewService(token, p.id, renewMonths);
      setSuccessMessage(res.message);
      setRenewTargetPage(null);
      loadPages();
    } catch (e: any) {
      setErrorMessage(e?.response?.data?.message || `⚠️ Rất tiếc, số dư hiện tại không đủ để thanh toán ${totalCostStr} VNĐ. Vui lòng nạp thêm tiền!`);
      setRenewTargetPage(null);
    } finally {
      setRenewLoadingId(null);
    }
  }

  async function loadPages() {
    if (pages.length === 0) setLoading(true);
    setError(null);
    try {
      const res = await fetchMyLandingPages(token);
      const list = Array.isArray((res as any)?.data) ? (res as any).data : Array.isArray(res) ? res : [];
      setPages(list ?? []);
      try {
        sessionStorage.setItem("cached_user_pages", JSON.stringify(list ?? []));
      } catch (e) {}
      if (list?.length > 0 && !selectedPage) {
        setSelectedPage(list[0]);
      }
    } catch (e: any) {
      setError(e?.response?.data?.message ?? e?.message ?? "Lỗi tải danh sách landing page");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (token) {
      loadPages();
    }
  }, [token]);

  // Live preview effect for editing mode
  useEffect(() => {
    if (!editingPage) return;
    let isMounted = true;
    setEditPreviewLoading(true);

    const timer = setTimeout(async () => {
      try {
        const html = await previewTemplate(editingPage.template_id, editValues, token);
        if (isMounted) {
          setEditPreviewHtml(html);
        }
      } catch (err) {
        console.error("Edit preview error:", err);
      } finally {
        if (isMounted) {
          setEditPreviewLoading(false);
        }
      }
    }, 350);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [editingPage?.template_id, editValues, token]);

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

  const handleImageUpload = async (file: File, fieldKey: string) => {
    if (!token) {
      alert("Bạn cần đăng nhập để tải ảnh lên");
      return;
    }
    setUploadingFields(s => ({ ...s, [fieldKey]: true }));
    try {
      const res = await uploadImage(file, token);
      if (res.success && res.url) {
        setEditValues((s) => ({ ...s, [fieldKey]: res.url as string }));
      }
    } catch (err: any) {
      alert(err.message || "Lỗi tải ảnh");
    } finally {
      setUploadingFields(s => ({ ...s, [fieldKey]: false }));
    }
  };

  async function handleOpenEdit(p: any) {
    let targetPage = p;
    if (!targetPage.template?.fields || targetPage.template.fields.length === 0) {
      try {
        const res = await fetchLandingPage(p.id, token);
        if (res?.data) {
          targetPage = res.data;
        }
      } catch (err) {}
    }
    setEditingPage(targetPage);
    setEditTitle(targetPage.title ?? "");
    setEditSlug(targetPage.slug ?? "");
    setEditStatus(targetPage.status ?? "draft");
    const cleaned: Record<string, any> = {};
    if (typeof targetPage.data === "object" && targetPage.data !== null) {
      for (const [k, v] of Object.entries(targetPage.data)) {
        cleaned[k] = getCleanScalar(v);
      }
    }
    setEditValues(cleaned);
  }

  async function handleTogglePageStatus(p: any) {
    if (!token) return;
    if (p.status === "published") {
      alert("Trang này đã được xuất bản thành công và không thể chuyển về bản nháp (draft) nữa.");
      return;
    }
    if (!window.confirm(`Bạn có chắc chắn muốn xuất bản chính thức trang "${p.title}" lên Internet?`)) return;
    try {
      await updateLandingPage(p.id, { status: "published" }, token);
      await loadPages();
    } catch (err: any) {
      alert(err?.response?.data?.message ?? err?.message ?? "Lỗi xuất bản trang");
    }
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingPage) return;
    setSavingEdit(true);
    try {
      await updateLandingPage(editingPage.id, { title: editTitle, slug: editSlug.trim() || undefined, status: editStatus, data: editValues }, token);
      await loadPages();
      setEditingPage(null);
    } catch (err: any) {
      alert(err?.response?.data?.message ?? err?.message ?? "Lỗi cập nhật");
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm("Bạn có chắc chắn muốn xóa Landing Page này?")) return;
    try {
      await deleteLandingPage(id, token);
      setPages((prev) => prev.filter((p) => p.id !== id));
      if (selectedPage?.id === id) {
        setSelectedPage(null);
      }
    } catch (err: any) {
      alert(err?.response?.data?.message ?? err?.message ?? "Lỗi xóa Landing Page");
    }
  }

  const computedStats = useMemo(() => {
    return {
      total: pages.length,
    };
  }, [pages]);

  // Nếu đang mở khung chỉnh sửa (Edit Mode)
  if (editingPage) {
    const templateFields = editingPage?.template?.fields ?? [];
    return (
      <div>
        <PageSection
          title={`Chỉnh sửa: ${editingPage.title}`}
          subtitle="Sửa dữ liệu trang và xem trước giao diện cập nhật ngay theo thời gian thực"
        />

        <div className="mt-4 grid grid-cols-1 gap-6 xl:grid-cols-12">
          {/* Form Sửa */}
          <div className="xl:col-span-5">
            <form onSubmit={handleSaveEdit}>
              <GlassCard>
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <div className="text-white/90 text-sm font-semibold">Cập nhật thông tin</div>
                    <div className="text-white/60 text-xs">Mọi thay đổi sẽ hiển thị ngay bên khung xem trước</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditingPage(null)}
                    className="ghost-btn px-3 py-1.5 text-xs"
                  >
                    Hủy / Quay lại
                  </button>
                </div>

                <div className="flex flex-col gap-4">
                  <div>
                    <label className="block text-sm text-white/70">Tên trang (Title) *</label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      required
                      className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white outline-none focus:border-white/30"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-white/70">Đường dẫn URL (Slug)</label>
                    <div className="mt-1 flex items-center rounded-xl border border-white/15 bg-black/30 overflow-hidden focus-within:border-violet-400">
                      <span className="bg-white/10 px-3 py-3 text-xs font-mono text-white/50 border-r border-white/10 select-none">
                        /page/
                      </span>
                      <input
                        type="text"
                        value={editSlug}
                        onChange={(e) => setEditSlug(e.target.value)}
                        className="w-full bg-transparent px-3 py-3 text-sm text-white outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-white/70">Trạng thái (Status)</label>
                    {editingPage?.status === "published" ? (
                      <div className="mt-1 flex items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-300">
                        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span>Xuất Bản Thành Công</span>
                      </div>
                    ) : (
                      <select
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-white/15 bg-slate-900 px-4 py-3 text-white outline-none focus:border-white/30"
                      >
                        <option value="draft">Draft (Bản nháp - Đang chỉnh sửa)</option>
                        <option value="published">Xuất bản (Hoạt động chính thức)</option>
                      </select>
                    )}
                  </div>

                  {templateFields
                    .slice()
                    .sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
                    .map((field: any) => {
                      const v = editValues[field.key] ?? "";
                      return (
                        <div key={field.id}>
                          <label className="block text-sm text-white/70">
                            {field.label}
                            {field.required ? " *" : ""}
                          </label>
                          {field.type?.toLowerCase() === "textarea" ? (
                            <textarea
                              value={v}
                              onChange={(e) =>
                                setEditValues((s) => ({ ...s, [field.key]: e.target.value }))
                              }
                              className="mt-1 min-h-[90px] w-full resize-y rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white outline-none focus:border-white/30"
                            />
                          ) : field.type?.toLowerCase() === "number" ? (
                            <input
                              type="number"
                              value={v}
                              onChange={(e) =>
                                setEditValues((s) => ({ ...s, [field.key]: e.target.value }))
                              }
                              className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white outline-none focus:border-white/30"
                            />
                          ) : field.type?.toLowerCase() === "image" || (field as any).html_tag?.toLowerCase() === "img" ? (
                            <div className="mt-1 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                              <input
                                type="text"
                                value={v}
                                onChange={(e) =>
                                  setEditValues((s) => ({ ...s, [field.key]: e.target.value }))
                                }
                                className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 outline-none focus:border-white/30"
                                placeholder="Nhập link ảnh hoặc tải lên..."
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
                              onChange={(e) =>
                                setEditValues((s) => ({ ...s, [field.key]: e.target.value }))
                              }
                              className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white outline-none focus:border-white/30"
                            />
                          )}
                        </div>
                      );
                    })}
                </div>

                <div className="mt-6 flex items-center justify-end gap-3">
                  <button
                    type="submit"
                    className="primary-btn w-full justify-center py-3 sm:w-auto"
                    disabled={savingEdit}
                  >
                    {savingEdit ? "Đang lưu..." : "Lưu thay đổi"}
                  </button>
                </div>
              </GlassCard>
            </form>
          </div>

          {/* Live Preview */}
          <div className="xl:col-span-7">
            <GlassCard>
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <div className="text-white/95 text-sm font-semibold">Live Preview</div>
                  {editPreviewLoading ? (
                    <span className="text-xs text-emerald-300/80 animate-pulse">(Đang cập nhật...)</span>
                  ) : null}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditViewMode("desktop")}
                    className={`px-3 py-1.5 text-xs rounded-xl font-medium transition-all ${
                      editViewMode === "desktop"
                        ? "bg-white/20 text-white shadow-lg border border-white/30"
                        : "bg-white/5 text-white/60 hover:text-white border border-white/10"
                    }`}
                  >
                    Desktop
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditViewMode("mobile")}
                    className={`px-3 py-1.5 text-xs rounded-xl font-medium transition-all ${
                      editViewMode === "mobile"
                        ? "bg-white/20 text-white shadow-lg border border-white/30"
                        : "bg-white/5 text-white/60 hover:text-white border border-white/10"
                    }`}
                  >
                    Mobile
                  </button>
                </div>
              </div>

              <div className="relative mt-3 overflow-hidden rounded-2xl border border-white/15 bg-slate-950/40 p-3 backdrop-blur-md">
                {editViewMode === "desktop" ? (
                  <iframe
                    className="w-full h-[650px] rounded-xl bg-white shadow-2xl transition-all duration-300"
                    srcDoc={editPreviewHtml}
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
                          srcDoc={editPreviewHtml}
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
      </div>
    );
  }

  return (
    <div>
      <PageSection
        title="Quản lý & Thống kê Landing Pages"
        subtitle="Xem danh sách các trang đã tạo từ template, chỉnh sửa, xóa và theo dõi số liệu"
      >
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          {/* Cột trái: Danh sách các trang đã tạo */}
          <div className="lg:col-span-1">
            <GlassCard title="Các trang đã tạo">
              {loading ? (
                <div className="py-6 text-center text-sm text-white/60 animate-pulse">Đang tải danh sách...</div>
              ) : error ? (
                <div className="rounded-xl border border-rose-400/30 bg-rose-500/10 p-3 text-xs text-rose-200">{error}</div>
              ) : pages.length === 0 ? (
                <div className="py-8 text-center text-sm text-white/50">
                  Chưa có trang nào được tạo.
                  <div className="mt-3">
                    <a href="/templates" className="primary-btn inline-flex px-4 py-2 text-xs">
                      Tạo ngay từ Template
                    </a>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3 max-h-[560px] overflow-y-auto pr-1">
                  {pages.map((p) => {
                    const isSelected = selectedPage?.id === p.id;
                    return (
                      <div
                        key={p.id}
                        onClick={() => setSelectedPage(p)}
                        className={`cursor-pointer rounded-2xl border p-3.5 transition-all ${
                          isSelected
                            ? "border-violet-400/50 bg-violet-500/15 shadow-lg shadow-violet-500/10"
                            : "border-white/10 bg-white/5 hover:bg-white/10"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="text-sm font-semibold text-white/95">{p.title}</div>
                            <div className="text-xs text-white/55 mt-0.5">
                              Template: {p.template?.name ?? `#${p.template_id}`}
                            </div>
                            {p.expires_at ? (
                              <div className="mt-1.5 text-xs font-medium">
                                {new Date(p.expires_at).getTime() < Date.now() ? (
                                  <span className="text-rose-400 font-semibold">
                                    Hết hạn: {new Date(p.expires_at).toLocaleDateString("vi-VN")} (Đã hết hạn)
                                  </span>
                                ) : (
                                  <span className="text-emerald-300/90">
                                    Hết hạn: {new Date(p.expires_at).toLocaleDateString("vi-VN")}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <div className="mt-1.5 text-xs text-white/50">Hết hạn: Không giới hạn</div>
                            )}
                          </div>
                          <span
                            className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold tracking-wider ${
                              p.status === "published"
                                ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-300"
                                : "border-amber-400/40 bg-amber-500/15 text-amber-300"
                            }`}
                          >
                            {p.status === "published" ? "Published" : "Draft"}
                          </span>
                        </div>

                        <div className="mt-3.5 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-3">
                          <a
                            href={`${PAGE_BASE_URL}/${p.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-xs font-medium text-violet-300 hover:text-violet-200 hover:underline shrink-0"
                          >
                            Xem trang
                          </a>

                          <div className="flex flex-wrap items-center gap-2">
                            {p.status === "published" ? (
                              <span
                                className="inline-flex items-center justify-center h-8 px-3 rounded-xl border border-emerald-400/30 bg-emerald-500/10 text-xs font-semibold text-emerald-300 select-none shadow-sm transition shrink-0"
                                title="Trang đã xuất bản thành công và đang hoạt động chính thức trên Internet"
                              >
                                <span>Thành công</span>
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleTogglePageStatus(p);
                                }}
                                className="inline-flex items-center justify-center h-8 px-3 rounded-xl border border-amber-400/30 bg-amber-500/10 text-xs font-semibold text-amber-300 hover:bg-amber-500/20 shadow-sm transition shrink-0"
                                title="Click để xuất bản chính thức trang này lên Internet"
                              >
                                <span>Xuất bản</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                openRenewModal(p);
                              }}
                              disabled={renewLoadingId === p.id}
                              className="inline-flex items-center justify-center gap-1.5 h-8 px-3 rounded-xl border border-violet-400/40 bg-gradient-to-r from-violet-600/30 to-indigo-600/30 text-xs font-semibold text-violet-200 hover:from-violet-600/50 hover:to-indigo-600/50 shadow-sm transition shrink-0 disabled:opacity-50"
                              title="Gia hạn Landing Page"
                            >
                              <span>Gia hạn {renewLoadingId === p.id ? "..." : ""}</span>
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenEdit(p);
                              }}
                              className="inline-flex items-center justify-center h-8 px-3 rounded-xl border border-white/20 bg-white/5 text-xs font-semibold text-white/90 hover:bg-white/15 hover:border-white/30 shadow-sm transition shrink-0"
                            >
                              <span>Sửa</span>
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(p.id);
                              }}
                              className="inline-flex items-center justify-center h-8 px-3 rounded-xl border border-rose-400/30 bg-rose-500/10 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 shadow-sm transition shrink-0"
                            >
                              <span>Xóa</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </GlassCard>
          </div>

          {/* Cột phải: Thống kê & Chi tiết dữ liệu */}
          <div className="lg:col-span-2">
            <GlassCard>
              <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div>
                  <div className="card-title text-white/90 font-bold">Thống kê dữ liệu</div>
                  <div className="card-subtitle mt-1 text-white/60 text-xs">
                    {selectedPage ? `URL: ${PAGE_BASE_URL}/${selectedPage.slug}` : "Tổng quan toàn bộ tài khoản"}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-white/70 whitespace-nowrap">Thống kê cho:</span>
                  <select
                    className="w-full sm:w-auto rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/90 outline-none focus:border-violet-400"
                    value={selectedPage ? selectedPage.id : ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (!val) setSelectedPage(null);
                      else {
                        const p = pages.find((p) => String(p.id) === val);
                        if (p) setSelectedPage(p);
                      }
                    }}
                  >
                    <option value="" className="bg-slate-800 text-white">Tất cả (Tổng quan)</option>
                    {pages.map((p) => (
                      <option key={p.id} value={p.id} className="bg-slate-800 text-white">
                        {p.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {!selectedPage ? (
                  <>
                    <FakeStatRow label="Tổng số trang đã tạo" value={`${user?.total_pages_created || 0} trang`} />
                    <FakeStatRow label="Số trang hiện có" value={`${computedStats.total} trang`} />
                    <FakeStatRow label="Số trang đã xóa" value={`${(user?.total_pages_created || 0) - computedStats.total} trang`} />
                    <FakeStatRow 
                      label="Lượt tạo trang còn lại" 
                      value={(user?.landing_page_limit || 0) > 900 ? "Không giới hạn" : `${Math.max(0, (user?.landing_page_limit || 0) - (user?.total_pages_created || 0))} lượt`} 
                    />
                  </>
                ) : (
                  <FakeStatRow
                    label="Thời gian hết hạn"
                    value={selectedPage.expires_at ? new Date(selectedPage.expires_at).toLocaleDateString("vi-VN") + (new Date(selectedPage.expires_at).getTime() < Date.now() ? " (Đã hết hạn)" : "") : "Không giới hạn"}
                  />
                )}
              </div>


            </GlassCard>


          </div>
        </div>
      </PageSection>

      {renewTargetPage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-[#0f172a] p-6 shadow-2xl animate-fade-in">
            <h3 className="text-lg font-bold text-white mb-2">Gia hạn Landing Page</h3>
            <p className="text-sm text-white/70 mb-4">
              Chọn thời gian gia hạn cho trang "<span className="text-white font-semibold">{renewTargetPage.title}</span>".
            </p>
            
            <div className="mb-4">
              <label className="block text-xs font-semibold text-white/60 mb-2 uppercase tracking-wider">Thời gian gia hạn</label>
              <select 
                value={renewMonths}
                onChange={(e) => setRenewMonths(Number(e.target.value))}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-violet-400"
              >
                <option value={1} className="bg-slate-800 text-white">1 tháng (30 ngày)</option>
                <option value={2} className="bg-slate-800 text-white">2 tháng (60 ngày)</option>
                <option value={4} className="bg-slate-800 text-white">4 tháng (120 ngày)</option>
                <option value={6} className="bg-slate-800 text-white">6 tháng (180 ngày)</option>
                <option value={12} className="bg-slate-800 text-white">1 năm (360 ngày)</option>
              </select>
            </div>
            
            <div className="mb-6 rounded-xl bg-violet-500/10 border border-violet-500/20 p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/70">Tổng thanh toán:</span>
                <span className="text-base font-bold text-violet-400">
                  {((renewTargetPage.template?.renewal_price != null ? renewTargetPage.template.renewal_price : 50000) * renewMonths).toLocaleString("vi-VN")} VNĐ
                </span>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={() => setRenewTargetPage(null)}
                className="flex-1 rounded-xl bg-white/5 px-4 py-2.5 text-sm font-semibold text-white/70 hover:bg-white/10 transition"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={handleConfirmRenew}
                disabled={renewLoadingId === renewTargetPage.id}
                className="flex-1 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2.5 text-sm font-bold text-white hover:opacity-90 shadow-lg transition disabled:opacity-50"
              >
                {renewLoadingId === renewTargetPage.id ? "Đang xử lý..." : "Xác nhận"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Thông Báo Thành Công */}
      {successMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl border border-emerald-500/30 bg-[#0f172a] p-6 shadow-2xl text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Thành công!</h3>
            <p className="text-sm text-white/80 mb-6">{successMessage}</p>
            <button 
              onClick={() => setSuccessMessage(null)}
              className="w-full rounded-xl bg-emerald-500/20 px-4 py-2.5 text-sm font-bold text-emerald-400 hover:bg-emerald-500/30 transition"
            >
              Hoàn tất
            </button>
          </div>
        </div>
      )}

      {/* Modal Thông Báo Lỗi (Thiếu Tiền) */}
      {errorMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl border border-rose-500/30 bg-[#0f172a] p-6 shadow-2xl text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-500/20 text-rose-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Không đủ số dư!</h3>
            <p className="text-sm text-white/80 mb-6 leading-relaxed">{errorMessage}</p>
            <div className="flex gap-3">
              <button 
                onClick={() => setErrorMessage(null)}
                className="flex-1 rounded-xl bg-white/5 px-4 py-2.5 text-sm font-semibold text-white/70 hover:bg-white/10 transition"
              >
                Đóng
              </button>
              <button 
                onClick={() => {
                  setErrorMessage(null);
                  setIsDepositModalOpen(true);
                }}
                className="flex-1 rounded-xl bg-rose-500/20 px-4 py-2.5 text-sm font-bold text-rose-400 hover:bg-rose-500/30 transition"
              >
                Nạp tiền ngay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nạp Tiền nếu thiếu tiền */}
      <DepositModal
        isOpen={isDepositModalOpen}
        onClose={() => setIsDepositModalOpen(false)}
        onSuccess={() => loadPages()}
        initialAmount={50000}
      />
    </div>
  );
}

