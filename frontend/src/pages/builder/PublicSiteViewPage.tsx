import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import type { BuilderSite } from "../../types/builder";
import { fetchPublicSite } from "../../services/builderApi";
import { useAuthStore } from "../../store/authStore";
import BuilderElementRenderer from "../../components/builder/BuilderElementRenderer";
import PageLoader from "../../components/common/PageLoader";
import SEO from "../../components/common/SEO";
import { AlertCircle, Lock, ArrowLeft, Sparkles } from "lucide-react";

export default function PublicSiteViewPage() {
  const { slug } = useParams<{ slug: string }>();
  const token = useAuthStore((s) => s.token);

  const [site, setSite] = useState<BuilderSite | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDraft, setIsDraft] = useState(false);

  useEffect(() => {
    if (!slug) return;
    let isMounted = true;

    async function load() {
      setLoading(true);
      setError(null);
      setIsDraft(false);

      try {
        const data = await fetchPublicSite(slug!, token);
        if (isMounted) {
          setSite(data);
        }
      } catch (err: any) {
        if (isMounted) {
          if (err?.response?.status === 403 || err?.response?.data?.status === 'draft') {
            setIsDraft(true);
          } else {
            setError(err?.response?.data?.message || "Không tìm thấy trang web yêu cầu");
          }
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    load();
    return () => {
      isMounted = false;
    };
  }, [slug, token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <PageLoader />
      </div>
    );
  }

  // Draft state notice
  if (isDraft) {
    return (
      <div className="min-h-screen bg-[#090d16] flex items-center justify-center p-6 text-white text-center">
        <div className="max-w-md w-full bg-slate-900 border border-white/10 rounded-3xl p-8 shadow-2xl relative">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-4">
            <Lock size={28} />
          </div>
          <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-white/5 border border-white/10 text-white/70 mb-3">
            Bản Nháp (Draft)
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Trang Chưa Được Xuất Bản</h1>
          <p className="text-sm text-white/60 leading-relaxed mb-6">
            Website này hiện đang trong quá trình thiết kế ở trạng thái <b>Bản nháp</b> và chưa được xuất bản công khai. Chỉ chủ sở hữu mới có quyền xem trước.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition"
          >
            <ArrowLeft size={14} />
            <span>Đăng nhập để xem hoặc quay lại</span>
          </Link>
        </div>
      </div>
    );
  }

  // Not found or error
  if (error || !site) {
    return (
      <div className="min-h-screen bg-[#090d16] flex items-center justify-center p-6 text-white text-center">
        <div className="max-w-md w-full bg-slate-900 border border-white/10 rounded-3xl p-8 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={28} />
          </div>
          <h1 className="text-xl font-bold text-white mb-2">404 - Không Tìm Thấy Trang</h1>
          <p className="text-sm text-white/60 leading-relaxed mb-6">
            {error || "Địa chỉ website không tồn tại hoặc đã bị gỡ bỏ."}
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition"
          >
            <ArrowLeft size={14} />
            <span>Về trang chủ</span>
          </Link>
        </div>
      </div>
    );
  }

  const elements = Array.isArray(site.data) ? site.data : [];
  const settings = site.settings || {};

  return (
    <div
      style={{
        fontFamily: settings.fontFamily || 'Inter, sans-serif',
        backgroundColor: settings.backgroundColor || '#090d16',
      }}
      className="min-h-screen w-full flex flex-col text-white relative selection:bg-indigo-500 selection:text-white"
    >
      <SEO
        title={settings.metaTitle || site.title}
        description={settings.metaDescription}
      />

      {/* Render Website Elements */}
      <main className="flex-1 w-full flex flex-col">
        {elements.map((elem) => (
          <BuilderElementRenderer
            key={elem.id}
            element={elem}
            isEditor={false}
          />
        ))}
      </main>

      {/* OriginD Badge watermark */}
      <aside aria-label="OriginD Badge" className="fixed bottom-4 right-4 z-40">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 hover:bg-slate-900 border border-white/15 text-white/80 hover:text-white text-[11px] font-medium shadow-xl backdrop-blur-md transition group"
        >
          <Sparkles size={12} className="text-indigo-400 group-hover:rotate-12 transition-transform" />
          <span>Thiết kế bởi <b>OriginD Builder</b></span>
        </Link>
      </aside>
    </div>
  );
}
