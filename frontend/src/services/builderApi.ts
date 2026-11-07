import axios from "axios";
import { API_BASE_URL, attachMaintenanceInterceptor } from "../config/api";
import type { BuilderSite, BuilderElement, BuilderSiteSettings } from "../types/builder";

const api = axios.create({
  baseURL: API_BASE_URL,
});

attachMaintenanceInterceptor(api);

const authHeader = (token: string | null) => ({
  headers: {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  },
});

export async function fetchBuilderSites(token: string | null): Promise<BuilderSite[]> {
  const res = await api.get('/builder-sites', authHeader(token));
  return res.data.data;
}

export async function createBuilderSite(
  payload: {
    title: string;
    slug?: string;
    data?: BuilderElement[];
    settings?: BuilderSiteSettings;
  },
  token: string | null
): Promise<BuilderSite> {
  const res = await api.post('/builder-sites', payload, authHeader(token));
  return res.data.data;
}

export async function fetchBuilderSite(id: number | string, token: string | null): Promise<BuilderSite> {
  const res = await api.get(`/builder-sites/${id}`, authHeader(token));
  return res.data.data;
}

export async function updateBuilderSite(
  id: number | string,
  payload: {
    title?: string;
    slug?: string;
    data?: BuilderElement[];
    settings?: BuilderSiteSettings;
    status?: 'draft' | 'published';
    thumbnail?: string;
  },
  token: string | null
): Promise<BuilderSite> {
  const res = await api.put(`/builder-sites/${id}`, payload, authHeader(token));
  return res.data.data;
}

export async function deleteBuilderSite(id: number | string, token: string | null): Promise<void> {
  await api.delete(`/builder-sites/${id}`, authHeader(token));
}

export async function publishBuilderSite(
  id: number | string,
  payload: { slug?: string; data?: BuilderElement[] },
  token: string | null
): Promise<BuilderSite> {
  const res = await api.post(`/builder-sites/${id}/publish`, payload, authHeader(token));
  return res.data.data;
}

export async function unpublishBuilderSite(id: number | string, token: string | null): Promise<BuilderSite> {
  const res = await api.post(`/builder-sites/${id}/unpublish`, {}, authHeader(token));
  return res.data.data;
}

export async function duplicateBuilderSite(id: number | string, token: string | null): Promise<BuilderSite> {
  const res = await api.post(`/builder-sites/${id}/duplicate`, {}, authHeader(token));
  return res.data.data;
}

export async function fetchPublicSite(slug: string, token?: string | null): Promise<BuilderSite> {
  const res = await api.get(`/builder-sites/public/${slug}`, authHeader(token || null));
  return res.data.data;
}
