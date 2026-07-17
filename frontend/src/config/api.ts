export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (typeof window !== "undefined" &&
  window.location.hostname !== "localhost" &&
  window.location.hostname !== "127.0.0.1"
    ? `${window.location.origin}/api`
    : "http://localhost:8000/api");

export const PAGE_BASE_URL =
  import.meta.env.VITE_PAGE_BASE_URL ||
  (typeof window !== "undefined" &&
  window.location.hostname !== "localhost" &&
  window.location.hostname !== "127.0.0.1"
    ? `${window.location.origin}/page`
    : "http://localhost:8000/page");
