import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api",
});

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
};

export async function loginApi(payload: LoginPayload) {
  const res = await api.post("/login", payload);
  return res.data as { token: string; user: unknown };
}

export async function registerApi(payload: RegisterPayload) {
  const res = await api.post("/register", payload);
  return res.data as { token: string; user: unknown };
}

export function setAuthToken(token: string | null) {
  if (!token) {
    delete api.defaults.headers.common.Authorization;
    return;
  }
  api.defaults.headers.common.Authorization = `Bearer ${token}`;
}

