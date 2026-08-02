import { useEffect, useState } from "react";
import { MessageCircle, Mail, HelpCircle, Video, ArrowRight } from "lucide-react";
import GlassCard from "../../components/common/GlassCard";
import PageSection from "../../components/common/PageSection";
import { getSupportSettings } from "../../services/settingApi";
import type { SupportSettings } from "../../services/settingApi";

function ContactLink({
  label,
  href,
  color,
  icon: Icon,
  description,
}: {
  label: string;
  href: string;
  color: string;
  icon: any;
  description: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="group relative flex items-start gap-4 rounded-2xl border border-white/10 bg-transparent p-4 transition-all hover:border-white/30 hover:bg-white/5"
    >
      <div 
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br shadow-inner transition-transform group-hover:scale-110"
        style={{ backgroundImage: `linear-gradient(to bottom right, ${color}33, ${color}11)`, border: `1px solid ${color}40`, color: color }}
      >
        <Icon size={24} />
      </div>
      <div>
        <h3 className="text-sm font-bold text-white group-hover:text-[color:var(--hover-color)] transition-colors" style={{ '--hover-color': color } as React.CSSProperties}>
          {label}
        </h3>
        <p className="mt-1 text-xs text-white/60 leading-relaxed">
          {description}
        </p>
      </div>
    </a>
  );
}

export default function Support() {
  const [settings, setSettings] = useState<SupportSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const data = await getSupportSettings();
      setSettings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const zaloLink = settings?.zalo || "https://zalo.me/0866984097";
  const facebookLink = settings?.facebook || "#";
  const emailLink = settings?.email ? `mailto:${settings.email}` : "mailto:support@origind.id.vn";
  const videos = settings?.videos || [];

  if (loading) {
    return <div className="text-white text-center p-10">Đang tải cấu hình hỗ trợ...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto animate-fade-in space-y-8">
      <PageSection
        title="Trung Tâm Hỗ Trợ"
        subtitle="Chúng tôi luôn sẵn sàng lắng nghe và giải đáp mọi thắc mắc của bạn."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassCard>
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/20 text-violet-400">
              <MessageCircle size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Liên Hệ Trực Tiếp</h2>
              <p className="text-xs text-white/60">Phản hồi nhanh chóng 24/7</p>
            </div>
          </div>
          
          <div className="grid gap-3">
            {settings?.zalo && (
              <ContactLink 
                label="Hỗ Trợ Qua Zalo" 
                href={zaloLink} 
                color="#34d399" 
                icon={MessageCircle} 
                description="Kênh hỗ trợ nhanh nhất. Trực tiếp giải đáp và xử lý lỗi kỹ thuật." 
              />
            )}
            {settings?.facebook && settings.facebook !== "#" && (
              <ContactLink 
                label="Cộng Đồng Facebook" 
                href={facebookLink} 
                color="#60a5fa" 
                icon={MessageCircle} 
                description="Tham gia nhóm để giao lưu, cập nhật tính năng và ưu đãi mới." 
              />
            )}
            {settings?.email && (
              <ContactLink 
                label="Hỗ Trợ Qua Email" 
                href={emailLink} 
                color="#a78bfa" 
                icon={Mail} 
                description="Dành cho hợp tác, đối tác doanh nghiệp và các vấn đề bảo mật." 
              />
            )}
          </div>
        </GlassCard>

        <div className="space-y-6">
          <GlassCard>
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
                <Video size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Hướng Dẫn Sử Dụng</h2>
                <p className="text-xs text-white/60">Tự học cách dùng hệ thống</p>
              </div>
            </div>

            <div className="space-y-4">
              {videos.length === 0 ? (
                <div className="text-white/50 text-sm italic">Đang cập nhật video...</div>
              ) : (
                videos.map((vid) => (
                  <div key={vid.id} className="group rounded-2xl border border-white/10 bg-transparent p-4 transition hover:border-white/20 hover:bg-white/5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="text-sm font-semibold text-white/90 group-hover:text-emerald-400 transition">{vid.title}</div>
                        <div className="text-xs text-white/50 mt-1 line-clamp-1">
                          {vid.description}
                        </div>
                      </div>
                      <a href={vid.link} target="_blank" rel="noreferrer" className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-white/20 bg-transparent px-4 py-2 text-xs font-semibold text-white hover:border-emerald-500/50 hover:bg-emerald-500/10 hover:text-emerald-300 transition-all">
                        Xem Chi Tiết
                        <ArrowRight size={14} />
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          </GlassCard>
        </div>
      </div>

      {settings?.zalo && (
        <GlassCard>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-2">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 text-indigo-300 border border-indigo-500/30">
                <HelpCircle size={24} />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">Bạn vẫn cần thêm trợ giúp?</h3>
                <p className="text-white/60 text-sm mt-1">
                  Đội ngũ chuyên viên của chúng tôi luôn trực sẵn để giải quyết khó khăn của bạn.
                </p>
              </div>
            </div>
            <a href={zaloLink} target="_blank" rel="noreferrer" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-white/20 bg-transparent px-6 py-3 text-sm font-bold text-white hover:border-blue-400/50 hover:bg-blue-500/10 hover:text-blue-300 transition-all shadow-sm">
              Chat Với Admin Ngay
              <ArrowRight size={16} />
            </a>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
