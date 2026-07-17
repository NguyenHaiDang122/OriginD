import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    google?: any;
  }
}

interface GoogleAuthButtonProps {
  onSuccess: (credential: string) => void | Promise<void>;
  onError?: (err: string) => void;
  text?: "signin_with" | "signup_with" | "continue_with";
}

export default function GoogleAuthButton({
  onSuccess,
  onError,
  text = "continue_with",
}: GoogleAuthButtonProps) {
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const buttonContainerRef = useRef<HTMLDivElement>(null);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!clientId) return;

    if (window.google?.accounts?.id) {
      setScriptLoaded(true);
      return;
    }

    const scriptId = "google-gsi-client";
    let script = document.getElementById(scriptId) as HTMLScriptElement;

    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => setScriptLoaded(true);
      script.onerror = () => onError?.("Không thể tải Google Identity Service.");
      document.head.appendChild(script);
    } else {
      script.addEventListener("load", () => setScriptLoaded(true));
    }
  }, [clientId, onError]);

  useEffect(() => {
    if (!scriptLoaded || !clientId || !buttonContainerRef.current || !window.google?.accounts?.id) {
      return;
    }

    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response: any) => {
          if (response?.credential) {
            setLoading(true);
            try {
              await onSuccess(response.credential);
            } catch (err: any) {
              onError?.(err?.message || "Xác thực Google thất bại");
            } finally {
              setLoading(false);
            }
          }
        },
      });

      buttonContainerRef.current.innerHTML = "";
      window.google.accounts.id.renderButton(buttonContainerRef.current, {
        theme: "filled_black",
        size: "large",
        shape: "pill",
        text: text,
        width: buttonContainerRef.current.clientWidth || 360,
      });
    } catch (err) {
      console.error("Google button init error:", err);
    }
  }, [scriptLoaded, clientId, onSuccess, onError, text]);

  if (!clientId) {
    return (
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-center text-xs text-amber-200">
        Chưa cấu hình VITE_GOOGLE_CLIENT_ID trong file .env
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center">
      <div
        ref={buttonContainerRef}
        className="w-full flex justify-center min-h-[44px] transition-all overflow-hidden"
      />
      {loading ? (
        <div className="mt-2 flex items-center gap-2 text-xs text-emerald-300 animate-pulse font-medium">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
          Đang xác thực với Google...
        </div>
      ) : null}
    </div>
  );
}
