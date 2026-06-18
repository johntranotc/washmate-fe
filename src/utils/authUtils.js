import { jwtDecode } from "jwt-decode";

export const getCurrentUser = () => {
    const token = localStorage.getItem("token");
    if (!token) return null;

    try {
        const decoded = jwtDecode(token);

        // Hoàng BE thường trả về tên trong field 'full_name', 'name' hoặc 'sub'
        // Logic này giúp lấy ra tên hiển thị, nếu không có sẽ fallback về "Lê Đạt"
        return {
            name: decoded.full_name || decoded.name || decoded.sub || "Lê Đạt",
            role: decoded.role,
        };
    } catch (error) {
        console.error("Lỗi giải mã token:", error);
        return null;
    }
};