import { LogOut, UserCircle2 } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";

import { useAuthStore } from "../../store/authStore";

const menus = [
  { name: "Trang chủ", path: "/" },
  { name: "Thống kê", path: "/stats" },
  { name: "Dịch Vụ Miễn Phí", path: "/templates" },
  { name: "Hỗ trợ", path: "/support" },
];






export default function Header() {
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user) as any;
  const logout = useAuthStore((s) => s.logout);

  const roleName = user?.role ?? user?.roles?.[0]?.name;
  const isAdmin = typeof roleName === "string" && roleName.toLowerCase().includes("admin");





  function onLogout() {
    logout();
    navigate("/login");
  }

  return (
    <header className="fixed top-0 left-0 z-50 w-full border-b border-white/10 bg-white/10 backdrop-blur-2xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">

        {/* Logo */}
        <NavLink to="/" className="flex items-center gap-1.5">
          <span className="text-3xl font-black tracking-tighter text-white/95">
            OriginD
          </span>
        </NavLink>

        {/* Menu (tất cả cùng kiểu) */}
        <nav className="hidden md:flex items-center gap-10 text-[15px] font-medium">
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
  );
}
