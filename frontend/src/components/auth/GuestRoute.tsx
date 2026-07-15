import React from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

export default function GuestRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user) as any;

  if (token) {
    const roleName = user?.role ?? user?.roles?.[0]?.name;
    const isAdmin = typeof roleName === "string" && roleName.toLowerCase().includes("admin");
    return <Navigate to={isAdmin ? "/admin" : "/"} replace />;
  }

  return <>{children}</>;
}
