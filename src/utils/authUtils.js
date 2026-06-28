import { jwtDecode } from "jwt-decode";

export const getCurrentUser = () => {
    const token = localStorage.getItem("token");
    if (!token) return null;

    try {
        const decoded = jwtDecode(token);
        let currentUser = null;
        try {
            const stored = localStorage.getItem("currentUser");
            if (stored) currentUser = JSON.parse(stored);
        } catch (e) {
            console.error("Lỗi parse currentUser:", e);
        }

        // Lấy role từ currentUser (ưu tiên) hoặc từ token
        let extractedRole = "CUSTOMER";
        const roles = currentUser?.roles || decoded.roles;
        const roleStr = currentUser?.role || decoded.role;

        if (roles && Array.isArray(roles) && roles.length > 0) {
            extractedRole = roles[0];
        } else if (roleStr) {
            extractedRole = roleStr;
        }

        const garageIds = currentUser?.garageIds || decoded.garageIds || [];

        return {
            name: currentUser?.name || currentUser?.full_name || decoded.full_name || decoded.name || decoded.sub || "Người dùng",
            role: extractedRole,
            garageIds: garageIds,
        };
    } catch (error) {
        console.error("Lỗi giải mã token:", error);
        return null;
    }
};