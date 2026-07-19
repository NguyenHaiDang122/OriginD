import { Link } from "react-router-dom";
import PageSection from "../../components/common/PageSection";
import GlassCard from "../../components/common/GlassCard";

export default function DomainGuide() {
  return (
    <div className="space-y-6 animate-fade-in">
      <PageSection
        title="Tên Miền Riêng (Custom Domain) Là Gì?"
        subtitle="Tìm hiểu về tính năng tên miền riêng và cách kết nối vào trang web của bạn"
      />

      <div className="mx-auto max-w-4xl space-y-6">
        <GlassCard>
          <div className="space-y-4 text-white/80 leading-relaxed">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
               1. Định nghĩa cơ bản
            </h3>
            <p>
              Mặc định, khi bạn tạo một trang web (Landing Page) trên hệ thống OriginD, trang web của bạn sẽ được cấp một đường dẫn chia sẻ miễn phí với định dạng như sau:
            </p>
            <div className="p-3 bg-white/5 border border-white/10 rounded-xl font-mono text-emerald-400 text-sm overflow-x-auto">
              origind.id.vn/page/cua-hang-cua-ban
            </div>
            
            <p>
              Tuy nhiên, nếu bạn sở hữu các gói dịch vụ nâng cao (như Pro hoặc Premium), bạn sẽ được quyền <strong>Kết nối Tên miền Riêng (Custom Domain)</strong>. Thay vì dùng đường dẫn mặc định dài dòng, bạn có thể chạy trang web của mình trên chính tên miền mà bạn đã mua (ví dụ: <span className="text-violet-400 font-semibold">.com, .vn, .net</span>).
            </p>

            <h3 className="text-xl font-bold text-white mt-8 mb-4 flex items-center gap-2">
               2. Ví dụ thực tế
            </h3>
            <p>Giả sử bạn đang kinh doanh thương hiệu thời trang "FashionX".</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>
                <strong>Không dùng tên miền riêng:</strong> Khách hàng của bạn sẽ truy cập qua đường dẫn: <code className="text-rose-300">origind.id.vn/page/fashion-x</code>
              </li>
              <li>
                <strong>Có dùng tên miền riêng:</strong> Khách hàng của bạn sẽ truy cập trực tiếp qua đường dẫn cực kỳ chuyên nghiệp: <code className="text-emerald-300">fashionx.vn</code> hoặc <code className="text-emerald-300">cuahang.fashionx.vn</code>
              </li>
            </ul>

            <h3 className="text-xl font-bold text-white mt-8 mb-4 flex items-center gap-2">
              3. Hướng dẫn cài đặt
            </h3>
            <div className="p-5 bg-gradient-to-r from-violet-500/10 to-indigo-500/10 border border-violet-500/20 rounded-2xl shadow-lg">
              <p className="text-white/90">
                Để thiết lập và liên kết tên miền riêng của bạn vào hệ thống OriginD, <strong>vui lòng liên hệ trực tiếp với bộ phận Admin/Hỗ trợ khách hàng</strong> để được hướng dẫn trỏ tên miền (DNS) và cấu hình một cách nhanh chóng nhất.
              </p>
              <div className="mt-5 flex gap-3 flex-wrap">
                <a 
                  href="https://zalo.me/0866984097" 
                  target="_blank" 
                  rel="noreferrer"
                  className="inline-flex px-4 py-2 bg-transparent border border-blue-500 text-blue-400 hover:bg-blue-500/10 font-semibold rounded-xl transition items-center gap-2"
                >
                  Liên hệ Admin qua Zalo
                </a>
                <Link to="/support" className="inline-flex px-4 py-2 bg-transparent border border-white/20 hover:border-white/40 text-white/90 hover:bg-white/5 font-semibold rounded-xl transition items-center gap-2">
                  Trang hỗ trợ chung
                </Link>
              </div>
            </div>

          </div>
        </GlassCard>
      </div>
    </div>
  );
}
