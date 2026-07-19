import axios from "axios";
import { API_BASE_URL } from "../config/api";
import { useAuthStore } from "../store/authStore";

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export type SupportSettings = {
  zalo?: string;
  facebook?: string;
  email?: string;
  videos?: Array<{
    id: number;
    title: string;
    description: string;
    link: string;
  }>;
};

export const getSupportSettings = async () => {
  const response = await api.get<{ data: SupportSettings }>("/settings/support");
  return response.data.data;
};

export const updateSupportSettings = async (data: SupportSettings) => {
  const response = await api.put<{ message: string; data: SupportSettings }>("/settings/support", data);
  return response.data;
};

export type PopupSettings = {
  isActive: boolean;
  title: string;
  content: string;
  hideDurationHours?: number;
};

export const getPopupSettings = async () => {
  const response = await api.get<{ data: PopupSettings }>("/settings/popup");
  return response.data.data;
};

export const updatePopupSettings = async (data: PopupSettings) => {
  const response = await api.put<{ message: string; data: PopupSettings }>("/admin/settings/popup", data);
  return response.data;
};
