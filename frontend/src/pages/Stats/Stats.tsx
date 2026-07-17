import { useEffect, useMemo, useState } from "react";
import GlassCard from "../../components/common/GlassCard";
import PageSection from "../../components/common/PageSection";
import { useAuthStore } from "../../store/authStore";
import {
  deleteLandingPage,
  fetchMyLandingPages,
  updateLandingPage,
} from "../../services/landingPageApi";
import { previewTemplate } from "../../services/landingPageRenderApi";
import { PAGE_BASE_URL } from "../../config/api";
import { renewService } from "../../services/depositApi";
import DepositModal from "../../components/common/DepositModal";

function FakeStatRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      <span className="text-sm text-white/70">{label}</span>
      <span className="text-sm font-bold text-white/90">{value}</span>
    </div>
  );
}

export default function Stats() {
  const token = useAuthStore((s) => s.token);

  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
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

  async function handleRenewPage(p: any) {
    const cost = p.template?.renewal_price != null ? p.template.renewal_price : 50000;
    const costStr = cost.toLocaleString("vi-VN");
    if (!window.confirm(`Gia hạn trang Landing Page "${p.title}" thêm 30 ngày với chi phí ${costStr} VNĐ trừ từ số dư của bạn?`)) return;
    setRenewLoadingId(p.id);
    try {
      const res = await renewService(token, p.id);
      alert(res.message);
      loadPages();
    } catch (e: any) {
      alert(e?.response?.data?.message || `Số dư của bạn không đủ (cần ${costStr} đ). Vui lòng nạp tiền vào tài khoản!`);
      setIsDepositModalOpen(true);
    } finally {
      setRenewLoadingId(null);
    }
  }

  async function loadPages() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchMyLandingPages(token);
      const list = Array.isArray((res as any)?.data) ? (res as any).data : Array.isArray(res) ? res : [];
      setPages(list ?? []);
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

  async function handleOpenEdit(p: any) {
    setEditingPage(p);
    setEditTitle(p.title ?? "");
    setEditSlug(p.slug ?? "");
    setEditStatus(p.status ?? "draft");
    const cleaned: Record<string, any> = {};
    if (typeof p.data === "object" && p.data !== null) {
      for (const [k, v] of Object.entries(p.data)) {
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
    const total = pages.length;
    // Tạo số liệu random / ước tính cho demo dựa trên id
    let totalViews = 0;
    let totalLeads = 0;
    pages.forEach((p) => {
      const v = (p.id * 142 + 250) % 3500;
      totalViews += v;
      totalLeads += Math.floor(v * 0.045);
    });

    return {
      total,
      totalViews: totalViews.toLocaleString("en-US"),
      totalLeads: totalLeads.toLocaleString("en-US"),
      convRate: totalViews > 0 ? ((totalLeads / totalViews) * 100).toFixed(1) + "%" : "0%",
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
                        <span>🟢 Thành công (Không thể về Draft)</span>
                      </div>
                    ) : (
                      <select
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-white/15 bg-slate-900 px-4 py-3 text-white outline-none focus:border-white/30"
                      >
                        <option value="draft">📝 Draft (Bản nháp - Đang chỉnh sửa)</option>
                        <option value="published">🚀 Xuất bản (Hoạt động chính thức)</option>
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
                      <iframe
                        className="w-full h-[640px] rounded-[36px] bg-white transition-all duration-300 pt-5"
                        srcDoc={editPreviewHtml}
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
                            href={`${PAGE_BASE_URL}/${p.slug}${p.status === "draft" && token ? `?token=${token}` : ""}`}
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
                                handleRenewPage(p);
                              }}
                              disabled={renewLoadingId === p.id}
                              className="inline-flex items-center justify-center gap-1.5 h-8 px-3 rounded-xl border border-violet-400/40 bg-gradient-to-r from-violet-600/30 to-indigo-600/30 text-xs font-semibold text-violet-200 hover:from-violet-600/50 hover:to-indigo-600/50 shadow-sm transition shrink-0 disabled:opacity-50"
                              title={`Gia hạn thêm 30 ngày cho trang này (${(p.template?.renewal_price != null ? p.template.renewal_price : 50000).toLocaleString("vi-VN")} đ)`}
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
            <GlassCard
              title={selectedPage ? `Thống kê cho: ${selectedPage.title}` : "Tổng quan thống kê"}
              subtitle={selectedPage ? `URL: ${PAGE_BASE_URL}/${selectedPage.slug}` : "Toàn bộ tài khoản"}
            >
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <FakeStatRow label="Tổng trang đã tạo" value={`${computedStats.total} trang`} />
                <FakeStatRow
                  label="Tổng lượt xem (ước tính)"
                  value={selectedPage ? `${((selectedPage.id * 142 + 250) % 3500).toLocaleString()} lượt` : computedStats.totalViews}
                />
                <FakeStatRow
                  label="Khách hàng tiềm năng (Leads)"
                  value={selectedPage ? `${Math.floor(((selectedPage.id * 142 + 250) % 3500) * 0.045).toLocaleString()} leads` : computedStats.totalLeads}
                />
                <FakeStatRow label="Tỷ lệ chuyển đổi" value={computedStats.convRate} />
                {selectedPage ? (
                  <FakeStatRow
                    label="Thời gian hết hạn"
                    value={selectedPage.expires_at ? new Date(selectedPage.expires_at).toLocaleDateString("vi-VN") + (new Date(selectedPage.expires_at).getTime() < Date.now() ? " (Đã hết hạn)" : "") : "Không giới hạn"}
                  />
                ) : null}
              </div>

              {/* Biểu đồ lượt truy cập */}
              <div className="mt-5 rounded-3xl border border-white/10 bg-[#0b1220] p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-white/90">Biểu đồ lượt truy cập 7 ngày qua</div>
                    <div className="text-xs text-white/60 mt-1">
                      {selectedPage ? `Số liệu trang "${selectedPage.title}"` : "Số liệu tổng hợp"}
                    </div>
                  </div>
                  <div className={`text-xs rounded-full border px-3 py-1 font-medium ${
                    selectedPage && selectedPage.expires_at && new Date(selectedPage.expires_at).getTime() < Date.now()
                      ? "border-rose-400/30 bg-rose-500/10 text-rose-300"
                      : "border-emerald-400/30 bg-emerald-500/10 text-emerald-300"
                  }`}>
                    {selectedPage && selectedPage.expires_at && new Date(selectedPage.expires_at).getTime() < Date.now() ? "Expired" : "Active"}
                  </div>
                </div>

                <div className="mt-4 h-40 rounded-2xl bg-gradient-to-b from-white/5 to-transparent p-4 flex items-end gap-2">
                  {[18, 26, 14, 30, 22, 34, 28].map((v, idx) => {
                    const barVal = selectedPage ? (v * ((selectedPage.id % 3) + 1)) : v;
                    return (
                      <div key={idx} className="flex-1 flex flex-col justify-end items-center">
                        <div
                          className="w-full rounded-xl bg-gradient-to-t from-indigo-500/70 via-violet-500/50 to-fuchsia-500/40 hover:opacity-90 transition-all duration-300"
                          style={{ height: `${Math.min(barVal * 2.5, 120)}px` }}
                        />
                        <div className="mt-2 text-[11px] text-white/55">T{idx + 1}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </GlassCard>

            {/* Khung xem trước cấu hình trường dữ liệu (Data Inspector) */}
            {selectedPage && selectedPage.data ? (
              <div className="mt-5">
                <GlassCard title="Dữ liệu đã nhập (Data Fields)" subtitle="Các thông tin được lưu trên Landing Page này">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[220px] overflow-y-auto pr-1">
                    {Object.entries(selectedPage.data).map(([key, value], idx) => (
                      <div key={idx} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                        <div className="text-xs font-semibold text-violet-300 uppercase tracking-wider">{key}</div>
                        <div className="mt-1 text-xs text-white/80 truncate font-mono">
                          {typeof value === "object" ? JSON.stringify(value) : String(value)}
                        </div>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </div>
            ) : null}
          </div>
        </div>
      </PageSection>

      <DepositModal
        isOpen={isDepositModalOpen}
        onClose={() => setIsDepositModalOpen(false)}
        onSuccess={() => loadPages()}
        initialAmount={50000}
      />
    </div>
  );
}

