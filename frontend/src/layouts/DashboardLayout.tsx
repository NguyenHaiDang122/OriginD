import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/layout/Header";
import Footer from "../components/common/Footer";
import { useAuthStore } from "../store/authStore";
import { fetchMe } from "../services/meApi";

export default function DashboardLayout() {
  const token = useAuthStore((s) => s.token);
  const setUser = useAuthStore((s) => s.setUser);

  useEffect(() => {
    if (token) {
      fetchMe(token)
        .then((res) => {
          if (res?.data) {
            setUser(res.data);
          } else if (res && typeof res === "object") {
            setUser(res as any);
          }
        })
        .catch(() => {});
    }
  }, [token, setUser]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-white">
      <Header />

      <main className="flex-1 pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}