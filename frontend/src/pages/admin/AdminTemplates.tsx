import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import GlassCard from "../../components/common/GlassCard";
import PageSection from "../../components/common/PageSection";
import { useAuthStore } from "../../store/authStore";
import {
  fetchAdminTemplates,
  uploadTemplate,
  updateTemplate,
  deleteTemplate,
  type UploadTemplatePayload,
  type TemplateResource,
} from "../../services/templateApi";

export default function AdminTemplates() {
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);

  const [templates, setTemplates] = useState<TemplateResource[]>([]);
  const [loadingList, setLoadingList] = useState(false);

  // Edit State
  const [editingTemplate, setEditingTemplate] = useState<TemplateResource | null>(null);
  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editStatus, setEditStatus] = useState<string>("draft");
  const [editVersion, setEditVersion] = useState("");
  const [editRenewalPrice, setEditRenewalPrice] = useState<string>("50000");
  const [editThumbnail, setEditThumbnail] = useState<File | null>(null);
  const [editThumbnailPreview, setEditThumbnailPreview] = useState<string | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [version, setVersion] = useState("");
  const [status, setStatus] = useState<"draft" | "published" | "archived">(
    "draft"
  );
  const [renewalPrice, setRenewalPrice] = useState<string>("50000");
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [zipFile, setZipFile] = useState<File | null>(null);

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load templates once when token is available
  useMemo(() => {
    async function run() {
      if (!token) return;
      setLoadingList(true);
      setError(null);
      try {
        const data = await fetchAdminTemplates(token);
        // backend may return {data: ...} or plain
        const normalized = (data as any)?.data ?? data;
        setTemplates(normalized ?? []);
      } catch (e: any) {
        setError(e?.response?.data?.message ?? e?.message ?? "Lỗi tải templates");
      } finally {
        setLoadingList(false);
      }
    }
    run();
  }, [token]);

  function handleOpenEdit(t: TemplateResource) {
    setEditingTemplate(t);
    setEditName(t.name);
    setEditSlug(t.slug);
    setEditDesc(t.description ?? "");
    setEditStatus(t.status ?? "draft");
    setEditVersion(t.version ?? "1.0.0");
    setEditRenewalPrice(t.renewal_price != null ? String(t.renewal_price) : "50000");
    setEditThumbnail(null);
    setEditThumbnailPreview(t.thumbnail ?? null);
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingTemplate || !token) return;
    setSavingEdit(true);
    try {
      let payload: any;
      if (editThumbnail) {
        const formData = new FormData();
        formData.append("name", editName.trim());
        formData.append("slug", editSlug.trim());
        if (editDesc.trim()) formData.append("description", editDesc.trim());
        formData.append("status", editStatus);
        formData.append("version", editVersion.trim() || "1.0.0");
        formData.append("renewal_price", editRenewalPrice.trim() || "50000");
        formData.append("thumbnail", editThumbnail);
        payload = formData;
      } else {
        payload = {
          name: editName.trim(),
          slug: editSlug.trim(),
          description: editDesc.trim() || null,
          status: editStatus,
          version: editVersion.trim() || "1.0.0",
          renewal_price: Number(editRenewalPrice) || 50000,
          ...(editThumbnailPreview === null && editingTemplate.thumbnail ? { thumbnail: null } : {}),
        };
      }
      await updateTemplate(editingTemplate.id, payload, token);
      const data = await fetchAdminTemplates(token);
      setTemplates((data as any)?.data ?? data ?? []);
      setEditingTemplate(null);
      setEditThumbnail(null);
    } catch (err: any) {
      alert(err?.response?.data?.message ?? err?.message ?? "Lỗi cập nhật");
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleToggleStatus(t: TemplateResource) {
    if (!token) return;
    const newStatus = t.status === "published" ? "draft" : "published";
    try {
      await updateTemplate(t.id, { status: newStatus }, token);
      setTemplates((prev) =>
        prev.map((item) => (item.id === t.id ? { ...item, status: newStatus } : item))
      );
    } catch (err: any) {
      alert(err?.response?.data?.message ?? err?.message ?? "Lỗi đổi trạng thái");
    }
  }

  async function handleDeleteTemplate(t: TemplateResource) {
    if (!token) return;
    if (!confirm(`Bạn có chắc muốn xóa vĩnh viễn template "${t.name}" và toàn bộ file giải nén của nó?`)) return;
    try {
      await deleteTemplate(t.id, token);
      setTemplates((prev) => prev.filter((item) => item.id !== t.id));
    } catch (err: any) {
      alert(err?.response?.data?.message ?? err?.message ?? "Lỗi xóa template");
    }
  }

  function resetForm() {
    setName("");
    setSlug("");
    setDescription("");
    setVersion("");
    setStatus("draft");
    setRenewalPrice("50000");
    setThumbnail(null);
    setZipFile(null);
  }

  async function onUpload() {
    if (!token) return;
    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      if (!zipFile) throw new Error("Bạn chưa chọn file mẫu (.zip hoặc .html)");
      if (!name.trim()) throw new Error("Thiếu name");
      if (!slug.trim()) throw new Error("Thiếu slug");

      const payload: UploadTemplatePayload = {
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim() ? description.trim() : null,
        version: version.trim() ? version.trim() : null,
        status,
        renewal_price: Number(renewalPrice) || 50000,
        thumbnail,
        zip_file: zipFile,
      };

      const res = await uploadTemplate(payload, token);
      const created = (res as any)?.data ?? res;
      setTemplates((prev) => [created, ...prev]);
      setSuccess("Upload thành công. Đã quét và tạo template fields.");
      resetForm();
    } catch (e: any) {
      setError(e?.response?.data?.message ?? e?.message ?? "Upload thất bại");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/70">
          <span onClick={() => navigate("/admin")} className="cursor-pointer font-semibold text-violet-300 hover:underline">
            🏠 Admin Dashboard
          </span>
          <span>/</span>
          <span className="text-white">Quản lý Templates</span>
        </div>
        <button
          type="button"
          onClick={() => navigate("/admin")}
          className="ghost-btn px-4 py-2 text-xs self-start sm:self-center border-white/15"
        >
          ← Quay lại Trang Quản Trị
        </button>
      </div>

      <PageSection
        title="Admin • Quản lý Templates"
        subtitle="Upload ZIP chứa index.html để auto scan fields"
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="xl:col-span-5">
          <GlassCard title="Upload template (ZIP)" subtitle="Điền thông tin + chọn file .zip">
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="block">
                  <div className="text-xs text-white/60 mb-1">Name</div>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white/90 outline-none focus:border-white/20"
                    placeholder="Saas Landing"
                  />
                </label>

                <label className="block">
                  <div className="text-xs text-white/60 mb-1">Slug</div>
                  <input
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white/90 outline-none focus:border-white/20"
                    placeholder="saas-landing"
                  />
                </label>
              </div>

              <label className="block">
                <div className="text-xs text-white/60 mb-1">Description (optional)</div>
                <input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white/90 outline-none focus:border-white/20"
                  placeholder="Mô tả template"
                />
              </label>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <label className="block">
                  <div className="text-xs text-white/60 mb-1">Version (optional)</div>
                  <input
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white/90 outline-none focus:border-white/20"
                    placeholder="1.0.0"
                  />
                </label>

                <label className="block">
                  <div className="text-xs text-white/60 mb-1">Status</div>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white/90 outline-none focus:border-white/20"
                  >
                    <option value="draft">draft</option>
                    <option value="published">published</option>
                    <option value="archived">archived</option>
                  </select>
                </label>

                <label className="block">
                  <div className="text-xs text-white/60 mb-1">Giá gia hạn / tháng</div>
                  <input
                    type="text"
                    value={renewalPrice}
                    onChange={(e) => setRenewalPrice(e.target.value.replace(/\D/g, ""))}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white/90 outline-none focus:border-white/20"
                    placeholder="50000"
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="block">
                  <div className="text-xs text-white/60 mb-1">Thumbnail (optional image)</div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setThumbnail(e.target.files?.[0] ?? null)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white/90"
                  />
                </label>

                <label className="block">
                  <div className="text-xs text-white/60 mb-1">File mẫu (.zip hoặc .html) (bắt buộc)</div>
                  <input
                    type="file"
                    accept=".zip,.html,.htm,application/zip,text/html"
                    onChange={(e) => setZipFile(e.target.files?.[0] ?? null)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white/90"
                  />
                </label>
              </div>

              {error ? (
                <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
                  {error}
                </div>
              ) : null}
              {success ? (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
                  {success}
                </div>
              ) : null}

              <button
                type="button"
                onClick={onUpload}
                disabled={uploading}
                className="primary-btn w-full disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {uploading ? "Đang upload..." : "Upload & tạo template"}
              </button>
            </div>
          </GlassCard>
        </div>

        <div className="xl:col-span-7 min-w-0">
          <GlassCard title="Danh sách templates" subtitle={loadingList ? "Đang tải..." : ""}>
          <div className="space-y-3">
            {templates.length === 0 && !loadingList ? (
              <div className="text-sm text-white/60">Chưa có template nào.</div>
            ) : null}

            {loadingList ? (
              <div className="text-sm text-white/60">Loading...</div>
            ) : null}

            {templates.map((t) => (
              <div
                key={(t as any).id ?? t.slug}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 hover:border-white/20 transition min-w-0 overflow-hidden"
              >
                <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
                  {t.thumbnail ? (
                    <div className="h-16 w-24 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-black/20">
                      <img src={t.thumbnail} alt={t.name} className="h-full w-full object-cover" />
                    </div>
                  ) : (
                    <div className="flex h-16 w-24 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-[10px] text-white/40 font-medium">
                      No Image
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-white/90 truncate max-w-full">
                        {t.name}
                      </span>
                      <span
                        className={`text-[10px] uppercase font-bold rounded-full px-2 py-0.5 border shrink-0 ${
                          t.status === "published"
                            ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-300"
                            : "border-amber-400/30 bg-amber-500/10 text-amber-300"
                        }`}
                      >
                        {t.status ?? "draft"}
                      </span>
                      <span className="text-xs rounded-full border border-white/15 bg-white/5 px-2.5 py-0.5 text-white/70 shrink-0">
                        v{t.version ?? "1.0.0"}
                      </span>
                      <span className="text-xs font-mono font-bold rounded-full border border-emerald-400/30 bg-emerald-500/15 px-2.5 py-0.5 text-emerald-300 shrink-0 shadow-sm" title="Chi phí khi user gia hạn landing page dùng mẫu này">
                        💰 {(t.renewal_price != null ? t.renewal_price : 50000).toLocaleString("vi-VN")} đ / 30 ngày
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-white/60 font-mono truncate max-w-full">/templates/{t.slug}</div>
                    {t.description ? <div className="mt-1 text-xs text-white/50 line-clamp-1 break-words">{t.description}</div> : null}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 flex-wrap md:justify-end">
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(t)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition shrink-0 ${
                      t.status === "published"
                        ? "border-amber-400/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20"
                        : "border-emerald-400/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
                    }`}
                  >
                    {t.status === "published" ? "👁️‍🗨️ Ẩn (Draft)" : "👁️ Hiện (Publish)"}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenEdit(t)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-blue-400/30 bg-blue-500/10 text-blue-300 hover:bg-blue-500/20 transition shrink-0"
                  >
                    ✏️ Sửa
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteTemplate(t)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-rose-400/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 transition shrink-0"
                  >
                    🗑️ Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
        </div>
      </div>

      {editingTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl border border-white/20 bg-slate-900 p-6 shadow-2xl my-auto max-h-[90vh] flex flex-col">
            <div className="mb-4 flex items-center justify-between shrink-0">
              <h3 className="text-lg font-bold text-white truncate pr-4">Chỉnh sửa Template: {editingTemplate.name}</h3>
              <button
                type="button"
                onClick={() => setEditingTemplate(null)}
                className="rounded-full bg-white/10 p-1.5 text-white/70 hover:bg-white/20 hover:text-white shrink-0"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 overflow-y-auto pr-2 flex-1 min-h-0">
              <div>
                <label className="block text-xs text-white/70 mb-1">Tên Template (Name) *</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-white outline-none focus:border-violet-400"
                />
              </div>

              <div>
                <label className="block text-xs text-white/70 mb-1">Đường dẫn (Slug) *</label>
                <input
                  type="text"
                  value={editSlug}
                  onChange={(e) => setEditSlug(e.target.value)}
                  required
                  className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-white outline-none font-mono focus:border-violet-400"
                />
              </div>

              <div>
                <label className="block text-xs text-white/70 mb-1">Mô tả (Description)</label>
                <textarea
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  rows={2}
                  className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-white outline-none focus:border-violet-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-white/70 mb-1">Phiên bản (Version)</label>
                  <input
                    type="text"
                    value={editVersion}
                    onChange={(e) => setEditVersion(e.target.value)}
                    className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-white outline-none focus:border-violet-400"
                  />
                </div>

                <div>
                  <label className="block text-xs text-white/70 mb-1">Trạng thái (Status)</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full rounded-xl border border-white/15 bg-slate-800 px-3 py-2.5 text-white outline-none focus:border-violet-400"
                  >
                    <option value="draft">draft (Ẩn)</option>
                    <option value="published">published (Hiện)</option>
                    <option value="archived">archived (Lưu trữ)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-white/70 mb-1">
                  Giá gia hạn Landing Page (VNĐ / 30 ngày)
                </label>
                <input
                  type="text"
                  value={editRenewalPrice}
                  onChange={(e) => setEditRenewalPrice(e.target.value.replace(/\D/g, ""))}
                  className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-white outline-none focus:border-violet-400"
                  placeholder="Ví dụ: 50000"
                />
                <p className="mt-1 text-[11px] text-white/50">
                  Khi user gia hạn các Landing Page được tạo từ mẫu này, hệ thống sẽ trừ đúng số tiền này vào tài khoản của họ.
                </p>
              </div>

              <div>
                <label className="block text-xs text-white/70 mb-1">Hình ảnh (Thumbnail)</label>
                {editThumbnailPreview ? (
                  <div className="mb-2 relative w-full h-36 rounded-xl overflow-hidden border border-white/15 bg-black/30">
                    <img src={editThumbnailPreview} alt="Current thumbnail" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => { setEditThumbnail(null); setEditThumbnailPreview(null); }}
                      className="absolute top-2 right-2 rounded-full bg-rose-500/80 hover:bg-rose-500 px-2.5 py-1 text-xs text-white shadow backdrop-blur-md transition"
                    >
                      ✕ Gỡ ảnh
                    </button>
                  </div>
                ) : null}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] ?? null;
                    setEditThumbnail(file);
                    if (file) {
                      setEditThumbnailPreview(URL.createObjectURL(file));
                    }
                  }}
                  className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white/90"
                />
              </div>

              <div className="mt-4 flex items-center justify-end gap-3 pt-3 border-t border-white/10 shrink-0">
                <button
                  type="button"
                  onClick={() => setEditingTemplate(null)}
                  className="ghost-btn px-4 py-2 text-sm"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="primary-btn px-5 py-2 text-sm disabled:opacity-50"
                >
                  {savingEdit ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

