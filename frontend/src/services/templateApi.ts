import axios from "axios";
import { API_BASE_URL , attachMaintenanceInterceptor } from "../config/api";

const api = axios.create({
  baseURL: API_BASE_URL,
});

attachMaintenanceInterceptor(api);

export type UploadTemplatePayload = {
  name: string;
  slug: string;
  description?: string | null;
  version?: string | null;
  status?: "draft" | "published" | "archived" | null;
  renewal_price?: number | null;
  is_featured?: boolean | null;
  thumbnail?: File | string | null;
  zip_file: File;
  plan_ids?: number[];
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
  is_featured?: boolean;
  template_path?: string;
  plans?: { id: number; name: string }[];
};

export async function uploadTemplate(payload: UploadTemplatePayload, token?: string | null) {
  const form = new FormData();

  form.append("name", payload.name);
  form.append("slug", payload.slug);
  if (payload.description) form.append("description", payload.description);
  if (payload.version) form.append("version", payload.version);
  if (payload.status) form.append("status", payload.status);
  if (payload.renewal_price != null) form.append("renewal_price", String(payload.renewal_price));
  if (payload.is_featured != null) form.append("is_featured", String(payload.is_featured));

  if (payload.thumbnail) form.append("thumbnail", payload.thumbnail);
  form.append("zip_file", payload.zip_file);
  
  if (payload.plan_ids && payload.plan_ids.length > 0) {
    payload.plan_ids.forEach((id) => {
      form.append("plan_ids[]", String(id));
    });
  }

  const res = await api.post("/admin/templates", form, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data as { data: TemplateResource } | TemplateResource;
}

export function getCachedTemplates() {
  return null;
}

export async function fetchTemplates(token?: string | null) {
  const res = await api.get("/templates", {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  try {
    sessionStorage.removeItem("cached_templates_data");
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

