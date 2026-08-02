import axios from "axios";
import { API_BASE_URL , attachMaintenanceInterceptor } from "../config/api";

const api = axios.create({
  baseURL: API_BASE_URL,
});

attachMaintenanceInterceptor(api);

export type PlanResource = {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  price: number;
  duration_days: number;
  landing_page_limit: number;
  custom_domain: boolean;
  premium_templates: boolean;
  is_popular?: boolean;
  is_hidden?: boolean;
};

export type PlanPayload = {
  name: string;
  slug: string;
  description?: string | null;
  price: number;
  duration_days: number;
  landing_page_limit: number;
  custom_domain: boolean;
  premium_templates: boolean;
  is_popular?: boolean;
  is_hidden?: boolean;
};

export async function fetchPlans(token?: string | null): Promise<PlanResource[]> {
  const res = await api.get("/plans", {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  const data = res.data?.data ?? res.data;
  return Array.isArray(data) ? data : [];
}

export async function upgradeSubscription(token: string, planId: number) {
  const res = await api.post(
    "/subscription/upgrade",
    { plan_id: planId },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return res.data;
}

export async function createAdminPlan(token: string, payload: PlanPayload) {
  const res = await api.post("/admin/plans", payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data?.data ?? res.data;
}

export async function updateAdminPlan(token: string, planId: number, payload: Partial<PlanPayload>) {
  const res = await api.put(`/admin/plans/${planId}`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data?.data ?? res.data;
}

export async function deleteAdminPlan(token: string, planId: number) {
  const res = await api.delete(`/admin/plans/${planId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}
