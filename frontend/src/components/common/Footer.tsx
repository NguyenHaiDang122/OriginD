import { useNavigate } from "react-router-dom";

export default function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="mt-auto border-t border-white/10 pt-8 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col items-center justify-between gap-6 lg:flex-row text-center lg:text-left">
        {/* Left: Brand, Tagline, Phone & Email */}
        <div className="flex flex-col items-center lg:items-start gap-2.5 shrink-0">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-500 font-bold text-white text-xs shadow-md">
              O
            </span>
            <span className="font-bold text-white/90 text-sm tracking-wide">OriginD</span>
            <span className="text-white/40 text-xs">| Nền tảng Kiến tạo Website & Landing Page Siêu Tốc</span>
          </div>

          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs text-white/80">
            <a href="tel:0866984097" className="flex items-center gap-1.5 hover:text-violet-300 transition">
              <svg className="h-3.5 w-3.5 text-violet-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span>0866.984.097</span>
            </a>
            <a href="mailto:contact.origind@gmail.com" className="flex items-center gap-1.5 hover:text-indigo-300 transition">
              <svg className="h-3.5 w-3.5 text-indigo-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2V8a2 2 0 00-2-2H5z" />
              </svg>
              <span>contact.origind@gmail.com</span>
            </a>
          </div>
        </div>

        {/* Right: Horizontal Navigation & Copyright */}
        <div className="flex flex-col items-center lg:items-end gap-3 shrink-0">
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-white/60">
            <button type="button" onClick={() => navigate("/")} className="hover:text-white transition">
              Trang chủ
            </button>
            <button type="button" onClick={() => navigate("/templates")} className="hover:text-white transition">
              Mẫu website
            </button>
            <button type="button" onClick={() => navigate("/support")} className="hover:text-white transition">
              Hỗ trợ & Hướng dẫn
            </button>
            <button type="button" onClick={() => navigate("/stats")} className="hover:text-white transition">
              Thống kê
            </button>
          </div>

          <div className="text-xs text-white/50">
            &copy; {new Date().getFullYear()} OriginD. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
