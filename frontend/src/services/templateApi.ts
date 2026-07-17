import axios from "axios";
import { API_BASE_URL } from "../config/api";

const api = axios.create({
  baseURL: API_BASE_URL,
});

export type UploadTemplatePayload = {
  name: string;
  slug: string;
  description?: string | null;
  version?: string | null;
  status?: "draft" | "published" | "archived" | null;
  renewal_price?: number | null;
  thumbnail?: File | null;
  zip_file: File;
};

export type TemplateResource = {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  thumbnail?: string | null;
  version?: string;
  status?: string;
  renewal_price?: number;
  template_path?: string;
};

export async function uploadTemplate(payload: UploadTemplatePayload, token?: string | null) {
  const form = new FormData();

  form.append("name", payload.name);
  form.append("slug", payload.slug);
  if (payload.description) form.append("description", payload.description);
  if (payload.version) form.append("version", payload.version);
  if (payload.status) form.append("status", payload.status);
  if (payload.renewal_price != null) form.append("renewal_price", String(payload.renewal_price));

  if (payload.thumbnail) form.append("thumbnail", payload.thumbnail);
  form.append("zip_file", payload.zip_file);

  const res = await api.post("/admin/templates", form, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data as { data: TemplateResource } | TemplateResource;
}

let cachedTemplates: any = null;

export function getCachedTemplates() {
  if (cachedTemplates) return cachedTemplates;
  try {
    const raw = sessionStorage.getItem("cached_templates_data");
    if (raw) {
      cachedTemplates = JSON.parse(raw);
      return cachedTemplates;
    }
  } catch (e) {}
  return null;
}

export async function fetchTemplates(token?: string | null) {
  const res = await api.get("/templates", {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  cachedTemplates = res.data;
  try {
    sessionStorage.setItem("cached_templates_data", JSON.stringify(res.data));
  } catch (e) {}

  return res.data;
}

export async function fetchAdminTemplates(token?: string | null) {
  const res = await api.get("/admin/templates", {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  return res.data;
}

export async function updateTemplate(
  id: number,
  payload: Partial<TemplateResource> | FormData,
  token?: string | null
) {
  const isFormData = payload instanceof FormData;
  if (isFormData && !payload.has("_method")) {
    payload.append("_method", "PUT");
  }

  const res = await (isFormData
    ? api.post(`/admin/templates/${id}`, payload, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          "Content-Type": "multipart/form-data",
        },
      })
    : api.put(`/admin/templates/${id}`, payload, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      }));

  return res.data;
}

export async function deleteTemplate(id: number, token?: string | null) {
  const res = await api.delete(`/admin/templates/${id}`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  return res.data;
}

