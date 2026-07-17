import { createBrowserRouter } from "react-router-dom";

import DashboardLayout from "../layouts/DashboardLayout";

import Dashboard from "../pages/dashboard/Dashboard";
import Templates from "../pages/Templates/Templates";
import Login from "../pages/auth/Login";
import AdminLogin from "../pages/admin/AdminLogin";
import Register from "../pages/auth/Register";
import Support from "../pages/Support/Support";
import Stats from "../pages/Stats/Stats";
import Profile from "../pages/Profile/Profile";
import AdminTemplates from "../pages/admin/AdminTemplates";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminUsers from "../pages/admin/AdminUsers";
import AdminDeposits from "../pages/admin/AdminDeposits";
import AdminPlans from "../pages/admin/AdminPlans";
import ProtectedAdminRoute from "../pages/admin/ProtectedAdminRoute";
import GuestRoute from "../components/auth/GuestRoute";
import Upgrade from "../pages/Upgrade/Upgrade";
import AdminCustomDomains from "../pages/admin/AdminCustomDomains";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <DashboardLayout />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: "templates",
        element: <Templates />,
      },
      {
        path: "upgrade",
        element: <Upgrade />,
      },
      {
        path: "admin",
        element: (
          <ProtectedAdminRoute>
            <AdminDashboard />
          </ProtectedAdminRoute>
        ),
      },
      {
        path: "admin/dashboard",
        element: (
          <ProtectedAdminRoute>
            <AdminDashboard />
          </ProtectedAdminRoute>
        ),
      },
      {
        path: "admin/templates",
        element: (
          <ProtectedAdminRoute>
            <AdminTemplates />
          </ProtectedAdminRoute>
        ),
      },
      {
        path: "admin/users",
        element: (
          <ProtectedAdminRoute>
            <AdminUsers />
          </ProtectedAdminRoute>
        ),
      },
      {
        path: "admin/deposits",
        element: (
          <ProtectedAdminRoute>
            <AdminDeposits />
          </ProtectedAdminRoute>
        ),
      },
      {
        path: "admin/plans",
        element: (
          <ProtectedAdminRoute>
            <AdminPlans />
          </ProtectedAdminRoute>
        ),
      },
      {
        path: "admin/custom-domains",
        element: (
          <ProtectedAdminRoute>
            <AdminCustomDomains />
          </ProtectedAdminRoute>
        ),
      },
      {
        path: "support",
        element: <Support />,
      },
      {
        path: "stats",
        element: <Stats />,
      },
      {
        path: "profile",
        element: <Profile />,
      },
    ],
  },

  {
    path: "/login",
    element: (
      <GuestRoute>
        <Login />
      </GuestRoute>
    ),
  },

  {
    path: "/admin/login",
    element: (
      <GuestRoute>
        <AdminLogin />
      </GuestRoute>
    ),
  },

  {
    path: "/register",
    element: (
      <GuestRoute>
        <Register />
      </GuestRoute>
    ),
  },
]);  