import axios from "axios";
import Cookies from "js-cookie";

// Create Axios instance
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {},
});

// Add interceptor for requests
axiosInstance.interceptors.request.use(async (config) => {
  const token = Cookies.get("atlas_access_token");

  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }

  if (config.data instanceof FormData) {
    config.headers["Content-Type"] = "multipart/form-data";
  } else {
    config.headers["Content-Type"] = "application/json";
  }

  return config;
});

// Logout helper function
export const handleLogout = async () => {
  const keysToRemove = [
    "atlas_access_token",
    "atlas_userId",
    "atlas_username",
    "atlas_email",
  ];

  keysToRemove.forEach((key) => Cookies.remove(key));
  window.location.href = "/";
};

// Token validation helper
export const isTokenValid = async () => {
  const token = Cookies.get("atlas_access_token");
  if (!token) {
    return false;
  }

  try {
    // Token validation logic if required
    return true;
  } catch (error) {
    return false;
  }
};

export default axiosInstance;
