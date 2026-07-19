import { useState, useEffect } from "react";
import NeuronNetwork from "../components/ui/NeuronNetwork";
import { ExternalLink, Code2, Paintbrush, Rocket, Search, ChevronRight, ChevronLeft, Sparkles } from "lucide-react";

export default function WebDesignService() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [mounted, setMounted] = useState(false);
  const totalSlides = 3;

  useEffect(() => {
    setMounted(true);
    window.scrollTo(0, 0);
  }, []);

  const nextSlide = () => setCurrentSlide((p) => (p + 1) % totalSlides);
  const prevSlide = () => setCurrentSlide((p) => (p - 1 + totalSlides) % totalSlides);

  const handlePageClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    // Bỏ qua nếu click vào các phần tử có tương tác (nút, link)
    if (target.closest('button') || target.closest('a')) {
      return;
    }
    const { clientX } = e;
    const { innerWidth } = window;
    if (clientX > innerWidth / 2) {
      nextSlide();
    } else {
      prevSlide();
    }
  };

  return (
    <div 
      onClick={handlePageClick}
      className={`relative min-h-screen w-full text-white overflow-hidden flex flex-col group bg-[#0b1221] transition-opacity duration-1000 cursor-pointer ${mounted ? 'opacity-100' : 'opacity-0'}`}
    >
      
      {/* Nền Nơ-ron trượt toàn màn hình */}
      <div 
        className={`absolute top-[-50%] left-[-50%] w-[200%] h-[200%] pointer-events-none opacity-40 z-0 transition-all duration-[1500ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${mounted ? 'scale-100' : 'scale-110'}`}
        style={{ transform: `translateX(${-currentSlide * 10}%)` }}
      >
        <NeuronNetwork className="w-full h-full" />
      </div>

      {/* Lớp phủ mờ (vignette/gradient) để chữ nổi bật hơn trên toàn màn hình */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0b1221]/80 via-transparent to-[#0b1221]/80 z-0 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0b1221]/50 via-transparent to-[#0b1221]/50 z-0 pointer-events-none" />

      {/* Nút Điều hướng 2 bên mép màn hình */}
      <button 
        onClick={prevSlide} 
        className="absolute left-2 sm:left-8 top-1/2 -translate-y-1/2 z-30 p-2 sm:p-4 text-white/50 sm:text-white/30 hover:text-white hover:bg-white/10 rounded-full transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:-translate-x-4 sm:group-hover:translate-x-0" 
        title="Trang trước"
      >
        <ChevronLeft size={32} className="sm:w-10 sm:h-10" />
      </button>
      <button 
        onClick={nextSlide} 
        className="absolute right-2 sm:right-8 top-1/2 -translate-y-1/2 z-30 p-2 sm:p-4 text-white/50 sm:text-white/30 hover:text-white hover:bg-white/10 rounded-full transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:translate-x-4 sm:group-hover:translate-x-0" 
        title="Trang sau"
      >
        <ChevronRight size={32} className="sm:w-10 sm:h-10" />
      </button>

      {/* Vùng nội dung chính giữa */}
      <div className="flex-1 relative w-full h-full flex flex-col items-center justify-center z-20 px-8 sm:px-24">
        
        {/* Slide 1: Giới thiệu */}
        <div className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          currentSlide === 0 ? 'opacity-100 translate-x-0 scale-100 pointer-events-auto z-20' :
          currentSlide > 0 ? 'opacity-0 -translate-x-32 scale-95 pointer-events-none z-0' :
          'opacity-0 translate-x-32 scale-95 pointer-events-none z-0'
        }`}>
          <div className={`transition-all duration-700 delay-300 ${mounted && currentSlide === 0 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-violet-500/30 bg-violet-500/10 backdrop-blur-md text-violet-300 text-sm font-medium mb-8 shadow-[0_0_15px_rgba(139,92,246,0.2)]">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-violet-500"></span>
              </span>
              Dịch Vụ Thiết Kế Khởi Đầu
            </div>
          </div>
          
          <h1 className={`text-3xl sm:text-5xl md:text-6xl font-black mb-6 tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60 text-center px-4 max-w-5xl leading-tight transition-all duration-700 delay-500 ${mounted && currentSlide === 0 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            Website & Landing Page Theo Yêu Cầu
          </h1>
          
          <p className={`text-sm sm:text-lg text-white/70 max-w-3xl mx-auto leading-relaxed mb-10 text-center px-4 transition-all duration-700 delay-700 ${mounted && currentSlide === 0 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            Biến ý tưởng của bạn thành hiện thực với các giải pháp website tốc độ cao, giao diện độc quyền và tối ưu hóa chuyển đổi. Chúng tôi đồng hành cùng bạn trên mọi chặng đường phát triển trực tuyến.
          </p>
          
          <div className={`transition-all duration-700 delay-1000 ${mounted && currentSlide === 0 ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'}`}>
            <button onClick={nextSlide} className="inline-flex items-center gap-2 text-white hover:text-white transition-all border border-violet-500/60 rounded-full px-6 py-3 bg-violet-500/20 hover:bg-violet-500/40 hover:scale-105 backdrop-blur-md text-base font-semibold shadow-[0_0_20px_rgba(139,92,246,0.3)]">
              Khám phá Tính năng <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Slide 2: Tính năng */}
        <div className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          currentSlide === 1 ? 'opacity-100 translate-x-0 scale-100 pointer-events-auto z-20' :
          currentSlide > 1 ? 'opacity-0 -translate-x-32 scale-95 pointer-events-none z-0' :
          'opacity-0 translate-x-32 scale-95 pointer-events-none z-0'
        }`}>
          <h2 className={`text-2xl sm:text-4xl font-bold mb-10 sm:mb-12 text-white/95 text-center transition-all duration-700 delay-300 ${currentSlide === 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>Giải Pháp Công Nghệ Tối Ưu</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 w-full max-w-5xl px-4">
            {[
              { icon: Paintbrush, title: "Độc Quyền", desc: "Chuẩn UI/UX hiện đại" },
              { icon: Rocket, title: "Siêu Tốc", desc: "Tối ưu hóa hiệu suất load" },
              { icon: Search, title: "Chuẩn SEO", desc: "Dễ dàng lên top Google" },
              { icon: Code2, title: "Bảo Mật", desc: "An toàn tuyệt đối 100%" },
            ].map((feature, idx) => (
              <div 
                key={idx} 
                className={`flex flex-col items-center justify-center p-5 sm:p-8 rounded-3xl border border-white/10 bg-white/5 transition-all duration-[1200ms] group backdrop-blur-xl hover:bg-white/10 hover:shadow-[0_15px_30px_rgba(139,92,246,0.15)] ${
                  currentSlide === 1 
                    ? '[transform:perspective(1000px)_rotateY(360deg)] opacity-100 translate-y-0' 
                    : '[transform:perspective(1000px)_rotateY(0deg)] opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${500 + idx * 150}ms` }}
              >
                <div className="p-3 rounded-2xl bg-violet-500/10 mb-4 transition-transform duration-500 border border-violet-500/20 group-hover:-translate-y-2 group-hover:shadow-[0_0_20px_rgba(139,92,246,0.4)]">
                  <feature.icon className="h-8 w-8 sm:h-12 sm:w-12 text-violet-400 group-hover:text-violet-300 transition-colors" strokeWidth={1.5} />
                </div>
                <h3 className="font-bold text-white/90 text-base sm:text-lg mb-1.5 text-center transition-colors group-hover:text-white">{feature.title}</h3>
                <p className="text-xs text-white/50 text-center">{feature.desc}</p>
              </div>
            ))}
          </div>
          <div className={`mt-10 sm:mt-12 transition-all duration-700 delay-[1100ms] ${currentSlide === 1 ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'}`}>
            <button onClick={nextSlide} className="inline-flex items-center gap-2 text-white hover:text-white transition-all border border-violet-500/60 rounded-full px-6 py-2.5 bg-violet-500/20 hover:bg-violet-500/40 hover:scale-105 backdrop-blur-md text-sm font-medium shadow-[0_0_20px_rgba(139,92,246,0.2)]">
              Xem Báo Giá <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Slide 3: Liên hệ */}
        <div className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          currentSlide === 2 ? 'opacity-100 translate-x-0 scale-100 pointer-events-auto z-20' :
          currentSlide > 2 ? 'opacity-0 -translate-x-32 scale-95 pointer-events-none z-0' :
          'opacity-0 translate-x-32 scale-95 pointer-events-none z-0'
        }`}>
          <div className={`transition-all duration-700 delay-300 ${currentSlide === 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="p-4 rounded-full bg-violet-500/10 border border-violet-500/20 mb-5 backdrop-blur-md">
              <Sparkles className="w-10 h-10 text-violet-400 animate-pulse" />
            </div>
          </div>
          <h2 className={`text-2xl sm:text-4xl font-bold mb-3 text-white/95 tracking-tight text-center px-4 transition-all duration-700 delay-500 ${currentSlide === 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>Bắt Đầu Dự Án Của Bạn</h2>
          <p className={`text-white/60 mb-8 max-w-md mx-auto text-sm leading-relaxed px-4 text-center transition-all duration-700 delay-700 ${currentSlide === 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            Chúng tôi sẵn sàng lắng nghe ý tưởng của bạn. Kết nối ngay để nhận tư vấn và báo giá chi tiết hoàn toàn miễn phí.
          </p>
          
          <div className={`transition-all duration-700 delay-[900ms] ${currentSlide === 2 ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'}`}>
            <a 
              href="https://zalo.me/0866984097"
              target="_blank"
              rel="noopener noreferrer"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className="inline-flex items-center justify-center gap-2.5 px-6 py-3 sm:px-8 sm:py-4 rounded-2xl border border-violet-500/40 bg-violet-500/10 hover:bg-violet-500/20 backdrop-blur-xl transition-all duration-500 group shadow-[0_0_20px_rgba(139,92,246,0.15)] hover:shadow-[0_0_30px_rgba(139,92,246,0.4)] hover:-translate-y-1"
            >
              <span className="font-bold text-base sm:text-lg text-white">Liên hệ ngay</span>
              <ExternalLink className={`w-4 h-4 text-white/60 transition-all duration-300 ${isHovered ? 'translate-x-1 text-white' : ''}`} />
            </a>
          </div>
          <div className={`mt-6 text-white/50 text-xs font-medium bg-white/5 px-4 py-2 rounded-full backdrop-blur-md border border-white/10 transition-all duration-700 delay-[1100ms] ${currentSlide === 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            Hotline trực tiếp: <span className="text-white/80 font-bold tracking-wider text-sm ml-1.5">0866.984.097</span>
          </div>
        </div>

      </div>

      {/* Dots Navigation */}
      <div className="absolute bottom-8 left-0 right-0 flex items-center justify-center gap-4 z-30">
        {[0, 1, 2].map((idx) => (
          <button 
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`transition-all duration-500 rounded-full h-1.5 ${currentSlide === idx ? 'w-10 bg-violet-400 shadow-[0_0_15px_rgba(167,139,250,0.8)]' : 'w-2.5 bg-white/30 hover:bg-white/60 hover:scale-150'}`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>

    </div>
  );
}
