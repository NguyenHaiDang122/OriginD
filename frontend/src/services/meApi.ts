import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api",
});

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

