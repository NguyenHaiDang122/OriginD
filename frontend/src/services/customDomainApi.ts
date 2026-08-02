import axios from "axios";
import { API_BASE_URL , attachMaintenanceInterceptor } from "../config/api";

const api = axios.create({
  baseURL: API_BASE_URL,
});

attachMaintenanceInterceptor(api);

export type CustomDomainItem = {
  id: number;
  landing_page_id: number;
  domain: string;
  status: string;
  created_at?: string;
  updated_at?: string;
  landing_page?: {
    id: number;
    title: string;
    slug: string;
    user?: {
      id: number;
      name: string;
      email: string;
    };
  };
};

export const fetchAdminCustomDomains = async (token: string): Promise<CustomDomainItem[]> => {
  const res = await api.get("/admin/custom-domains", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data?.data || res.data || [];
};

export const connectAdminCustomDomain = async (
  payload: { landing_page: string; domain: string },
  token: string
): Promise<any> => {
  const res = await api.post("/admin/custom-domains", payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const updateAdminCustomDomain = async (
  id: number,
  payload: { landing_page: string; domain: string },
  token: string
): Promise<any> => {
  const res = await api.put(`/admin/custom-domains/${id}`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const deleteAdminCustomDomain = async (id: number, token: string): Promise<any> => {
  const res = await api.delete(`/admin/custom-domains/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
