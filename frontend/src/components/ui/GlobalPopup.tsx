import { useState, useEffect, useRef } from "react";
import { getPopupSettings } from "../../services/settingApi";
import type { PopupSettings } from "../../services/settingApi";

export default function GlobalPopup() {
  const isPreviewMode = typeof window !== "undefined" && window.location.search.includes("mode=preview");

  const hasUserInteracted = useRef(false);

  const pathname = typeof window !== "undefined" ? window.location.pathname : "";
  const isExcluded = pathname.startsWith("/templates") || pathname.startsWith("/dashboard") || pathname.startsWith("/admin") || pathname.startsWith("/profile");

  const [settings, setSettings] = useState<PopupSettings | null>(() => {
    if (isPreviewMode || isExcluded) return null;
    try {
      const cached = localStorage.getItem("popup_cache");
      if (cached) return JSON.parse(cached);
    } catch {}
    return null;
  });

  const [isOpen, setIsOpen] = useState(() => {
    if (isPreviewMode || isExcluded) return false;
    try {
      const cached = localStorage.getItem("popup_cache");
      if (cached) {
        const data = JSON.parse(cached);
        const isActiveVal = data?.isActive as any;
        const isActive = isActiveVal === true || isActiveVal === "true" || isActiveVal === 1 || isActiveVal === "1";
        if (isActive) {
          const hiddenUntil = localStorage.getItem("popup_hidden_until");
          if (!hiddenUntil || Date.now() > parseInt(hiddenUntil, 10)) {
            return true;
          }
        }
      }
    } catch {}
    return false;
  });

  useEffect(() => {
    if (isPreviewMode || isExcluded) return;

    const fetchPopup = async () => {
      try {
        const data = await getPopupSettings();
        if (data) {
          localStorage.setItem("popup_cache", JSON.stringify(data));
          
          const isActiveVal = data.isActive as any;
          const isActive = isActiveVal === true || isActiveVal === "true" || isActiveVal === 1 || isActiveVal === "1";
          
          if (isActive) {
            const hiddenUntil = localStorage.getItem("popup_hidden_until");
            if (!hiddenUntil || Date.now() > parseInt(hiddenUntil, 10)) {
              setSettings(data);
              if (!hasUserInteracted.current) setIsOpen(true);
            } else {
              if (!hasUserInteracted.current) setIsOpen(false);
            }
          } else {
            if (!hasUserInteracted.current) setIsOpen(false);
          }
        }
      } catch (err) {
        console.error("Lỗi lấy thông báo:", err);
      }
    };

    fetchPopup();
  }, [isPreviewMode]);

  const handleClose = () => {
    hasUserInteracted.current = true;
    setIsOpen(false);
  };

  const handleHideForDuration = () => {
    hasUserInteracted.current = true;
    if (!settings) return;
    const hours = settings.hideDurationHours || 1;
    const hideUntil = Date.now() + hours * 3600 * 1000;
    localStorage.setItem("popup_hidden_until", hideUntil.toString());
    setIsOpen(false);
  };

  if (isPreviewMode || isExcluded || !isOpen || !settings) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto animate-in fade-in duration-300">
      <div className="relative w-full max-w-md rounded-3xl border border-white/20 bg-gradient-to-b from-slate-900/95 to-slate-950/95 p-6 sm:p-8 shadow-2xl text-white animate-in zoom-in-95 duration-300">
        
        <button
          onClick={handleClose}
          className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-all text-sm font-bold z-10"
          title="Đóng thông báo"
        >
          ✕
        </button>

        <div className="flex flex-col sm:flex-row items-center gap-3 mb-6 border-b border-white/10 pb-6">
          <img 
            src="https://i.imgur.com/PIrOjbx.png" 
            alt="Logo" 
            className="h-12 w-12 rounded-2xl object-cover shadow-lg shadow-black/20"
          />
          <div className="text-center sm:text-left">
            <h3 className="text-xl font-extrabold tracking-tight">{settings.title}</h3>
            <p className="text-xs text-white/60">
              Thông báo từ hệ thống
            </p>
          </div>
        </div>

        <div className="relative z-10 w-full mb-8 mt-2 drop-shadow-[0_4px_12px_rgba(0,0,0,0.4)]">
          <div 
            className="w-full bg-[#e8e4d8] text-slate-800 px-6 py-10 whitespace-pre-wrap break-words text-base font-bold leading-relaxed text-center [-webkit-text-stroke:0.3px_currentColor]"
            style={{
              clipPath: "polygon(0% 5px, 2% 0%, 4% 7px, 6% 0%, 8% 4px, 10% 0%, 12% 8px, 14% 0%, 16% 5px, 18% 0%, 20% 9px, 22% 0%, 24% 6px, 26% 0%, 28% 4px, 30% 0%, 32% 9px, 34% 0%, 36% 5px, 38% 0%, 40% 8px, 42% 0%, 44% 4px, 46% 0%, 48% 7px, 50% 0%, 52% 5px, 54% 0%, 56% 9px, 58% 0%, 60% 6px, 62% 0%, 64% 4px, 66% 0%, 68% 8px, 70% 0%, 72% 5px, 74% 0%, 76% 7px, 78% 0%, 80% 4px, 82% 0%, 84% 9px, 86% 0%, 88% 5px, 90% 0%, 92% 8px, 94% 0%, 96% 4px, 98% 0%, 100% 6px, 100% calc(100% - 6px), 98% 100%, 96% calc(100% - 4px), 94% 100%, 92% calc(100% - 8px), 90% 100%, 88% calc(100% - 5px), 86% 100%, 84% calc(100% - 9px), 82% 100%, 80% calc(100% - 4px), 78% 100%, 76% calc(100% - 7px), 74% 100%, 72% calc(100% - 5px), 70% 100%, 68% calc(100% - 8px), 66% 100%, 64% calc(100% - 4px), 62% 100%, 60% calc(100% - 6px), 58% 100%, 56% calc(100% - 9px), 54% 100%, 52% calc(100% - 5px), 50% 100%, 48% calc(100% - 7px), 46% 100%, 44% calc(100% - 4px), 42% 100%, 40% calc(100% - 8px), 38% 100%, 36% calc(100% - 5px), 34% 100%, 32% calc(100% - 9px), 30% 100%, 28% calc(100% - 4px), 26% 100%, 24% calc(100% - 6px), 22% 100%, 20% calc(100% - 9px), 18% 100%, 16% calc(100% - 5px), 14% 100%, 12% calc(100% - 8px), 10% 100%, 8% calc(100% - 4px), 6% 100%, 4% calc(100% - 7px), 2% 100%, 0% calc(100% - 5px))"
            }}
            dangerouslySetInnerHTML={{ __html: settings.content }}
          />
        </div>

        <div className="flex flex-col gap-2.5">

          <button
            onClick={handleHideForDuration}
            className="w-full rounded-xl border border-white/20 bg-white/5 py-2 text-xs font-semibold text-white/80 hover:bg-white/10 transition-all"
          >
            Tắt thông báo trong {settings.hideDurationHours || 1} giờ
          </button>
        </div>
      </div>
    </div>
  );
}
