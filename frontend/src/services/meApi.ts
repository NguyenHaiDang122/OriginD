import axios from "axios";
import { API_BASE_URL , attachMaintenanceInterceptor } from "../config/api";

const api = axios.create({
  baseURL: API_BASE_URL,
});

attachMaintenanceInterceptor(api);

export type MeResponse = {
  user?: any;
  token?: string;
  roles?: any;
  data?: any;
};

export async function fetchMe(token: string | null): Promise<MeResponse> {
  if (!token) throw new Error("No token");

  const res = await api.get("/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data as MeResponse;
}

