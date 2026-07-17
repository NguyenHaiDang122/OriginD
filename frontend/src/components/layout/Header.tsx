import { useState, useEffect } from "react";
import { LogOut, UserCircle2 } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { fetchDeposits, checkSepayDeposit } from "../../services/depositApi";
import DepositModal from "../common/DepositModal";

const menus = [
  { name: "Trang chủ", path: "/" },
  { name: "Dịch Vụ Miễn Phí", path: "/templates" },
  { name: "Thống kê", path: "/stats" },
  { name: "Hỗ trợ", path: "/support" },
  { name: "Nâng Hạng", path: "/upgrade" },
];

export default function Header() {
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user) as any;
  const logout = useAuthStore((s) => s.logout);
  const [isDepositOpen, setIsDepositOpen] = useState(false);

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
          <nav className="hidden md:flex items-center gap-8 text-[15px] font-medium">
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

            {/* Nút Nạp tiền kế nút Hỗ trợ */}
            <button
              type="button"
              onClick={() => {
                if (!token) {
                  navigate("/login");
                } else {
                  setIsDepositOpen(true);
                }
              }}
              className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-violet-500/20 border border-emerald-400/40 px-3.5 py-1.5 text-xs font-bold text-emerald-300 hover:scale-105 hover:bg-emerald-500/30 transition-all shadow-sm"
              title="Nạp tiền vào tài khoản"
            >
              <span>Nạp tiền</span>
              {user?.balance !== undefined ? (
                <span className="font-extrabold text-white bg-emerald-600/40 px-2 py-0.5 rounded-full text-[11px]">
                  {Number(user.balance).toLocaleString("vi-VN")} đ
                </span>
              ) : null}
            </button>
          </nav>

          {/* Auth icon */}
          <div className="flex items-center gap-3">
            {!token ? (
              <NavLink
                to="/login"
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 font-semibold text-white/90 backdrop-blur-xl hover:bg-white/10"
              >
                <UserCircle2 size={18} />
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
                    <span className="text-sm">🛡️ Admin</span>
                  </NavLink>
                )}

                <NavLink
                  to="/profile"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 font-semibold text-white/90 backdrop-blur-xl hover:bg-white/10 transition hover:border-violet-400/50"
                  title="Xem hồ sơ tài khoản"
                >
                  <UserCircle2 size={18} className="text-violet-300" />
                  <span className="text-sm">Hồ sơ</span>
                </NavLink>

                <button
                  type="button"
                  onClick={onLogout}
                  title="Đăng xuất"
                  className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-3 py-2 font-semibold text-rose-300 backdrop-blur-xl hover:bg-rose-500/20 transition"
                >
                  <LogOut size={18} />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

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
