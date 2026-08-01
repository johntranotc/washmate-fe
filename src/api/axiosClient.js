import axios from "axios";

const apiRoot = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/$/, "") : "";
const baseURL = apiRoot.endsWith("/api") ? apiRoot : `${apiRoot}/api`;
const AUTH_KEYS = ["token", "accessToken", "refreshToken", "currentUser", "roles", "garageIds", "userEmail"];
const PUBLIC_AUTH_PATHS = [
  "/auth/login",
  "/auth/google",
  "/auth/register",
  "/auth/otp/",
  "/auth/password/forgot",
  "/auth/password/reset",
  "/auth/refresh",
  "/auth/logout",
];

let refreshPromise = null;

const axiosClient = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

function getStoredToken() {
  return (
    sessionStorage.getItem("accessToken") ||
    sessionStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("token")
  );
}

function getStoredRefreshToken() {
  return sessionStorage.getItem("refreshToken") || localStorage.getItem("refreshToken");
}

function setAuthValue(key, value) {
  sessionStorage.setItem(key, value);
  localStorage.setItem(key, value);
}

function clearAuthSession() {
  AUTH_KEYS.forEach((key) => {
    sessionStorage.removeItem(key);
    localStorage.removeItem(key);
  });
}

function redirectToLogin() {
  if (window.location.pathname !== "/dang-nhap") window.location.assign("/dang-nhap");
}

function extractPayload(body) {
  return body && typeof body === "object" && "success" in body ? body.data : body;
}

function normalizeApiError(error, fallbackMessage = "Không thể kết nối đến máy chủ.") {
  const body = error.response?.data;
  return {
    status: error.response?.status,
    errorCode: body?.errorCode || "UNKNOWN_ERROR",
    message:
      body?.message ||
      (error.code === "ECONNABORTED" ? "Máy chủ phản hồi quá lâu." : fallbackMessage),
    details: body?.details || null,
  };
}

function shouldTryRefresh(error) {
  const status = error.response?.status;
  const originalRequest = error.config || {};
  const reqUrl = originalRequest.url || "";

  if (status !== 401 || originalRequest._retry) return false;
  return !PUBLIC_AUTH_PATHS.some((path) => reqUrl.includes(path));
}

async function refreshAccessToken() {
  const refreshToken = getStoredRefreshToken();
  if (!refreshToken) throw new Error("Missing refresh token");

  const response = await axios.post(
    `${baseURL}/auth/refresh`,
    { refreshToken },
    { headers: { "Content-Type": "application/json" }, timeout: 15000 },
  );
  const payload = extractPayload(response.data);
  const accessToken = payload?.accessToken || payload?.token;

  if (!accessToken) throw new Error("Refresh response did not include an access token");

  setAuthValue("token", accessToken);
  setAuthValue("accessToken", accessToken);
  if (payload?.refreshToken) setAuthValue("refreshToken", payload.refreshToken);
  if (payload?.user) setAuthValue("currentUser", JSON.stringify(payload.user));

  return accessToken;
}

axiosClient.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

axiosClient.interceptors.response.use(
  (response) => {
    return extractPayload(response.data);
  },
  async (error) => {
    if (shouldTryRefresh(error)) {
      const originalRequest = error.config;
      originalRequest._retry = true;

      try {
        refreshPromise ||= refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
        const accessToken = await refreshPromise;
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return axiosClient(originalRequest);
      } catch (refreshError) {
        clearAuthSession();
        redirectToLogin();
        return Promise.reject(
          normalizeApiError(refreshError, "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."),
        );
      }
    }

    return Promise.reject(normalizeApiError(error));
  },
);

export default axiosClient;
