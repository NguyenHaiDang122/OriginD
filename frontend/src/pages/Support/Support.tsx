import GlassCard from "../../components/common/GlassCard";

import PageSection from "../../components/common/PageSection";

function ContactLink({
  label,
  href,
  color,
}: {
  label: string;
  href: string;
  color: string;
}) {
  return (
    <a
      className="support-link"
      href={href}
      target="_blank"
      rel="noreferrer"
    >
      <span className="support-dot" style={{ background: color }} />
      <span className="font-semibold">{label}</span>
    </a>
  );
}

export default function Support() {
  return (
    <div className="max-w-5xl mx-auto">
      <PageSection
        title="Hỗ trợ"
        subtitle="Liên hệ qua Zalo / Facebook / Telegram hoặc xem video hướng dẫn."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <GlassCard title="Liên hệ nhanh">
            <div className="flex flex-col gap-3">
              <ContactLink label="Zalo" href="#" color="#34d399" />
              <ContactLink label="Facebook" href="#" color="#60a5fa" />
              <ContactLink label="Telegram" href="#" color="#22d3ee" />
              <ContactLink label="Email" href="#" color="#a78bfa" />
            </div>

            <div className="mt-4 text-xs text-white/50 leading-relaxed">
              (Placeholder URL) - Dán link thật của bạn vào sau.
            </div>
          </GlassCard>

          <GlassCard title="Video hướng dẫn" subtitle="Cách sử dụng + mẹo tối ưu">
            <div className="space-y-3">
              <div className="glass-panel rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl p-4">
                <div className="text-sm font-semibold text-white/90">Video 1</div>
                <div className="text-xs text-white/60 mt-1">
                  (Placeholder) - Thêm link YouTube của bạn.
                </div>
                <div className="mt-3">
                  <a href="#" target="_blank" rel="noreferrer" className="primary-btn">
                    Xem video
                    <span aria-hidden>→</span>
                  </a>
                </div>
              </div>

              <div className="glass-panel rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl p-4">
                <div className="text-sm font-semibold text-white/90">Video 2</div>
                <div className="text-xs text-white/60 mt-1">
                  (Placeholder) - Thêm link YouTube của bạn.
                </div>
                <div className="mt-3">
                  <a href="#" target="_blank" rel="noreferrer" className="ghost-btn">
                    Xem video
                    <span aria-hidden>→</span>
                  </a>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

        <div className="mt-6">
          <GlassCard>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="text-white/95 font-semibold text-lg">Chưa thấy đúng nhu cầu?</div>
                <div className="text-white/60 text-sm mt-1">
                  Gửi thông tin, mình sẽ phản hồi qua kênh phù hợp.
                </div>
              </div>
              <a href="#" target="_blank" rel="noreferrer" className="primary-btn">
                Liên hệ ngay
                <span aria-hidden>→</span>
              </a>
            </div>
          </GlassCard>
        </div>
      </PageSection>
    </div>
  );
}

