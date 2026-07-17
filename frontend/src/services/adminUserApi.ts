import axios from "axios";
import { API_BASE_URL } from "../config/api";

const api = axios.create({
  baseURL: API_BASE_URL,
});

export type UserLandingPageInfo = {
  id: number;
  title: string;
  slug: string;
  status: string;
  created_at?: string | null;
  expires_at?: string | null;
};

export type UserResource = {
  id: number;
  name: string;
  email: string;
  status: "active" | "locked";
  balance?: number;
  landing_pages_count?: number;
  landing_page_limit?: number;
  custom_landing_page_limit?: number | null;
  role?: string;
  roles?: { name: string }[];
  created_at?: string;
  landing_pages?: UserLandingPageInfo[];
};

export async function fetchAdminUsers(token?: string | null) {
  const res = await api.get("/admin/users", {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  return res.data;
}

export async function updateUserRole(
  userId: number,
  role: "Admin" | "User",
  token?: string | null
) {
  const res = await api.put(
    `/admin/users/${userId}/role`,
    { role },
    {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }
  );
  return res.data;
}

export async function updateUserStatus(
  userId: number,
  status: "active" | "locked",
  token?: string | null
) {
  const res = await api.put(
    `/admin/users/${userId}/status`,
    { status },
    {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }
  );
  return res.data;
}

export async function updateUserBalance(
  userId: number,
  balance: number,
  token?: string | null
) {
  const res = await api.put(
    `/admin/users/${userId}/balance`,
    { balance },
    {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }
  );
  return res.data;
}

export async function updateUserLandingPageLimit(
  userId: number,
  limit: number | null,
  token?: string | null
) {
  const res = await api.put(
    `/admin/users/${userId}/landing-page-limit`,
    { landing_page_limit: limit },
    {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }
  );
  return res.data;
}

export async function deleteUser(userId: number, token?: string | null) {
  const res = await api.delete(`/admin/users/${userId}`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  return res.data;
}

export async function updateUserLandingPageDates(
  userId: number,
  landingPageId: number,
  data: { created_at?: string; expires_at?: string },
  token?: string | null
) {
  const res = await api.put(
    `/admin/users/${userId}/landing-pages/${landingPageId}/dates`,
    data,
    {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }
  );
  return res.data;
}
