import { Outlet } from "react-router-dom";
import Header from "../components/layout/Header";

export default function DashboardLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-white">
      <Header />

      <main className="flex-1 pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <Outlet />
      </main>
    </div>
  );
}