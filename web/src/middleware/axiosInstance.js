
import axios from "axios";
import Cookies from "js-cookie";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {},
});

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

export const handleLogout = async () => {
  const keysToRemove = [
    "atlas_access_token",
    "atlas_userId",
    "atlas_username",
    "atlas_email",
    "atlas_admin_token",
    "workspaceId",
  ];

  keysToRemove.forEach((key) => Cookies.remove(key));
  window.location.href = "/";
};

export const isTokenValid = async () => {
  const token = Cookies.get("atlas_access_token");
  return !!token;
};

export const isAdminTokenValid = async () => {
  const token = Cookies.get("atlas_admin_token");
  return !!token;
};

export default axiosInstance;
