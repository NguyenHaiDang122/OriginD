import { useState } from "react";
import {
  Globe,
  Copy,
  Check,
  ExternalLink,
  X,
  Rocket,
  AlertCircle,
  EyeOff,
} from "lucide-react";

interface BuilderPublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: 'draft' | 'published';
  slug: string;
  onPublish: (customSlug?: string) => Promise<void>;
  onUnpublish: () => Promise<void>;
}

export default function BuilderPublishModal({
  isOpen,
  onClose,
  status,
  slug,
  onPublish,
  onUnpublish,
}: BuilderPublishModalProps) {
  const [customSlug, setCustomSlug] = useState(slug);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const publicUrl = `${window.location.origin}/site/${customSlug || slug}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePublishSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await onPublish(customSlug);
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || "Xuất bản thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleUnpublishSubmit = async () => {
    if (!confirm("Bạn có chắc chắn muốn chuyển website về trạng thái Bản nháp? Người khác sẽ không thể truy cập qua đường dẫn công khai nữa.")) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await onUnpublish();
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || "Hủy xuất bản thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-white/15 rounded-3xl p-6 shadow-2xl overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute -right-20 -top-20 w-52 h-52 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-52 h-52 bg-violet-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 p-1.5 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition"
        >
          <X size={18} />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Rocket size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Xuất Bản Website</h3>
            <p className="text-xs text-white/60">
              Chia sẻ trang web của bạn cho mọi người trên Internet
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle size={14} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {status === 'published' ? (
          <div className="space-y-4">
            {/* Success state */}
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <div>
                <span className="font-bold">Website đang hoạt động trực tuyến!</span>
                <p className="text-emerald-400/80 mt-0.5">
                  Mọi người có thể xem website của bạn bằng đường dẫn dưới đây.
                </p>
              </div>
            </div>

            {/* Public Link Box */}
            <div>
              <label className="block text-xs font-semibold text-white/80 mb-1.5">
                Đường dẫn công khai của bạn
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white font-mono truncate flex items-center gap-2">
                  <Globe size={14} className="text-indigo-400 shrink-0" />
                  <span className="truncate">{publicUrl}</span>
                </div>

                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-3 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition flex items-center gap-1.5 shrink-0"
                >
                  {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  <span>{copied ? 'Đã sao chép' : 'Sao chép'}</span>
                </button>
              </div>
            </div>

            {/* Customize slug form */}
            <form onSubmit={handlePublishSubmit} className="pt-2 border-t border-white/10">
              <label className="block text-xs font-semibold text-white/80 mb-1.5">
                Đổi đường dẫn tùy chỉnh (Slug)
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/40 font-mono">/site/</span>
                <input
                  type="text"
                  value={customSlug}
                  onChange={(e) => setCustomSlug(e.target.value)}
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition disabled:opacity-50"
                >
                  {loading ? 'Đang lưu...' : 'Lưu Slug'}
                </button>
              </div>
            </form>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleUnpublishSubmit}
                disabled={loading}
                className="text-xs text-amber-400/90 hover:text-amber-300 flex items-center gap-1.5 transition"
              >
                <EyeOff size={14} />
                <span>Chuyển về Bản nháp</span>
              </button>

              <a
                href={publicUrl}
                target="_blank"
                rel="noreferrer"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-indigo-500/20"
              >
                <span>Xem Website</span>
                <ExternalLink size={14} />
              </a>
            </div>
          </div>
        ) : (
          <form onSubmit={handlePublishSubmit} className="space-y-4">
            <p className="text-xs text-white/70 leading-relaxed">
              Khi xuất bản, website của bạn sẽ được kích hoạt công khai trên Internet. Người dùng và khách hàng có thể truy cập bằng đường dẫn độc quyền bên dưới.
            </p>

            <div>
              <label className="block text-xs font-semibold text-white/80 mb-1.5">
                Đường dẫn liên kết (Slug)
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/40 font-mono">/site/</span>
                <input
                  type="text"
                  value={customSlug}
                  onChange={(e) => setCustomSlug(e.target.value)}
                  placeholder="my-cool-website"
                  required
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>
              <p className="text-[11px] text-white/40 mt-1">
                Đường dẫn xem trước: <span className="font-mono text-indigo-300">{publicUrl}</span>
              </p>
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white/70 hover:text-white hover:bg-white/5 transition"
              >
                Hủy bỏ
              </button>

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-indigo-500/20 disabled:opacity-50"
              >
                <Rocket size={14} />
                <span>{loading ? 'Đang xuất bản...' : 'Xuất Bản Ngay'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
