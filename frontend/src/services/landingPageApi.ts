import axios from "axios";
import { API_BASE_URL } from "../config/api";

const api = axios.create({
  baseURL: API_BASE_URL,
});

export type CreateLandingPagePayload = {
  title: string;
  slug?: string;
  data: Record<string, any>;
};

export async function createLandingPage(
  templateId: number,
  payload: CreateLandingPagePayload,
  token: string | null
) {
  const res = await api.post(`/templates/${templateId}/landing-pages`, payload, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  return res.data;
}

export async function fetchMyLandingPages(token: string | null) {
  const res = await api.get('/landing-pages', {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  return res.data;
}

export async function updateLandingPage(
  id: number,
  payload: { title?: string; slug?: string; data?: Record<string, any>; status?: string },
  token: string | null
) {
  const res = await api.put(`/landing-pages/${id}`, payload, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  return res.data;
}

export async function deleteLandingPage(id: number, token: string | null) {
  const res = await api.delete(`/landing-pages/${id}`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  return res.data;
}

