import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api",
});

export type UploadTemplatePayload = {
  name: string;
  slug: string;
  description?: string | null;
  version?: string | null;
  status?: "draft" | "published" | "archived" | null;
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
  template_path?: string;
};

export async function uploadTemplate(payload: UploadTemplatePayload, token?: string | null) {
  const form = new FormData();

  form.append("name", payload.name);
  form.append("slug", payload.slug);
  if (payload.description) form.append("description", payload.description);
  if (payload.version) form.append("version", payload.version);
  if (payload.status) form.append("status", payload.status);

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

export async function fetchTemplates(token?: string | null) {
  const res = await api.get("/templates", {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

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

