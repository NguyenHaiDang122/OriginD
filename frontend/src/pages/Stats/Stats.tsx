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

  async function handleOpenEdit(p: any) {
    setEditingPage(p);
    setEditTitle(p.title ?? "");
    setEditSlug(p.slug ?? "");
    setEditStatus(p.status ?? "draft");
    setEditValues(typeof p.data === "object" && p.data !== null ? { ...p.data } : {});
  }

  async function handleTogglePageStatus(p: any) {
    if (!token) return;
    const nextStatus = p.status === "published" ? "draft" : "published";
    try {
      await updateLandingPage(p.id, { status: nextStatus }, token);
      await loadPages();
    } catch (err: any) {
      alert(err?.response?.data?.message ?? err?.message ?? "Lỗi cập nhật trạng thái");
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
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-white/15 bg-slate-900 px-4 py-3 text-white outline-none focus:border-white/30"
                    >
                      <option value="draft">📝 Draft (Bản nháp - Đang thử nghiệm/chỉnh sửa)</option>
                      <option value="published">🚀 Published (Đã xuất bản - Hoạt động chính thức)</option>
                    </select>
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
                    💻 Desktop
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
                    📱 Mobile
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
                          </div>
                          <span
                            className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold tracking-wider ${
                              p.status === "published"
                                ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-300"
                                : "border-amber-400/40 bg-amber-500/15 text-amber-300"
                            }`}
                          >
                            {p.status === "published" ? "⚡ Published" : "📝 Draft"}
                          </span>
                        </div>

                        <div className="mt-3.5 flex items-center justify-between border-t border-white/10 pt-3">
                          <a
                            href={`http://localhost:8000/page/${p.slug}${p.status === "draft" && token ? `?token=${token}` : ""}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-xs font-medium text-violet-300 hover:text-violet-200 hover:underline flex items-center gap-1"
                          >
                            <span>Xem trang</span>
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTogglePageStatus(p);
                              }}
                              className={`px-2.5 py-1 text-xs rounded-xl font-semibold border transition ${
                                p.status === "published"
                                  ? "border-amber-400/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20"
                                  : "border-emerald-400/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
                              }`}
                              title={p.status === "published" ? "Chuyển về bản nháp" : "Chính thức xuất bản trang này"}
                            >
                              {p.status === "published" ? "👁️‍🗨️ Về Draft" : "🚀 Xuất bản"}
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenEdit(p);
                              }}
                              className="ghost-btn px-2.5 py-1 text-xs border border-white/20 hover:bg-white/20"
                            >
                              Sửa
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(p.id);
                              }}
                              className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-2.5 py-1 text-xs text-rose-300 hover:bg-rose-500/20 transition"
                            >
                              Xóa
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
              subtitle={selectedPage ? `URL: http://localhost:8000/page/${selectedPage.slug}` : "Toàn bộ tài khoản"}
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
                  <div className="text-xs rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-emerald-300 font-medium">
                    Active
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
    </div>
  );
}

