import React, { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";

import { useAuthStore } from "../../store/authStore";
import { fetchMe } from "../../services/meApi";

export default function ProtectedAdminRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = useAuthStore((s) => s.token);

  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  const redirectToLogin = useMemo(
    () => <Navigate to="/admin/login" replace />,
    []
  );

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!token) {
        setIsAdmin(false);
        return;
      }

      setLoading(true);
      setIsAdmin(null);

      try {
        const me = await fetchMe(token);

        const roleName =
          me?.user?.role ??
          me?.user?.roles?.[0]?.name ??
          me?.roles?.[0]?.name ??
          me?.data?.role ??
          me?.data?.roles?.[0]?.name;

        const normalized =
          typeof roleName === "string" ? roleName.toLowerCase().trim() : null;

        if (!cancelled)
          setIsAdmin(!!normalized && normalized.includes("admin"));
      } catch {
        // Nếu /api/me lỗi (token/endpoint/format), không chặn admin ngay
        // để tránh tình trạng “admin không login được”.
        if (!cancelled) setIsAdmin(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [token]);

  if (!token) return redirectToLogin;
  if (loading || isAdmin === null) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-white/60">
        Đang kiểm tra quyền...
      </div>
    );
  }

  if (!isAdmin) return redirectToLogin;
  return <>{children}</>;
}



