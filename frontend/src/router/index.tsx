import { createBrowserRouter } from "react-router-dom";

import DashboardLayout from "../layouts/DashboardLayout";
import AdminLayout from "../layouts/AdminLayout";

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
import DomainGuide from "../pages/DomainGuide/DomainGuide";
import AdminSupport from "../pages/admin/AdminSupport";
import AdminStatistics from "../pages/admin/AdminStatistics";
import AdminPopup from "../pages/admin/AdminPopup";
import WebDesignService from "../pages/WebDesignService";

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
        path: "domain-guide",
        element: <DomainGuide />,
      },
      {
        path: "admin",
        element: (
          <ProtectedAdminRoute>
            <AdminLayout />
          </ProtectedAdminRoute>
        ),
        children: [
          {
            index: true,
            element: <AdminDashboard />,
          },
          {
            path: "dashboard",
            element: <AdminDashboard />,
          },
          {
            path: "templates",
            element: <AdminTemplates />,
          },
          {
            path: "users",
            element: <AdminUsers />,
          },
          {
            path: "deposits",
            element: <AdminDeposits />,
          },
          {
            path: "plans",
            element: <AdminPlans />,
          },
          {
            path: "custom-domains",
            element: <AdminCustomDomains />,
          },
          {
            path: "support",
            element: <AdminSupport />,
          },
          {
            path: "statistics",
            element: <AdminStatistics />,
          },
          {
            path: "popup",
            element: <AdminPopup />,
          },
        ]
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
        path: "web-design",
        element: <WebDesignService />,
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