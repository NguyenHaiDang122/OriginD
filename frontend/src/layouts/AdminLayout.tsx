import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import AdminMenu from "../components/admin/AdminMenu";
import PageLoader from "../components/common/PageLoader";

export default function AdminLayout() {
  // We could add global admin checks here, but ProtectedAdminRoute already does it.
  
  return (
    <div className="flex flex-col w-full h-full">
      <AdminMenu />
      <div className="flex-1 w-full relative">
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </div>
    </div>
  );
}
