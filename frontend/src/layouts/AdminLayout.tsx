import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import AdminMenu from "../components/admin/AdminMenu";
import { useAuthStore } from "../store/authStore";

export default function AdminLayout() {
  const user = useAuthStore((s) => s.user) as any;

  // We could add global admin checks here, but ProtectedAdminRoute already does it.
  
  return (
    <div className="flex flex-col w-full h-full">
      <AdminMenu />
      <div className="flex-1 w-full">
        <Outlet />
      </div>
    </div>
  );
}
