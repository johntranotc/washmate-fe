import axiosClient from "./axiosClient"; // Sửa từ { axiosClient } thành axiosClient để chống crash màn hình trắng

const AUTH_KEYS = ["token", "accessToken", "refreshToken", "currentUser", "roles", "garageIds", "userEmail"];

function setAuthValue(key, value) {
  sessionStorage.setItem(key, value);
  localStorage.setItem(key, value);
}

function removeAuthValue(key) {
  sessionStorage.removeItem(key);
  localStorage.removeItem(key);
}

export const authApi = {
  // Luồng đăng nhập xử lý bất đồng bộ (async/await)
  login: async (payload) => {
    const response = await axiosClient.post("/auth/login", payload);

    if (response && response.token) {
      setAuthValue("token", response.token);
      setAuthValue("accessToken", response.token);
    } else if (response && response.accessToken) {
      setAuthValue("token", response.accessToken);
      setAuthValue("accessToken", response.accessToken);
    }
    if (response && response.refreshToken) {
      setAuthValue("refreshToken", response.refreshToken);
    }
    if (response && response.user) {
      setAuthValue("currentUser", JSON.stringify(response.user));
    }

    return response;
  },

  // Đăng nhập bằng Google ID Token
  loginWithGoogle: async (payload) => {
    const response = await axiosClient.post("/auth/google", payload);
    if (response && response.token) {
      setAuthValue("token", response.token);
      setAuthValue("accessToken", response.token);
    } else if (response && response.accessToken) {
      setAuthValue("token", response.accessToken);
      setAuthValue("accessToken", response.accessToken);
    }
    if (response && response.refreshToken) {
      setAuthValue("refreshToken", response.refreshToken);
    }
    if (response && response.user) {
      setAuthValue("currentUser", JSON.stringify(response.user));
      if (response.user.email) setAuthValue("userEmail", response.user.email);
    }
    return response;
  },

  // API Đăng ký tài khoản mới
  register: (payload) => axiosClient.post("/auth/register", payload),

  // Các API xử lý OTP và Quên mật khẩu
  requestOtp: (payload) => axiosClient.post("/auth/otp/request", { ...payload, emailOrPhone: payload?.identifier || payload?.emailOrPhone }),
  verifyOtp: async (payload) => {
    const reqPayload = { ...payload, emailOrPhone: payload?.identifier || payload?.emailOrPhone };
    const response = await axiosClient.post("/auth/otp/verify", reqPayload);
    if (response && response.accessToken) {
      setAuthValue("token", response.accessToken);
      setAuthValue("accessToken", response.accessToken);
    }
    if (response && response.refreshToken) {
      setAuthValue("refreshToken", response.refreshToken);
    }
    if (response && response.user) {
      setAuthValue("currentUser", JSON.stringify(response.user));
    }
    return response;
  },
  forgotPassword: (payload) => axiosClient.post("/auth/password/forgot", { ...payload, emailOrPhone: payload?.identifier || payload?.emailOrPhone }),
  resetPassword: (payload) => axiosClient.post("/auth/password/reset", payload),
  changePassword: (payload) => axiosClient.put("/auth/password/change", payload),

  // API làm mới session token khi hết hạn
  // BE yêu cầu body { refreshToken } (@NotBlank) cho refresh/logout.
  refresh: () => {
    const refreshToken = sessionStorage.getItem("refreshToken") || localStorage.getItem("refreshToken");
    return axiosClient.post("/auth/refresh", { refreshToken });
  },

  // Luồng đăng xuất: thu hồi refresh token trên máy chủ TRƯỚC rồi mới dọn storage
  // (dọn trước sẽ mất token, máy chủ không thu hồi được).
  logout: async () => {
    const refreshToken = sessionStorage.getItem("refreshToken") || localStorage.getItem("refreshToken");
    try {
      if (refreshToken) await axiosClient.post("/auth/logout", { refreshToken });
    } finally {
      AUTH_KEYS.forEach(removeAuthValue);
    }
  },
};
