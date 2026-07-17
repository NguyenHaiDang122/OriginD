import React, { useEffect, useState } from "react";
import { useAuthStore } from "../../store/authStore";
import {
  fetchAdminCustomDomains,
  connectAdminCustomDomain,
  updateAdminCustomDomain,
  deleteAdminCustomDomain,
  type CustomDomainItem,
} from "../../services/customDomainApi";
import { useNavigate } from "react-router-dom";

export default function AdminCustomDomains() {
  const token = useAuthStore((s) => s.token);
  const navigate = useNavigate();

  const [domains, setDomains] = useState<CustomDomainItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form states
  const [showModal, setShowModal] = useState(false);
  const [editingDomain, setEditingDomain] = useState<CustomDomainItem | null>(null);
  const [landingPageInput, setLandingPageInput] = useState("");
  const [domainInput, setDomainInput] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadDomains = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminCustomDomains(token);
      setDomains(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Không thể tải danh sách tên miền.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDomains();
  }, [token]);

  const openCreateModal = () => {
    setEditingDomain(null);
    setLandingPageInput("");
    setDomainInput("");
    setError(null);
    setShowModal(true);
  };

  const openEditModal = (item: CustomDomainItem) => {
    setEditingDomain(item);
    setLandingPageInput(item.landing_page?.slug || String(item.landing_page_id));
    setDomainInput(item.domain);
    setError(null);
    setShowModal(true);
  };

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      let res;
      if (editingDomain) {
        res = await updateAdminCustomDomain(
          editingDomain.id,
          {
            landing_page: landingPageInput,
            domain: domainInput,
          },
          token
        );
      } else {
        res = await connectAdminCustomDomain(
          {
            landing_page: landingPageInput,
            domain: domainInput,
          },
          token
        );
      }
      setSuccess(res?.message || (editingDomain ? "Cập nhật kết nối thành công!" : "Kết nối tên miền thành công!"));
      setLandingPageInput("");
      setDomainInput("");
      setEditingDomain(null);
      setShowModal(false);
      loadDomains();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Lỗi khi xử lý tên miền.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number, domainName: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn hủy kết nối tên miền "${domainName}" khỏi hệ thống?`)) {
      return;
    }
    if (!token) return;
    try {
      await deleteAdminCustomDomain(id, token);
      setSuccess(`Đã hủy kết nối tên miền "${domainName}".`);
      loadDomains();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Không thể hủy kết nối tên miền.");
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 pb-16">
      {/* Header Bar */}
      <div className="border-b border-white/10 bg-[#0d121f]/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/admin")}
              className="rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/80 hover:bg-white/10 hover:text-white transition"
            >
              ← Quay lại Dashboard
            </button>
            <h1 className="text-xl font-extrabold text-white">Quản lý Kết Nối Domain Riêng</h1>
          </div>

          <button
            onClick={openCreateModal}
            className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-blue-500 transition"
          >
            + Kết nối Domain
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Alerts */}
        {error && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm font-medium text-red-300">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm font-medium text-emerald-300">
            {success}
          </div>
        )}

        {/* Instructions Box */}
        <div className="rounded-3xl border border-cyan-400/20 bg-gradient-to-br from-cyan-950/20 via-[#111827] to-[#111827] p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-cyan-300">
              Hướng Dẫn Cấu Hình DNS & Tên Miền (Custom Domain)
            </h2>
            <span className="px-2.5 py-1 rounded-full bg-cyan-500/15 border border-cyan-400/30 text-[11px] font-mono font-bold text-cyan-300">
              Active Routing
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-white/70 leading-relaxed">
            <div className="space-y-2">
              <div className="font-bold text-white/90">1. Cấu hình DNS trên Cloudflare (Môi trường Thật):</div>
              <p>
                • Khách hàng vào trang quản trị Cloudflare của tên miền, tạo <strong>A Record</strong> trỏ về IP máy chủ OriginD (<code className="text-cyan-300 bg-white/10 px-1.5 py-0.5 rounded">IP Server VPS</code>).
              </p>
              <p>
                • Bật biểu tượng <strong>Đám mây cam (Proxy)</strong> trên Cloudflare để tự động nhận chứng chỉ SSL (HTTPS) miễn phí.
              </p>
            </div>

            <div className="space-y-2">
              <div className="font-bold text-white/90">2. Kiểm thử trên máy cá nhân (Môi trường Local):</div>
              <p>
                • Nếu đang chạy Local (<code className="text-cyan-300 bg-white/10 px-1.5 py-0.5 rounded">php artisan serve</code>), mở file <code className="text-white/90">C:\Windows\System32\drivers\etc\hosts</code>.
              </p>
              <p>
                • Thêm dòng <code className="text-emerald-300 bg-white/10 px-1.5 py-0.5 rounded font-mono">127.0.0.1 mybusiness.test</code>. Sau đó kết nối tên miền <code className="text-white/90">mybusiness.test</code> bên dưới và truy cập <code className="text-white/90">http://mybusiness.test:8000</code> để xem kết quả trực tiếp!
              </p>
            </div>
          </div>
        </div>

        {/* Domain List Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Danh sách Tên miền đã kết nối ({domains.length})</h2>
            <button
              onClick={loadDomains}
              className="text-xs font-semibold text-white/60 hover:text-white transition"
            >
              Tải lại danh sách
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12 text-sm text-white/50 animate-pulse">Đang tải danh sách tên miền...</div>
          ) : domains.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-12 text-center">
              <div className="text-base font-bold text-white/80 mb-2">Chưa có tên miền nào được kết nối</div>
              <p className="text-xs text-white/50 max-w-md mx-auto mb-6">
                Bấm nút "Kết nối Domain" phía trên để liên kết đường dẫn Landing Page của khách hàng với tên miền riêng của họ.
              </p>
              <button
                onClick={openCreateModal}
                className="rounded-xl bg-white/10 px-4 py-2 text-xs font-bold text-white hover:bg-white/20 transition"
              >
                + Kết nối Domain ngay
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {domains.map((item) => (
                <div
                  key={item.id}
                  className="rounded-3xl border border-white/15 bg-gradient-to-b from-white/[0.07] to-white/[0.03] p-6 flex flex-col justify-between hover:border-cyan-400/40 transition shadow-xl space-y-6"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1 min-w-0">
                        <div className="text-lg font-bold text-cyan-300 font-mono truncate">
                          {item.domain}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
                          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                          Hoạt động • Connected
                        </div>
                      </div>

                      <a
                        href={`http://${item.domain}:8000`}
                        target="_blank"
                        rel="noreferrer"
                        className="shrink-0 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1.5 text-[11px] font-semibold text-white/80 hover:bg-white/10 transition"
                      >
                        Mở trang ↗
                      </a>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-black/30 p-3.5 space-y-2 text-xs">
                      <div className="text-white/50 font-medium">Trang Landing Page đích:</div>
                      <div className="font-bold text-white/90 truncate">
                        {item.landing_page?.title || `ID: ${item.landing_page_id}`}
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-white/60 pt-1 border-t border-white/10">
                        <span>Slug: <strong className="text-white/80 font-mono">{item.landing_page?.slug || "N/A"}</strong></span>
                        <span>Chủ: <strong className="text-white/80">{item.landing_page?.user?.name || "N/A"}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs">
                    <span className="text-white/40">
                      Ngày tạo: {item.created_at ? new Date(item.created_at).toLocaleDateString("vi-VN") : "N/A"}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(item)}
                        className="rounded-xl border border-cyan-500/40 bg-cyan-500/20 px-3 py-1.5 text-xs font-bold text-cyan-200 hover:bg-cyan-500/30 transition shadow-sm"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(item.id, item.domain)}
                        className="rounded-xl border border-red-500/40 bg-red-500/20 px-3.5 py-1.5 text-xs font-bold text-red-200 hover:bg-red-500/30 transition shadow-sm"
                      >
                        Xóa / Hủy kết nối
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal Kết nối Domain */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-3xl border border-white/15 bg-[#111827] p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-lg font-bold text-white">
                {editingDomain ? "Cập nhật Kết Nối Domain" : "Kết Nối Domain Riêng"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-xl p-2 text-white/50 hover:bg-white/10 hover:text-white transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConnect} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1.5">
                  Ô thứ 1: Nhập đường dẫn (link) hoặc Slug Landing Page của User
                </label>
                <input
                  type="text"
                  value={landingPageInput}
                  onChange={(e) => setLandingPageInput(e.target.value)}
                  placeholder="Ví dụ: http://origind.id.vn/page/landing-seo-pro hoặc landing-seo-pro"
                  required
                  className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-sm text-white font-mono placeholder-white/30 outline-none focus:border-cyan-400"
                />
                <span className="block text-[11px] text-white/50 mt-1">
                  * Hệ thống tự động nhận diện từ link đầy đủ, slug ngắn hoặc ID của Landing Page.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1.5">
                  Ô thứ 2: Nhập tên miền riêng (Custom Domain) của User
                </label>
                <input
                  type="text"
                  value={domainInput}
                  onChange={(e) => setDomainInput(e.target.value)}
                  placeholder="Ví dụ: mybusiness.com hoặc shop-mybrand.test"
                  required
                  className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-sm text-cyan-300 font-mono font-bold placeholder-white/30 outline-none focus:border-cyan-400"
                />
                <span className="block text-[11px] text-white/50 mt-1">
                  * Nhập tên miền không kèm http:// hoặc https:// (chỉ cần tên miền gốc).
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-white/80 hover:bg-white/10 transition"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 transition"
                >
                  {submitting ? "Đang xử lý..." : editingDomain ? "Lưu thay đổi" : "Xác nhận kết nối"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
