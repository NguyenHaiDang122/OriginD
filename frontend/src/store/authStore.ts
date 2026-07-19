import { create } from "zustand";
import { loginApi, registerApi, googleLoginApi, sendRegisterOtpApi, verifyRegisterOtpApi, setAuthToken } from "../services/authApi";

type AuthState = {
  token: string | null;
  user: unknown | null;
  loading: boolean;
  error: string | null;
  login: (payload: { email: string; password: string }) => Promise<void>;
  register: (payload: { name: string; email: string; password: string }) => Promise<void>;
  sendOtp: (payload: any) => Promise<string>;
  verifyOtpAndRegister: (payload: any) => Promise<void>;
  googleLogin: (credential: string) => Promise<void>;
  logout: () => void;
  hydrate: () => void;
  setUser: (user: any) => void;
  updateBalance: (newBal: number) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  loading: false,
  error: null,
  setUser: (user) => {
    localStorage.setItem("user", JSON.stringify(user));
    set({ user });
  },
  updateBalance: (newBal) => {
    set((state) => {
      if (!state.user) return state;
      const updatedUser = { ...(state.user as any), balance: newBal };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      return { user: updatedUser };
    });
  },
  hydrate: () => {
    const token = localStorage.getItem("token");
    const userRaw = localStorage.getItem("user");
    const user = userRaw ? JSON.parse(userRaw) : null;
    if (token) {
      setAuthToken(token);
      document.cookie = `auth_token=${token}; path=/; max-age=864000; SameSite=Lax`;
    }
    set({ token, user });
  },
  login: async (payload) => {
    set({ loading: true, error: null });
    try {
      const data = await loginApi(payload);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      document.cookie = `auth_token=${data.token}; path=/; max-age=864000; SameSite=Lax`;
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
      document.cookie = `auth_token=${data.token}; path=/; max-age=864000; SameSite=Lax`;
      setAuthToken(data.token);
      set({ token: data.token, user: data.user, loading: false, error: null });
    } catch (e: any) {
      set({
        loading: false,
        error: e?.response?.data?.message ?? e?.message ?? "Đăng ký thất bại",
      });
    }
  },
  sendOtp: async (payload) => {
    set({ loading: true, error: null });
    try {
      const data = await sendRegisterOtpApi(payload);
      set({ loading: false, error: null });
      return data.message;
    } catch (e: any) {
      const errMsg = e?.response?.data?.message ?? e?.message ?? "Gửi mã OTP thất bại";
      set({ loading: false, error: errMsg });
      throw new Error(errMsg);
    }
  },
  verifyOtpAndRegister: async (payload) => {
    set({ loading: true, error: null });
    try {
      const data = await verifyRegisterOtpApi(payload);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      document.cookie = `auth_token=${data.token}; path=/; max-age=864000; SameSite=Lax`;
      setAuthToken(data.token);
      set({ token: data.token, user: data.user, loading: false, error: null });
    } catch (e: any) {
      const errMsg = e?.response?.data?.message ?? e?.message ?? "Xác thực OTP thất bại";
      set({ loading: false, error: errMsg });
      throw new Error(errMsg);
    }
  },
  googleLogin: async (credential) => {
    set({ loading: true, error: null });
    try {
      const data = await googleLoginApi(credential);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      document.cookie = `auth_token=${data.token}; path=/; max-age=864000; SameSite=Lax`;
      setAuthToken(data.token);
      set({ token: data.token, user: data.user, loading: false, error: null });
    } catch (e: any) {
      set({
        loading: false,
        error: e?.response?.data?.message ?? e?.message ?? "Đăng nhập bằng Google thất bại",
      });
    }
  },
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    document.cookie = `auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    setAuthToken(null);
    set({ token: null, user: null });
  },
}));

