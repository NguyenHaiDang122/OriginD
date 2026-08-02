import React, { Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";

import DashboardLayout from "../layouts/DashboardLayout";
import AdminLayout from "../layouts/AdminLayout";
import ProtectedAdminRoute from "../pages/admin/ProtectedAdminRoute";
import GuestRoute from "../components/auth/GuestRoute";
import PageLoader from "../components/common/PageLoader";

// Lazy Loaded Pages
const Dashboard = React.lazy(() => import("../pages/dashboard/Dashboard"));
const Templates = React.lazy(() => import("../pages/Templates/Templates"));
const Login = React.lazy(() => import("../pages/auth/Login"));
const ForgotPassword = React.lazy(() => import("../pages/auth/ForgotPassword"));
const AdminLogin = React.lazy(() => import("../pages/admin/AdminLogin"));
const Register = React.lazy(() => import("../pages/auth/Register"));
const Support = React.lazy(() => import("../pages/Support/Support"));
const Stats = React.lazy(() => import("../pages/Stats/Stats"));
const Profile = React.lazy(() => import("../pages/Profile/Profile"));
const AdminTemplates = React.lazy(() => import("../pages/admin/AdminTemplates"));
const AdminDashboard = React.lazy(() => import("../pages/admin/AdminDashboard"));
const AdminUsers = React.lazy(() => import("../pages/admin/AdminUsers"));
const AdminDeposits = React.lazy(() => import("../pages/admin/AdminDeposits"));
const AdminPlans = React.lazy(() => import("../pages/admin/AdminPlans"));
const Upgrade = React.lazy(() => import("../pages/Upgrade/Upgrade"));
const AdminCustomDomains = React.lazy(() => import("../pages/admin/AdminCustomDomains"));
const DomainGuide = React.lazy(() => import("../pages/DomainGuide/DomainGuide"));
const AdminSupport = React.lazy(() => import("../pages/admin/AdminSupport"));
const AdminStatistics = React.lazy(() => import("../pages/admin/AdminStatistics"));
const AdminPopup = React.lazy(() => import("../pages/admin/AdminPopup"));
const AdminMaintenance = React.lazy(() => import("../pages/admin/AdminMaintenance"));
const WebDesignService = React.lazy(() => import("../pages/WebDesignService"));
const Maintenance = React.lazy(() => import("../pages/Maintenance/Maintenance"));

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
          {
            path: "maintenance",
            element: <AdminMaintenance />,
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
        <Suspense fallback={<PageLoader />}>
          <Login />
        </Suspense>
      </GuestRoute>
    ),
  },

  {
    path: "/admin/login",
    element: (
      <GuestRoute>
        <Suspense fallback={<PageLoader />}>
          <AdminLogin />
        </Suspense>
      </GuestRoute>
    ),
  },

  {
    path: "/register",
    element: (
      <GuestRoute>
        <Suspense fallback={<PageLoader />}>
          <Register />
        </Suspense>
      </GuestRoute>
    ),
  },

  {
    path: "/forgot-password",
    element: (
      <GuestRoute>
        <Suspense fallback={<PageLoader />}>
          <ForgotPassword />
        </Suspense>
      </GuestRoute>
    ),
  },

  {
    path: "/maintenance",
    element: (
      <Suspense fallback={<PageLoader />}>
        <Maintenance />
      </Suspense>
    ),
  },
]);  