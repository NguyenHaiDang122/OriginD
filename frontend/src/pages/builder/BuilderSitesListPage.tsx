import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type {
  BuilderSite,
} from "../../types/builder";
import {
  fetchBuilderSites,
  createBuilderSite,
  deleteBuilderSite,
  duplicateBuilderSite,
} from "../../services/builderApi";
import { useAuthStore } from "../../store/authStore";
import GlassCard from "../../components/common/GlassCard";
import SEO from "../../components/common/SEO";
import {
  Plus,
  Edit,
  ExternalLink,
  Copy,
  Trash2,
  Layers,
  Sparkles,
  Search,
  Check,
  Calendar,
} from "lucide-react";

export default function BuilderSitesListPage() {
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);

  const [sites, setSites] = useState<BuilderSite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // Create modal state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [starterType, setStarterType] = useState<'starter' | 'blank'>('starter');
  const [creating, setCreating] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const loadSites = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await fetchBuilderSites(token);
      setSites(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Không thể tải danh sách website");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSites();
  }, [token]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setCreating(true);
    try {
      const newSite = await createBuilderSite(
        {
          title: newTitle.trim(),
          data: starterType === 'blank' ? [] : undefined,
        },
        token
      );
      setIsCreateOpen(false);
      setNewTitle("");
      navigate(`/builder/${newSite.id}`);
    } catch (err: any) {
      alert("Tạo website thất bại: " + (err?.response?.data?.message || err.message));
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (site: BuilderSite) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa website "${site.title}"?`)) return;

    try {
      await deleteBuilderSite(site.id, token);
      setSites((prev) => prev.filter((s) => s.id !== site.id));
    } catch (err: any) {
      alert("Xóa website thất bại: " + (err?.response?.data?.message || err.message));
    }
  };

  const handleDuplicate = async (site: BuilderSite) => {
    try {
      const copy = await duplicateBuilderSite(site.id, token);
      setSites((prev) => [copy, ...prev]);
    } catch (err: any) {
      alert("Nhân bản website thất bại: " + (err?.response?.data?.message || err.message));
    }
  };

  const handleCopyLink = (site: BuilderSite) => {
    const url = `${window.location.origin}/site/${site.slug}`;
    navigator.clipboard.writeText(url);
    setCopiedId(site.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredSites = sites.filter((s) =>
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    s.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      <SEO title="Website Builder - Thiết Kế Kéo Thả | OriginD" />

      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-slate-900/60 p-6 sm:p-8 backdrop-blur-2xl mb-8 shadow-2xl">
        <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-indigo-500/20 blur-3xl" />

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300 mb-3">
              <Sparkles size={12} className="text-indigo-400" />
              <span>Website Builder Kéo Thả Trực Quan</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Quản Lý & Thiết Kế Website
            </h1>
            <p className="mt-2 text-sm text-white/70 max-w-xl leading-relaxed">
              Tự tay thiết kế website theo phong cách của bạn bằng cách kéo thả 12+ thành phần chuyên nghiệp mà không cần viết mã.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              if (!token) {
                navigate("/login");
                return;
              }
              setIsCreateOpen(true);
            }}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-bold text-sm shadow-xl shadow-indigo-500/25 transition transform hover:-translate-y-0.5 active:translate-y-0 shrink-0"
          >
            <Plus size={18} />
            <span>Tạo Website Mới</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3.5 top-3.5 text-white/40" />
          <input
            type="text"
            placeholder="Tìm kiếm website của bạn..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-white/40 focus:outline-none focus:border-indigo-500 transition"
          />
        </div>

        <div className="text-xs text-white/60">
          Tổng cộng: <span className="font-bold text-white">{filteredSites.length}</span> website
        </div>
      </div>

      {/* Website Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl animate-pulse h-60"
            />
          ))}
        </div>
      ) : error ? (
        <GlassCard>
          <div className="text-center py-10">
            <div className="text-rose-400 font-semibold mb-2">{error}</div>
            <button
              type="button"
              onClick={loadSites}
              className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold"
            >
              Thử lại
            </button>
          </div>
        </GlassCard>
      ) : filteredSites.length === 0 ? (
        <GlassCard>
          <div className="text-center py-14">
            <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mx-auto mb-4">
              <Layers size={32} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Bạn chưa có website nào</h3>
            <p className="text-sm text-white/50 max-w-md mx-auto mb-6">
              Bắt đầu tạo website đầu tiên bằng trình dựng kéo thả trực quan. Chỉ mất vài phút để hoàn thành một trang web tuyệt đẹp.
            </p>
            <button
              type="button"
              onClick={() => {
                if (!token) {
                  navigate("/login");
                  return;
                }
                setIsCreateOpen(true);
              }}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold shadow-lg shadow-indigo-600/30 transition"
            >
              Tạo website ngay
            </button>
          </div>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSites.map((site) => {
            const elementsCount = Array.isArray(site.data) ? site.data.length : 0;
            const isPublished = site.status === 'published';
            const publicUrl = `${window.location.origin}/site/${site.slug}`;

            return (
              <div
                key={site.id}
                className="group rounded-3xl border border-white/10 bg-white/5 hover:bg-white/[0.08] hover:border-indigo-500/40 p-6 backdrop-blur-xl transition duration-300 flex flex-col justify-between shadow-lg hover:shadow-2xl hover:shadow-indigo-500/10"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-center justify-between mb-4">
                    {isPublished ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Đã xuất bản
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white/60">
                        Bản nháp
                      </span>
                    )}

                    <span className="text-xs text-white/40 font-mono">
                      {elementsCount} thành phần
                    </span>
                  </div>

                  {/* Title & Slug */}
                  <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition truncate mb-1">
                    {site.title}
                  </h3>
                  <p className="text-xs text-white/50 font-mono truncate mb-4">
                    /{site.slug}
                  </p>

                  {/* Meta info */}
                  <div className="flex items-center gap-2 text-[11px] text-white/40 mb-6">
                    <Calendar size={12} />
                    <span>Cập nhật: {new Date(site.updated_at).toLocaleDateString('vi-VN')}</span>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    {isPublished && (
                      <>
                        <a
                          href={publicUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition"
                          title="Xem trang web công khai"
                        >
                          <ExternalLink size={16} />
                        </a>

                        <button
                          type="button"
                          onClick={() => handleCopyLink(site)}
                          className="p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition"
                          title="Sao chép liên kết"
                        >
                          {copiedId === site.id ? (
                            <Check size={16} className="text-emerald-400" />
                          ) : (
                            <Copy size={16} />
                          )}
                        </button>
                      </>
                    )}

                    <button
                      type="button"
                      onClick={() => handleDuplicate(site)}
                      className="p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition"
                      title="Nhân bản website"
                    >
                      <Copy size={16} />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(site)}
                      className="p-2 rounded-xl text-white/60 hover:text-red-400 hover:bg-red-500/10 transition"
                      title="Xóa website"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* Edit button */}
                  <button
                    type="button"
                    onClick={() => navigate(`/builder/${site.id}`)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-md shadow-indigo-600/20"
                  >
                    <Edit size={14} />
                    <span>Thiết kế</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Website Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-white/15 rounded-3xl p-6 shadow-2xl relative">
            <h3 className="text-lg font-bold text-white mb-1">Khởi Tạo Website Mới</h3>
            <p className="text-xs text-white/60 mb-5">
              Đặt tên và chọn mẫu giao diện để bắt đầu thiết kế kéo thả
            </p>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1.5">
                  Tên website
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="VD: Website Bán Hàng, Portfolio Cá Nhân..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1.5">
                  Chọn mẫu khởi tạo
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => setStarterType('starter')}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition ${
                      starterType === 'starter'
                        ? 'border-indigo-500 bg-indigo-600/20 text-indigo-300'
                        : 'border-white/10 bg-white/5 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    <div className="font-bold text-xs text-white mb-1">Mẫu Đầy Đủ</div>
                    <p className="text-[11px] leading-relaxed">
                      Bao gồm Header, Banner, Section, Tính Năng & Footer
                    </p>
                  </div>

                  <div
                    onClick={() => setStarterType('blank')}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition ${
                      starterType === 'blank'
                        ? 'border-indigo-500 bg-indigo-600/20 text-indigo-300'
                        : 'border-white/10 bg-white/5 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    <div className="font-bold text-xs text-white mb-1">Trang Trắng</div>
                    <p className="text-[11px] leading-relaxed">
                      Bắt đầu từ con số 0, tự do sáng tạo mọi chi tiết
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white/70 hover:text-white hover:bg-white/5 transition"
                >
                  Hủy
                </button>

                <button
                  type="submit"
                  disabled={creating || !newTitle.trim()}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition disabled:opacity-50"
                >
                  {creating ? 'Đang tạo...' : 'Bắt Đầu Thiết Kế'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
