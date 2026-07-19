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

export type AdminStatistics = {
  revenue: {
    today: number;
    this_month: number;
    this_year: number;
  };
  stats: {
    total_users: number;
    total_admins: number;
    total_landing_pages: number;
  };
  chart_data: Array<{
    date: string;
    new_users: number;
    new_pages: number;
    revenue: number;
  }>;
};

export const fetchAdminStatistics = async () => {
  const response = await api.get<AdminStatistics>("/admin/statistics");
  return response.data;
};
