import GlassCard from "../../components/common/GlassCard";
import PageSection from "../../components/common/PageSection";

export default function LandingPages() {
  return (
    <div>
      <PageSection
        title="Landing Pages"
        subtitle="Danh sách trang (UI placeholder)"
      >
        <GlassCard>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-white/90 font-semibold">Landing pages</div>
              <div className="text-white/60 text-sm">Placeholder để bạn gắn dữ liệu</div>
            </div>
            <button className="primary-btn">Tạo trang mới</button>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
            {[
              {
                title: "OriginD Promo",
                desc: "Tối ưu chuyển đổi & tốc độ",
                url: "origind.id.vn/promo",
              },
              {
                title: "SaaS Landing",
                desc: "Mẫu landing cho subscription",
                url: "origind.id.vn/saas",
              },
            ].map((p, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-white/10 bg-white/5 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-white/95 font-semibold">{p.title}</div>
                    <div className="text-white/60 text-sm mt-1">{p.desc}</div>
                  </div>
                  <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/70">
                    Live
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="text-xs text-white/55">{p.url}</div>
                  <div className="flex gap-2">
                    <button className="ghost-btn px-3 py-2 text-xs">Xem</button>
                    <button className="primary-btn px-3 py-2 text-xs">Chỉnh sửa</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </PageSection>
    </div>
  );
}
