import React, { useState, useEffect } from "react";
import { useAuthStore } from "../../store/authStore";
import {
  fetchPlans,
  createAdminPlan,
  updateAdminPlan,
  deleteAdminPlan,
} from "../../services/planApi";
import type { PlanResource, PlanPayload } from "../../services/planApi";

export default function AdminPlans() {
  const token = useAuthStore((s) => s.token);
  const [plans, setPlans] = useState<PlanResource[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form Create States
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("0");
  const [durationDays, setDurationDays] = useState("30");
  const [landingPageLimit, setLandingPageLimit] = useState("10");
  const [customDomain, setCustomDomain] = useState(false);
  const [premiumTemplates, setPremiumTemplates] = useState(false);
  const [creating, setCreating] = useState(false);

  // Form Edit States
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editPrice, setEditPrice] = useState("0");
  const [editDuration, setEditDuration] = useState("30");
  const [editLimit, setEditLimit] = useState("10");
  const [editDomain, setEditDomain] = useState(false);
  const [editPremium, setEditPremium] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);

  const loadPlans = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPlans(token);
      setPlans(data);
    } catch (e: any) {
      setError(e?.message || "Lỗi tải danh sách gói tài khoản.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, [token]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setCreating(true);
    setError(null);
    setSuccess(null);

    try {
      if (!name.trim() || !slug.trim()) {
        throw new Error("Vui lòng điền đầy đủ Tên gói và Mã nhận diện (Slug)");
      }

      const payload: PlanPayload = {
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim() || null,
        price: Number(price) || 0,
        duration_days: Number(durationDays) || 30,
        landing_page_limit: Number(landingPageLimit) || 1,
        custom_domain: customDomain,
        premium_templates: premiumTemplates,
      };

      await createAdminPlan(token, payload);
      setSuccess("Tạo gói tài khoản mới thành công!");
      setName("");
      setSlug("");
      setDescription("");
      setPrice("0");
      setDurationDays("30");
      setLandingPageLimit("10");
      setCustomDomain(false);
      setPremiumTemplates(false);
      loadPlans();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Tạo gói thất bại");
    } finally {
      setCreating(false);
    }
  };

  const startEdit = (p: PlanResource) => {
    setEditingId(p.id);
    setEditName(p.name);
    setEditSlug(p.slug);
    setEditDesc(p.description || "");
    setEditPrice(String(p.price));
    setEditDuration(String(p.duration_days ?? 30));
    setEditLimit(String(p.landing_page_limit));
    setEditDomain(p.custom_domain);
    setEditPremium(p.premium_templates);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const handleSaveEdit = async (id: number) => {
    if (!token) return;
    setSavingEdit(true);
    setError(null);
    setSuccess(null);

    try {
      const payload: Partial<PlanPayload> = {
        name: editName.trim(),
        slug: editSlug.trim(),
        description: editDesc.trim() || null,
        price: Number(editPrice) || 0,
        duration_days: Number(editDuration) || 30,
        landing_page_limit: Number(editLimit) || 1,
        custom_domain: editDomain,
        premium_templates: editPremium,
      };

      await updateAdminPlan(token, id, payload);
      setSuccess("Cập nhật gói tài khoản thành công!");
      setEditingId(null);
      loadPlans();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Cập nhật thất bại");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async (p: PlanResource) => {
    if (!token) return;
    if (["free", "starter"].includes(p.slug.toLowerCase())) {
      alert("Gói mặc định của hệ thống không thể xóa.");
      return;
    }
    if (!window.confirm(`Xác nhận xóa gói tài khoản "${p.name}"?`)) return;
    setError(null);
    setSuccess(null);
    try {
      const res = await deleteAdminPlan(token, p.id);
      setSuccess(res?.message || "Xóa gói thành công!");
      loadPlans();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Xóa gói thất bại");
    }
  };

  return (
    <div className="space-y-8">
      {/* Title section */}
      <div>
        <h1 className="text-2xl font-black text-white/95">Quản Lý Gói Tài Khoản (Plans)</h1>
        <p className="mt-1 text-sm text-white/60">
          Thiết lập, định giá và kiểm soát các đặc quyền của từng gói nâng hạng dành cho người dùng trên OriginD.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-200 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 text-sm font-medium">
          {success}
        </div>
      )}

      {/* Create Plan Box */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <h2 className="text-lg font-bold text-white mb-4">Tạo Gói Tài Khoản Mới</h2>
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-white/70 mb-1">Tên gói (Name)</label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!slug) {
                    setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
                  }
                }}
                className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-white outline-none focus:border-violet-400"
                placeholder="Ví dụ: Pro Plus"
                required
              />
            </div>

            <div>
              <label className="block text-xs text-white/70 mb-1">Mã nhận diện (Slug - Duy nhất)</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-white outline-none focus:border-violet-400 font-mono text-sm"
                placeholder="pro-plus"
                required
              />
            </div>

            <div>
              <label className="block text-xs text-white/70 mb-1">Mô tả quyền lợi ngắn gọn</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-white outline-none focus:border-violet-400"
                placeholder="Dành cho doanh nghiệp vừa và nhỏ..."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-white/70 mb-1">Giá gói (VNĐ)</label>
              <input
                type="text"
                value={price}
                onChange={(e) => setPrice(e.target.value.replace(/\D/g, ""))}
                className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-emerald-300 font-mono font-bold outline-none focus:border-violet-400"
                placeholder="499000"
                required
              />
            </div>

            <div>
              <label className="block text-xs text-white/70 mb-1">Giới hạn số trang Landing Page tạo tối đa</label>
              <input
                type="text"
                value={landingPageLimit}
                onChange={(e) => setLandingPageLimit(e.target.value.replace(/\D/g, ""))}
                className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-white font-mono outline-none focus:border-violet-400"
                placeholder="50"
                required
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 pt-2">
            <label className="inline-flex items-center gap-2 cursor-pointer text-sm text-white/80 select-none">
              <input
                type="checkbox"
                checked={customDomain}
                onChange={(e) => setCustomDomain(e.target.checked)}
                className="rounded border-white/20 bg-white/10 text-violet-600 focus:ring-0"
              />
              <span>Cho phép kết nối Tên Miền Riêng (Custom Domain)</span>
            </label>

            <label className="inline-flex items-center gap-2 cursor-pointer text-sm text-white/80 select-none">
              <input
                type="checkbox"
                checked={premiumTemplates}
                onChange={(e) => setPremiumTemplates(e.target.checked)}
                className="rounded border-white/20 bg-white/10 text-violet-600 focus:ring-0"
              />
              <span>Sử dụng kho mẫu Giao Diện Cao Cấp (Premium Templates)</span>
            </label>

            <button
              type="submit"
              disabled={creating}
              className="ml-auto px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 font-bold text-sm text-white transition shadow-lg disabled:opacity-50"
            >
              {creating ? "Đang xử lý..." : "Tạo Gói Mới"}
            </button>
          </div>
        </form>
      </div>

      {/* Plans List Table/Cards */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <h2 className="text-lg font-bold text-white mb-4">Danh Sách Các Gói Hiện Có</h2>

        {loading ? (
          <div className="py-12 text-center text-white/50 text-sm">Đang tải dữ liệu các gói...</div>
        ) : plans.length === 0 ? (
          <div className="py-12 text-center text-white/50 text-sm">Chưa có gói tài khoản nào.</div>
        ) : (
          <div className="space-y-4">
            {plans.map((p) => {
              const isEditing = editingId === p.id;
              const isDefault = ["free", "starter"].includes(p.slug.toLowerCase());

              return (
                <div
                  key={p.id}
                  className="p-5 rounded-xl border border-white/10 bg-white/[0.03] transition hover:border-white/20"
                >
                  {isEditing ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs text-white/60 mb-1">Tên gói</label>
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-white outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-white/60 mb-1">Mã Slug</label>
                          <input
                            type="text"
                            value={editSlug}
                            onChange={(e) => setEditSlug(e.target.value)}
                            className="w-full rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-white font-mono outline-none"
                            disabled={isDefault}
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-white/60 mb-1">Mô tả</label>
                          <input
                            type="text"
                            value={editDesc}
                            onChange={(e) => setEditDesc(e.target.value)}
                            className="w-full rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-white outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs text-white/60 mb-1">Giá gói (VNĐ)</label>
                          <input
                            type="text"
                            value={editPrice}
                            onChange={(e) => setEditPrice(e.target.value.replace(/\D/g, ""))}
                            className="w-full rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-emerald-300 font-mono font-bold outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-white/60 mb-1">Giới hạn Landing Page</label>
                          <input
                            type="text"
                            value={editLimit}
                            onChange={(e) => setEditLimit(e.target.value.replace(/\D/g, ""))}
                            className="w-full rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-white font-mono outline-none"
                          />
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                        <div className="flex flex-wrap items-center gap-6">
                          <label className="inline-flex items-center gap-2 cursor-pointer text-sm text-white/80 select-none">
                            <input
                              type="checkbox"
                              checked={editDomain}
                              onChange={(e) => setEditDomain(e.target.checked)}
                              className="rounded border-white/20 bg-white/10 text-violet-600 focus:ring-0"
                            />
                            <span>Tên miền riêng</span>
                          </label>

                          <label className="inline-flex items-center gap-2 cursor-pointer text-sm text-white/80 select-none">
                            <input
                              type="checkbox"
                              checked={editPremium}
                              onChange={(e) => setEditPremium(e.target.checked)}
                              className="rounded border-white/20 bg-white/10 text-violet-600 focus:ring-0"
                            />
                            <span>Mẫu Premium</span>
                          </label>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={cancelEdit}
                            className="px-4 py-2 rounded-xl border border-white/15 bg-white/5 text-xs font-semibold text-white/70 hover:bg-white/10 transition"
                          >
                            Hủy
                          </button>
                          <button
                            type="button"
                            disabled={savingEdit}
                            onClick={() => handleSaveEdit(p.id)}
                            className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-xs font-bold text-white transition shadow-md disabled:opacity-50"
                          >
                            {savingEdit ? "Đang lưu..." : "Lưu Thay Đổi"}
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <span className="text-base font-bold text-white">{p.name}</span>
                          <span className="px-2 py-0.5 rounded border border-white/10 bg-white/5 text-[11px] font-mono text-white/60">
                            {p.slug}
                          </span>
                          <span className="px-2.5 py-0.5 rounded border border-emerald-400/30 bg-emerald-500/15 text-xs font-mono font-bold text-emerald-300">
                            {Number(p.price) <= 0 ? "Miễn Phí" : `${Number(p.price).toLocaleString("vi-VN")} đ`}
                          </span>
                        </div>

                        {p.description && (
                          <div className="text-xs text-white/60">{p.description}</div>
                        )}

                        <div className="flex flex-wrap items-center gap-4 text-xs text-white/70 pt-1">
                          <div>
                            Giới hạn tạo: <strong className="text-white font-mono">{p.landing_page_limit > 900000 ? "Không giới hạn" : `${p.landing_page_limit} trang`}</strong>
                          </div>
                          <div>•</div>
                          <div>
                            Tên miền riêng: <strong className={p.custom_domain ? "text-emerald-300" : "text-white/40"}>{p.custom_domain ? "Cho phép" : "Không"}</strong>
                          </div>
                          <div>•</div>
                          <div>
                            Kho mẫu Premium: <strong className={p.premium_templates ? "text-emerald-300" : "text-white/40"}>{p.premium_templates ? "Có" : "Không"}</strong>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => startEdit(p)}
                          className="px-3.5 py-2 rounded-xl border border-blue-400/30 bg-blue-500/10 text-xs font-semibold text-blue-300 hover:bg-blue-500/20 transition"
                        >
                          Sửa
                        </button>
                        {!isDefault && (
                          <button
                            type="button"
                            onClick={() => handleDelete(p)}
                            className="px-3.5 py-2 rounded-xl border border-rose-400/30 bg-rose-500/10 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 transition"
                          >
                            Xóa
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
