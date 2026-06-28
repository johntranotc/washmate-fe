import { getCurrentUser } from "../utils/authUtils";

const STORAGE_KEY = "washmate_user_role"; // Kept for backward compatibility or future use if needed, but not used for main role check anymore.

export const ROLES = {
  CUSTOMER: "CUSTOMER",
  STAFF: "STAFF",
  ADMIN: "ADMIN",
};

export function getCurrentRole() {
  const user = getCurrentUser();
  // To avoid breaking the UI while waiting for BE, we fallback to uppercase of decoded role.
  if (user && user.role) {
    const role = String(user.role).toUpperCase();
    if (role === "ADMIN") return ROLES.ADMIN;
    if (role === "STAFF") return ROLES.STAFF;
    return ROLES.CUSTOMER;
  }
  
  // Fallback for testing while BE is not ready:
  return sessionStorage.getItem(STORAGE_KEY) || localStorage.getItem(STORAGE_KEY) || null;
}

export function setCurrentRole(role) {
  sessionStorage.setItem(STORAGE_KEY, role);
  localStorage.setItem(STORAGE_KEY, role);
}

export function clearCurrentRole() {
  localStorage.removeItem(STORAGE_KEY);
  sessionStorage.removeItem(STORAGE_KEY);
}
