import axios from "axios";
import { API_BASE_URL } from "../config/api";

const api = axios.create({
  baseURL: API_BASE_URL,
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

export async function sendRegisterOtpApi(payload: RegisterPayload & { password_confirmation?: string }) {
  const res = await api.post("/register-send-otp", payload);
  return res.data as { message: string; email: string };
}

export async function verifyRegisterOtpApi(payload: RegisterPayload & { otp: string; password_confirmation?: string }) {
  const res = await api.post("/register-verify-otp", payload);
  return res.data as { token: string; user: unknown };
}

export async function googleLoginApi(credential: string) {
  const res = await api.post("/google-login", { credential });
  return res.data as { token: string; user: unknown };
}

export function setAuthToken(token: string | null) {
  if (!token) {
    delete api.defaults.headers.common.Authorization;
    return;
  }
  api.defaults.headers.common.Authorization = `Bearer ${token}`;
}

