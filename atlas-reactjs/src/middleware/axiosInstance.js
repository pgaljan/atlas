import axios from "axios";
import Cookies from "js-cookie";
import store from "../redux/store";
import { logout } from "../redux/slices/auth";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {},
});

axiosInstance.interceptors.request.use(async (config) => {
  const token = Cookies.get("atlas_access_token");
  const projectId = Cookies.get("atlas_projectId");

  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }

  if (projectId) {
    config.headers["Project-ID"] = projectId;
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
  ];

  keysToRemove.forEach((key) => Cookies.remove(key));
  window.location.href = "/";
};

const isTokenValid = async () => {
  const token = Cookies.get("atlas_access_token");
  if (!token) {
    return false;
  }

  try {
    const token = Cookies.get("atlas_access_token");
    return true;
  } catch (error) {
    return false;
  }
};

export { isTokenValid };
export default axiosInstance;
