import { NavLink } from "react-router-dom";
import { LayoutDashboard, Users, CreditCard, LayoutTemplate, Link, HelpCircle, Bell, Settings } from "lucide-react";

export default function AdminMenu() {
  const menus = [
    { name: "Dashboard", path: "/admin", icon: LayoutDashboard },
    { name: "Thống kê", path: "/admin/statistics" },
    { name: "Users", path: "/admin/users", icon: Users },
    { name: "Plans", path: "/admin/plans", icon: CreditCard },
    { name: "Templates", path: "/admin/templates", icon: LayoutTemplate },
    { name: "Custom Domains", path: "/admin/custom-domains", icon: Link },
    { name: "Deposits", path: "/admin/deposits", icon: CreditCard },
    { name: "Support", path: "/admin/support", icon: HelpCircle },
    { name: "Popup", path: "/admin/popup", icon: Bell },
    { name: "Bảo trì", path: "/admin/maintenance", icon: Settings },
  ];

  return (
    <div className="mb-6 flex flex-wrap gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
      {menus.map((m) => (
        <NavLink
          key={m.path}
          to={m.path}
          end={m.path === "/admin"}
          className={({ isActive }) =>
            `inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-all whitespace-nowrap ${
              isActive
                ? "border-violet-500/50 bg-violet-500/10 text-violet-300 shadow-[0_0_15px_rgba(139,92,246,0.15)]"
                : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
            }`
          }
        >
          {m.icon && <m.icon size={16} />}
          {m.name}
        </NavLink>
      ))}
    </div>
  );
}
