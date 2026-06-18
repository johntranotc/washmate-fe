import axiosClient from "./axiosClient"; // Sửa từ { axiosClient } thành axiosClient để chống crash màn hình trắng

export const authApi = {
  // Luồng đăng nhập xử lý bất đồng bộ (async/await)
  login: async (payload) => {
    const response = await axiosClient.post("/auth/login", payload);

    // Kiểm tra cấu hình trả về từ API của Hoàng để tự động lưu token vào localStorage
    if (response && response.token) {
      localStorage.setItem("token", response.token);
    } else if (response && response.accessToken) {
      localStorage.setItem("token", response.accessToken);
    }

    return response;
  },

  // API Đăng ký tài khoản mới
  register: (payload) => axiosClient.post("/auth/register", payload),

  // API làm mới session token khi hết hạn
  refresh: () => axiosClient.post("/auth/refresh"),

  // Luồng đăng xuất dọn dẹp sạch token cũ tránh lưu đè tên tài khoản cũ
  logout: () => {
    localStorage.removeItem("token");
    return axiosClient.post("/auth/logout");
  },
};