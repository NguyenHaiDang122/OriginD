import { create } from "zustand";
import { loginApi, registerApi, setAuthToken } from "../services/authApi";

type AuthState = {
  token: string | null;
  user: unknown | null;
  loading: boolean;
  error: string | null;
  login: (payload: { email: string; password: string }) => Promise<void>;
  register: (payload: { name: string; email: string; password: string }) => Promise<void>;
  logout: () => void;
  hydrate: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  loading: false,
  error: null,
  hydrate: () => {
    const token = localStorage.getItem("token");
    const userRaw = localStorage.getItem("user");
    const user = userRaw ? JSON.parse(userRaw) : null;
    if (token) setAuthToken(token);
    set({ token, user });
  },
  login: async (payload) => {
    set({ loading: true, error: null });
    try {
      const data = await loginApi(payload);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setAuthToken(data.token);
      set({ token: data.token, user: data.user, loading: false, error: null });
    } catch (e: any) {
      set({
        loading: false,
        error: e?.response?.data?.message ?? e?.message ?? "Đăng nhập thất bại",
      });
    }
  },
  register: async (payload) => {
    set({ loading: true, error: null });
    try {
      const data = await registerApi(payload);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setAuthToken(data.token);
      set({ token: data.token, user: data.user, loading: false, error: null });
    } catch (e: any) {
      set({
        loading: false,
        error: e?.response?.data?.message ?? e?.message ?? "Đăng ký thất bại",
      });
    }
  },
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setAuthToken(null);
    set({ token: null, user: null });
  },
}));

