import { jwtDecode } from "jwt-decode";

export const getAuthItem = (key) =>
    sessionStorage.getItem(key) || localStorage.getItem(key);

/**
 * Tên hiển thị từ phiên đăng nhập thật — dùng chung cho mọi portal.
 * Ưu tiên currentUser (MeResponse.fullName) → tên trong token → email rút gọn → fallback.
 */
export const getDisplayName = (fallback = "Người dùng") => {
    try {
        const stored = JSON.parse(getAuthItem("currentUser") || "null");
        const full = stored?.fullName || stored?.full_name || stored?.name;
        if (typeof full === "string" && full.trim() && Number.isNaN(Number(full))) return full;
    } catch { /* dùng token bên dưới */ }

    const name = getCurrentUser()?.name;
    if (typeof name === "string" && name.trim() && name !== "Người dùng") {
        if (name.includes("@")) return name.split("@")[0];
        if (Number.isNaN(Number(name))) return name;
    }
    return fallback;
};

export const getCurrentUser = () => {
    const token = getAuthItem("token") || getAuthItem("accessToken");
    if (!token) return null;

    try {
        const decoded = jwtDecode(token);
        let currentUser = null;
        try {
            const stored = getAuthItem("currentUser");
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
