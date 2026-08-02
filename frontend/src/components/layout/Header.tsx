import { useState, useEffect } from "react";
import { LogOut } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { fetchDeposits, checkSepayDeposit } from "../../services/depositApi";
import DepositModal from "../common/DepositModal";

const menus = [
  { name: "Trang Chủ", path: "/" },
  { name: "Chọn Mẫu", path: "/templates" },
  { name: "Thống Kê", path: "/stats" },
  { name: "Hỗ Trợ", path: "/support" },
  { name: "Nâng Hạng", path: "/upgrade" },
  { name: "Thiết Kế Website", path: "/web-design" },
];

export default function Header() {
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user) as any;
  const logout = useAuthStore((s) => s.logout);
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const refreshHeaderBalance = () => {
    if (token) {
      fetchDeposits(token)
        .then((res) => {
          const newBal = Number(res.balance || 0);
          useAuthStore.getState().updateBalance(newBal);
        })
        .catch(() => {});
    }
  };

  const checkHeaderSepayOrders = () => {
    if (!token) return;
    const nowTime = Date.now();
    const lastTime = Number(sessionStorage.getItem("last_sepay_check") || 0);
    const isPaymentRedirect = window.location.search.includes("payment=");

    // Chỉ check SePay tự động tối đa 1 lần mỗi 60 giây hoặc khi vừa chuyển hướng từ trang thanh toán về
    if (!isPaymentRedirect && nowTime - lastTime < 60000) {
      return;
    }
    sessionStorage.setItem("last_sepay_check", String(nowTime));

    fetchDeposits(token)
      .then(async (res) => {
        const list = res.deposits || [];
        const pendingList = list.filter((d: any) => d.status === "pending");
        if (pendingList.length === 0) return;

        // Chỉ kiểm tra đơn pending gần nhất (tạo trong vòng 30 phút) để tránh lặp gọi API chậm
        const latestPending = pendingList[0];
        if (!latestPending) return;

        try {
          const checkRes = await checkSepayDeposit(token, latestPending.id);
          if (checkRes.status === "approved" || isPaymentRedirect) {
            refreshHeaderBalance();
          }
        } catch (e) {}
      })
      .catch(() => {});
  };

  useEffect(() => {
    refreshHeaderBalance();
    const handleFocus = () => {
      refreshHeaderBalance();
      checkHeaderSepayOrders();
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [token]);

  const roleName = user?.role ?? user?.roles?.[0]?.name;
  const isAdmin = typeof roleName === "string" && roleName.toLowerCase().includes("admin");

  function onLogout() {
    logout();
    navigate("/login");
  }

  return (
    <>
      <header className="fixed top-0 left-0 z-50 w-full border-b border-white/10 bg-white/10 backdrop-blur-2xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-1.5">
            <span className="text-3xl font-black tracking-tighter text-white/95">
              OriginD
            </span>
          </NavLink>

          {/* Menu (tất cả cùng kiểu) */}
          <nav className="hidden lg:flex items-center gap-8 text-[15px] font-medium">
            {menus.map((item) => (
              <NavLink key={item.path} to={item.path}>
                {({ isActive }) => (
                  <div
                    className={`group relative py-5 transition-all duration-300 ${
                      isActive
                        ? "text-white"
                        : "text-white/70 hover:text-white"
                    }`}
                  >
                    {item.name}

                    <span
                      className={`absolute bottom-0 left-0 h-0.5 bg-white transition-all duration-300 ${
                        isActive ? "w-full" : "w-0 group-hover:w-full"
                      }`}
                    />
                  </div>
                )}
              </NavLink>
            ))}

            {token && (
              <NavLink to="/profile">
                {({ isActive }) => (
                  <div
                    className={`group relative py-5 transition-all duration-300 ${
                      isActive ? "text-white" : "text-white/70 hover:text-white"
                    }`}
                  >
                    Hồ sơ
                    <span
                      className={`absolute bottom-0 left-0 h-0.5 bg-white transition-all duration-300 ${
                        isActive ? "w-full" : "w-0 group-hover:w-full"
                      }`}
                    />
                  </div>
                )}
              </NavLink>
            )}
          </nav>

          {/* Auth icon */}
          <div className="hidden lg:flex items-center gap-3">
            {!token ? (
              <NavLink
                to="/login"
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 font-semibold text-white/90 backdrop-blur-xl hover:bg-white/10"
              >
                <span className="hidden lg:inline">Đăng nhập</span>
              </NavLink>
            ) : (
              <div className="flex items-center gap-2.5">
                {isAdmin && (
                  <NavLink
                    to="/admin"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-violet-400/30 bg-violet-500/15 px-3 py-2 font-semibold text-violet-200 backdrop-blur-xl hover:bg-violet-500/25 transition shadow-sm"
                    title="Trung tâm Quản trị Admin"
                  >
                    <span className="text-sm">ADMIN</span>
                  </NavLink>
                )}

                <button
                  type="button"
                  onClick={() => setIsDepositOpen(true)}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-transparent px-4 py-2 text-xs font-semibold text-white/90 hover:scale-105 hover:bg-white/5 backdrop-blur-md transition-all shadow-sm hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                  title="Nạp tiền vào tài khoản"
                >
                  <span>Nạp tiền</span>
                  {user?.balance !== undefined ? (
                    <span className="font-extrabold text-emerald-300 text-[11px] ml-1">
                      {Number(user.balance).toLocaleString("vi-VN")} đ
                    </span>
                  ) : null}
                </button>

                <button
                  type="button"
                  onClick={onLogout}
                  title="Đăng xuất"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-700/80 bg-transparent px-3 py-2 font-semibold text-slate-400 backdrop-blur-xl hover:bg-slate-800/50 hover:text-white transition hover:border-slate-600"
                >
                  <LogOut size={18} />
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden p-2 text-white/80 hover:text-white transition"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      <div className={`fixed inset-0 z-[100] transition-opacity duration-300 lg:hidden ${isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
        
        <div className={`absolute top-0 right-0 w-64 h-full bg-[#0b1221] border-l border-white/10 shadow-2xl transition-transform duration-300 transform ${isMobileMenuOpen ? "translate-x-0" : "translate-x-full"} flex flex-col p-5`}>
          <div className="flex justify-between items-center mb-6">
            <span className="font-bold text-white text-lg tracking-wide">Menu</span>
            <button onClick={() => setIsMobileMenuOpen(false)} className="text-white/50 hover:text-white p-1">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          
          <div className="flex flex-col gap-3 overflow-y-auto pb-6">
            {menus.map(m => (
              <NavLink
                key={m.path}
                to={m.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) => `block px-4 py-2.5 rounded-xl text-sm font-semibold transition ${isActive ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/5 hover:text-white/90"}`}
              >
                {m.name}
              </NavLink>
            ))}
            {token && (
              <NavLink to="/profile" onClick={() => setIsMobileMenuOpen(false)} className={({ isActive }) => `block px-4 py-2.5 rounded-xl text-sm font-semibold transition ${isActive ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/5 hover:text-white/90"}`}>
                Hồ sơ
              </NavLink>
            )}
            
            <div className="h-px bg-white/10 my-2" />
            
            {!token ? (
              <NavLink to="/login" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white/90 bg-white/5 border border-white/10 flex items-center gap-2 hover:bg-white/10 transition">
                Đăng nhập
              </NavLink>
            ) : (
              <div className="flex flex-col gap-3">
                {isAdmin && (
                  <NavLink to="/admin" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-2.5 rounded-xl text-sm font-semibold text-violet-300 bg-violet-500/15 border border-violet-500/30 hover:bg-violet-500/25 transition">
                    ADMIN
                  </NavLink>
                )}
                
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsDepositOpen(true);
                  }}
                  className="w-full text-left px-4 py-2.5 rounded-xl border border-white/10 bg-transparent text-sm font-semibold text-white/90 transition hover:bg-white/5 flex items-center"
                >
                  Nạp
                  {user?.balance !== undefined && (
                    <span className="font-extrabold text-emerald-300 text-[11px] ml-1">
                      {Number(user.balance).toLocaleString("vi-VN")} đ
                    </span>
                  )}
                </button>

                <button onClick={() => { onLogout(); setIsMobileMenuOpen(false); }} className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-400 bg-transparent border border-slate-700/80 flex items-center gap-2 hover:bg-slate-800/50 hover:text-white hover:border-slate-600 transition">
                  <LogOut size={18} /> Đăng xuất
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <DepositModal
        isOpen={isDepositOpen}
        onClose={() => {
          setIsDepositOpen(false);
          checkHeaderSepayOrders();
          refreshHeaderBalance();
        }}
        onSuccess={() => {
          checkHeaderSepayOrders();
          refreshHeaderBalance();
        }}
      />
    </>
  );
}
