import axios from "axios";
import Cookies from "js-cookie";
import store from "../redux/store";
import { logout } from "../redux/slices/auth";

const axiosInstance = axios.create({
  baseURL:
    typeof process !== "undefined"
      ? process.env.REACT_APP_API_URL
      : "http://localhost:4001/",
  headers: {},
});

axiosInstance.interceptors.request.use(async (config) => {
  const token = Cookies.get("atlas_token");
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

let refreshingPromise = null;

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (!refreshingPromise) {
        refreshingPromise = refreshToken();
      }

      return refreshingPromise
        .then(() => {
          originalRequest._retry = true;
          originalRequest.headers["Authorization"] = `Bearer ${Cookies.get(
            "atlas_token"
          )}`;
          return axios(originalRequest);
        })
        .catch((refreshError) => {
          handleLogout();
          store.dispatch(logout());
          return Promise.reject(refreshError);
        })
        .finally(() => {
          refreshingPromise = null;
        });
    }

    return Promise.reject(error);
  }
);

const refreshToken = async () => {
  try {
    const refreshToken = Cookies.get("refreshToken");
    const response = await axios.post(
      `${process.env.REACT_APP_API_URL}/auth/refresh-token`,
      { refresh_token: refreshToken }
    );

    Cookies.set("atlas_token", response.data.accessToken);
    return Promise.resolve();
  } catch (error) {
    return Promise.reject(error);
  }
};

export const handleLogout = async () => {
  const keysToRemove = [
    "atlas_token",
    "atlas_projectId",
    "refreshToken",
    "atlas_userId",
    "atlas_role",
  ];

  keysToRemove.forEach((key) => Cookies.remove(key));
  store.dispatch(logout());
  window.location.href = "/";
};

const isTokenValid = async () => {
  const token = Cookies.get("atlas_token");
  if (!token) {
    return false;
  }

  try {
    await axiosInstance.get("/auth/validate-token");
    return true;
  } catch (error) {
    return false;
  }
};

export { isTokenValid };
export default axiosInstance;
