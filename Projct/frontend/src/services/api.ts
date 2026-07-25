import axios from "axios";
import { API_BASE_URL } from "@/utils/constants";

/**
 * Central Axios instance pre-configured with the base URL and default headers.
 *
 * Interceptors attach the auth token automatically and handle 401 responses
 * by redirecting to the login page.
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ── Request interceptor: attach auth token ────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response interceptor: handle 401 and global errors ─────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("access_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default api;
