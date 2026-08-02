import axios from "axios";
import { API_BASE_URL , attachMaintenanceInterceptor } from "../config/api";

export async function uploadImage(file: File, token: string): Promise<{ success: boolean; url?: string; message?: string }> {
  const formData = new FormData();
  formData.append("image", file);

  try {
    const res = await axios.post(`${API_BASE_URL}/upload-image`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
        "Accept": "application/json",
      },
    });
    return res.data;
  } catch (error: any) {
    console.error("Upload Error:", error);
    if (error.response) {
      const data = error.response.data;
      console.error("Response data:", data);
      
      // Lấy thông báo lỗi một cách linh hoạt (Laravel có thể ném ra errors object hoặc message)
      let msg = "";
      if (typeof data === "string") {
        msg = "Lỗi máy chủ (HTML Response). Status: " + error.response.status;
      } else if (data.message) {
        msg = data.message;
        if (data.errors && typeof data.errors === "object") {
           const firstError = Object.values(data.errors)[0];
           if (Array.isArray(firstError)) msg += " - " + firstError[0];
        }
      }
      
      throw new Error(msg || "Lỗi tải ảnh lên. Vui lòng thử lại.");
    }
    throw new Error(error.message || "Lỗi mạng hoặc CORS.");
  }
}
