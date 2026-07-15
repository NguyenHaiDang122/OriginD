import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api",
});

export type UserResource = {
  id: number;
  name: string;
  email: string;
  status: "active" | "locked";
  role?: string;
  roles?: { name: string }[];
  created_at?: string;
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

export async function deleteUser(userId: number, token?: string | null) {
  const res = await api.delete(`/admin/users/${userId}`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  return res.data;
}
