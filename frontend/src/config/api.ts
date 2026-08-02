export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (typeof window !== "undefined" &&
  window.location.hostname !== "localhost" &&
  window.location.hostname !== "127.0.0.1"
    ? `${window.location.origin}/api`
    : "http://127.0.0.1:8000/api");

export const PAGE_BASE_URL =
  import.meta.env.VITE_PAGE_BASE_URL ||
  (typeof window !== "undefined" &&
  window.location.hostname !== "localhost" &&
  window.location.hostname !== "127.0.0.1"
    ? `${window.location.origin}/page`
    : "http://127.0.0.1:8000/page");

export const attachMaintenanceInterceptor = (apiInstance: any) => {
  apiInstance.interceptors.response.use(
    (response: any) => response,
    (error: any) => {
      if (
        error.response &&
        error.response.status === 503 &&
        error.response.data?.maintenance === true
      ) {
        const message = error.response.data?.message || "";
        if (typeof window !== "undefined") {
          sessionStorage.setItem("maintenance_message", message);
          if (window.location.pathname !== "/maintenance") {
            window.location.href = "/maintenance";
          }
        }
      }
      return Promise.reject(error);
    }
  );
};
