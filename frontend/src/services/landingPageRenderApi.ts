import axios from "axios";
import { API_BASE_URL } from "../config/api";

const api = axios.create({
  baseURL: API_BASE_URL,
});

export async function renderLandingPage(landingPageId: number, token?: string | null) {
  const res = await api.get(`/landing-pages/${landingPageId}/render`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  // BE trả về HTML text
  return res.data as string;
}

export async function previewTemplate(templateId: number, data: Record<string, any>, token?: string | null) {
  const res = await api.post(`/templates/${templateId}/preview`, { data }, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  return res.data as any;
}

