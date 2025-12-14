import axios from "axios";

// Determine API base URL based on environment
const isDev = import.meta.env.DEV;
const API_BASE_URL = isDev
  ? import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api"
  : import.meta.env.VITE_API_BASE_URL || "/api";

console.log(`[API] Environment: ${isDev ? "development" : "production"}`);
console.log(`[API] Base URL: ${API_BASE_URL}`);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Include cookies for CORS
});

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Redirect to login if not already there
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    // Handle other errors
    if (error.response?.status === 403) {
      console.error("[API] Access forbidden (403)");
    }

    if (error.response?.status === 500) {
      console.error("[API] Server error (500)");
    }

    return Promise.reject(error);
  }
);

export default api;
