import { useState, useEffect, useRef } from "react";
import { getPopupSettings } from "../../services/settingApi";
import type { PopupSettings } from "../../services/settingApi";
import { X } from "lucide-react";

export default function GlobalPopup() {
  const isPreviewMode = typeof window !== "undefined" && window.location.search.includes("mode=preview");

  const hasUserInteracted = useRef(false);

  const [settings, setSettings] = useState<PopupSettings | null>(() => {
    if (isPreviewMode) return null;
    try {
      const cached = localStorage.getItem("popup_cache");
      if (cached) return JSON.parse(cached);
    } catch {}
    return null;
  });

  const [isOpen, setIsOpen] = useState(() => {
    if (isPreviewMode) return false;
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
    if (isPreviewMode) return;

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

  if (isPreviewMode || !isOpen || !settings) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-800 bg-transparent p-8 backdrop-blur-2xl animate-in zoom-in-95 duration-300 shadow-2xl">
        
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 rounded-full p-2 text-white/50 transition-colors hover:bg-white/10 hover:text-white z-10"
          title="Đóng thông báo"
        >
          <X size={20} />
        </button>

        <div className="relative z-10 text-center mt-2">
          <h2 className="mb-4 text-2xl font-extrabold text-white tracking-tight">{settings.title}</h2>
          <div 
            className="mb-8 whitespace-pre-wrap break-words text-sm text-white/90 leading-relaxed text-left bg-white/10 p-5 rounded-2xl border border-white/15 shadow-inner w-full"
            dangerouslySetInnerHTML={{ __html: settings.content }}
          />
          <div className="flex flex-col gap-2">
            <button
              onClick={handleClose}
              className="w-full rounded-xl border border-slate-700 bg-white/5 hover:bg-white/10 px-6 py-3 font-bold text-sm text-white transition-colors"
            >
              Đã hiểu
            </button>
            <button
              onClick={handleHideForDuration}
              className="w-full rounded-xl px-6 py-2 text-sm text-white/50 hover:text-white/80 transition-colors"
            >
              Tắt trong {settings.hideDurationHours || 1} giờ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
