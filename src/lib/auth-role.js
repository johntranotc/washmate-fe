import { getCurrentUser } from "../utils/authUtils";

export const ROLES = {
  CUSTOMER: "CUSTOMER",
  STAFF: "STAFF",
  ADMIN: "ADMIN",
  MANAGER: "MANAGER",
  OWNER: "OWNER",
};

// Nhóm role được phép vào từng portal — MANAGER/OWNER dùng Admin Portal
// (BE xếp OWNER/MANAGER vào nhóm quản trị trong ROLE_PRIORITY của MeResponse).
export const ADMIN_PORTAL_ROLES = [ROLES.ADMIN, ROLES.OWNER, ROLES.MANAGER];
export const STAFF_PORTAL_ROLES = [ROLES.STAFF];
export const CUSTOMER_PORTAL_ROLES = [ROLES.CUSTOMER];

/**
 * Role hiện tại lấy DUY NHẤT từ session đăng nhập thật (JWT/currentUser).
 * Trả về null khi chưa đăng nhập hoặc role không nằm trong danh sách hỗ trợ —
 * không còn fallback localStorage (backdoor test cũ đã gỡ).
 */
export function getCurrentRole() {
  const user = getCurrentUser();
  if (!user?.role) return null;
  const role = String(user.role).toUpperCase();
  return ROLES[role] || null;
}

/** Trang chủ tương ứng với role sau đăng nhập; null nếu role chưa được hỗ trợ. */
export function homePathForRole(role) {
  if (ADMIN_PORTAL_ROLES.includes(role)) return "/quan-tri";
  if (STAFF_PORTAL_ROLES.includes(role)) return "/nhan-vien";
  if (CUSTOMER_PORTAL_ROLES.includes(role)) return "/khach-hang";
  return null;
}
