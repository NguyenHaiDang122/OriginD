import axios from "axios";
import { API_BASE_URL , attachMaintenanceInterceptor } from "../config/api";

const api = axios.create({
  baseURL: API_BASE_URL,
});

attachMaintenanceInterceptor(api);

export type DepositRecord = {
  id: number;
  user_id: number;
  amount: number | string;
  code: string;
  checkout_url?: string;
  sepay_fields?: Record<string, string>;
  status: "pending" | "approved" | "rejected";
  note?: string;
  created_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
    balance?: number | string;
  };
};

function getHeaders(token: string | null) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchDeposits(token: string | null) {
  const res = await api.get("/deposits", { headers: getHeaders(token) });
  const payload = res.data || {};
  const list = payload.data || payload.deposits || [];
  return {
    ...payload,
    data: list,
    deposits: list,
    balance: payload.balance ?? 0,
  } as { data: DepositRecord[]; deposits: DepositRecord[]; balance: number | string };
}

export async function createDeposit(token: string | null, payload: { amount: number; note?: string }) {
  const res = await api.post("/deposits", payload, { headers: getHeaders(token) });
  return res.data as { message: string; data: DepositRecord };
}

export async function renewService(token: string | null, landing_page_id?: number, months: number = 1) {
  const payload: Record<string, any> = { months };
  if (landing_page_id) {
    payload.landing_page_id = landing_page_id;
  }
  const res = await api.post("/deposits/renew", payload, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  return res.data as { message: string; balance: number | string };
}

export async function checkSepayDeposit(token: string | null, depositId: number) {
  const res = await api.get(`/deposits/${depositId}/check-sepay`, { headers: getHeaders(token) });
  return res.data as { status: string; message: string; balance?: number | string };
}

export async function fetchAdminDeposits(token: string | null) {
  const res = await api.get("/admin/deposits", { headers: getHeaders(token) });
  return res.data as { data: DepositRecord[] };
}

export async function approveAdminDeposit(token: string | null, depositId: number) {
  const res = await api.post(`/admin/deposits/${depositId}/approve`, {}, { headers: getHeaders(token) });
  return res.data as { message: string; data: DepositRecord };
}

export async function rejectAdminDeposit(token: string | null, depositId: number) {
  const res = await api.post(`/admin/deposits/${depositId}/reject`, {}, { headers: getHeaders(token) });
  return res.data as { message: string; data: DepositRecord };
}
