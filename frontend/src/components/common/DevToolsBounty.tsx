import { useEffect, useState } from "react";

import devtoolsDetector from 'devtools-detector';

export default function DevToolsBounty() {
  const [show, setShow] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    if (hasShown) return;

    const listener = (isOpen: boolean) => {
      if (isOpen) {
        setShow(true);
        setHasShown(true);
        
        // Chờ 2s để đảm bảo library không xóa mất log, sau đó mới in ra console
        setTimeout(() => {
          console.log(
            "%c Xin chào Developer!",
            "color: #10b981; font-size: 24px; font-weight: bold; text-shadow: 1px 1px 0 #000;"
          );
          console.log(
            "%cNếu bạn phát hiện lỗ hổng bảo mật, vui lòng liên hệ đội ngũ OriginD qua support@origind.id.vn. Chúng tôi luôn trân trọng những đóng góp giúp sản phẩm an toàn hơn.\n\nIf you discover a security vulnerability, please report it to support@origind.id.vn. We truly appreciate your help in keeping OriginD secure.",
            "color: #0d2c55; font-size: 14px;"
          );
        }, 2000);
      }
    };

    devtoolsDetector.addListener(listener);
    devtoolsDetector.launch();

    return () => {
      devtoolsDetector.removeListener(listener);
      devtoolsDetector.stop();
    };
  }, [hasShown]);

  if (!show) return null;

  return (
    <>
      <style>{`
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
      <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/90 backdrop-blur-sm p-4 transition-all duration-500">
        <div 
          className="relative w-full max-w-lg rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-slate-900 to-slate-950 p-8 shadow-[0_0_50px_-15px_rgba(16,185,129,0.4)] text-center"
          style={{ animation: 'slideInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
        >
          <button
            onClick={() => setShow(false)}
            className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-white/50 hover:bg-white/10 hover:text-white transition-all"
          >
            ✕
          </button>
          
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 border border-emerald-500/30 mb-6 shadow-inner relative overflow-hidden">
            <div className="absolute inset-0 bg-emerald-400/20 animate-pulse"></div>
            <svg className="h-8 w-8 text-emerald-400 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </div>

          <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300 mb-4 uppercase tracking-wider">
            Xin chào Developer!
          </h2>
          
          <p className="text-slate-300 leading-relaxed mb-8 text-sm md:text-base">
            Nếu bạn tìm thấy lỗ hổng bảo mật, hãy báo cho đội ngũ <strong className="text-emerald-400">OriginD</strong> support@origind.id.vn. Chúng tôi luôn trân trọng những đóng góp giúp sản phẩm an toàn hơn.
          </p>

          <button
            onClick={() => setShow(false)}
            className="w-full rounded-xl bg-transparent hover:bg-emerald-500/10 border border-emerald-500/50 hover:border-emerald-400 py-3.5 font-bold text-emerald-400 transition-all transform hover:scale-[1.02] active:scale-95"
          >
            Tiếp tục khám phá
          </button>
        </div>
      </div>
    </>
  );
}
