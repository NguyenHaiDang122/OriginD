import { useEffect, useState } from "react";
import { API_BASE_URL } from "../../config/api";
import "./Maintenance.css";

export default function Maintenance() {
  const [message, setMessage] = useState("Hệ thống đang được bảo trì. Vui lòng quay lại sau.");
  const [displayedMessage, setDisplayedMessage] = useState("");

  useEffect(() => {
    const storedMessage = sessionStorage.getItem("maintenance_message");
    const fullText = storedMessage || "Hệ thống đang được bảo trì. Vui lòng quay lại sau.";
    setMessage(fullText);
    
    // Typewriter effect
    let i = 0;
    setDisplayedMessage("");
    const typeTimer = setInterval(() => {
      setDisplayedMessage(fullText.substring(0, i + 1));
      i++;
      if (i >= fullText.length) {
        clearInterval(typeTimer);
      }
    }, 40); // speed

    // Polling mechanism to check if maintenance mode is off
    const pingTimer = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/settings/popup`, {
          headers: { 'Accept': 'application/json' }
        });
        // If it returns 200 OK, maintenance is off
        if (res.ok) {
          window.location.href = "/";
        }
      } catch (err) {
        // Ignore network errors or 503s
      }
    }, 10000); // Check every 10s

    return () => {
      clearInterval(typeTimer);
      clearInterval(pingTimer);
    };
  }, []);

  return (
    <div className="maintenance-container">
      {/* Background Animated Orbs */}
      <div className="bg-orb orb-1"></div>
      <div className="bg-orb orb-2"></div>
      <div className="bg-orb orb-3"></div>

      <div className="maintenance-content">
        <div className="icon-wrapper">
          <div className="icon-glow"></div>
          <div className="gears-container">
            <svg className="gear gear-main" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        </div>
        
        <h1 className="maintenance-title">Đang Nâng Cấp Hệ Thống</h1>
        
        <div className="maintenance-desc-container typewriter-container">
          <p className="maintenance-desc console-text">
            <span className="console-prompt">&gt; </span>
            {displayedMessage}
            <span className="cursor-blink">_</span>
          </p>
        </div>

        <div className="maintenance-info-badge">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="info-icon">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
          <span className="font-medium">Các trang Landing Page đã xuất bản vẫn hoạt động bình thường.</span>
        </div>
        
        <div className="maintenance-actions mt-6">
          <a 
            href="https://zalo.me/0866984097" 
            target="_blank" 
            rel="noopener noreferrer"
            className="ghost-btn group zalo-btn" 
          >
            <span className="flex items-center gap-3">
              <div className="zalo-icon-wrapper">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
              </div>
              <div className="flex flex-col items-start">
                <span className="text-[11px] uppercase tracking-wider text-[#0068ff]/70 font-bold">Hỗ trợ khẩn cấp</span>
                <span className="text-lg font-bold text-white leading-tight">Chat qua Zalo</span>
              </div>
            </span>
            <div className="btn-glow zalo-glow"></div>
          </a>
        </div>
      </div>
    </div>
  );
}
