import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api",
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
  return res.data as string;
}

