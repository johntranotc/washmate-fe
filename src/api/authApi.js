import axiosClient from "./axiosClient"; // Sửa từ { axiosClient } thành axiosClient để chống crash màn hình trắng

export const authApi = {
  // Luồng đăng nhập xử lý bất đồng bộ (async/await)
  login: async (payload) => {
    const response = await axiosClient.post("/auth/login", payload);

    if (response && response.token) {
      localStorage.setItem("token", response.token);
      localStorage.setItem("accessToken", response.token);
    } else if (response && response.accessToken) {
      localStorage.setItem("token", response.accessToken);
      localStorage.setItem("accessToken", response.accessToken);
    }
    if (response && response.refreshToken) {
      localStorage.setItem("refreshToken", response.refreshToken);
    }
    if (response && response.user) {
      localStorage.setItem("currentUser", JSON.stringify(response.user));
    }

    return response;
  },

  // Đăng nhập bằng Google ID Token
  loginWithGoogle: async (payload) => {
    const response = await axiosClient.post("/auth/google", payload);
    if (response && response.token) {
      localStorage.setItem("token", response.token);
      localStorage.setItem("accessToken", response.token);
    } else if (response && response.accessToken) {
      localStorage.setItem("token", response.accessToken);
      localStorage.setItem("accessToken", response.accessToken);
    }
    if (response && response.refreshToken) {
      localStorage.setItem("refreshToken", response.refreshToken);
    }
    if (response && response.user) {
      localStorage.setItem("currentUser", JSON.stringify(response.user));
      if (response.user.email) localStorage.setItem("userEmail", response.user.email);
    }
    return response;
  },

  // API Đăng ký tài khoản mới
  register: (payload) => axiosClient.post("/auth/register", payload),

  // Các API xử lý OTP và Quên mật khẩu
  requestOtp: (payload) => axiosClient.post("/auth/otp/request", payload),
  verifyOtp: async (payload) => {
    const response = await axiosClient.post("/auth/otp/verify", payload);
    if (response && response.accessToken) {
      localStorage.setItem("token", response.accessToken);
      localStorage.setItem("accessToken", response.accessToken);
    }
    if (response && response.refreshToken) {
      localStorage.setItem("refreshToken", response.refreshToken);
    }
    if (response && response.user) {
      localStorage.setItem("currentUser", JSON.stringify(response.user));
    }
    return response;
  },
  forgotPassword: (payload) => axiosClient.post("/auth/password/forgot", payload),
  resetPassword: (payload) => axiosClient.post("/auth/password/reset", payload),
  changePassword: (payload) => axiosClient.put("/auth/password/change", payload),

  // API làm mới session token khi hết hạn
  refresh: () => axiosClient.post("/auth/refresh"),

  // Luồng đăng xuất dọn dẹp sạch token cũ tránh lưu đè tên tài khoản cũ
  logout: () => {
    ["token", "accessToken", "refreshToken", "currentUser", "roles", "garageIds", "userEmail"].forEach((key) =>
      localStorage.removeItem(key)
    );
    return axiosClient.post("/auth/logout");
  },
};