const STORAGE_KEY = "washmate_user_role";

export const ROLES = {
  CUSTOMER: "CUSTOMER",
  STAFF: "STAFF",
  ADMIN: "ADMIN",
};

export function getCurrentRole() {
  return localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY) || null;
}

export function setCurrentRole(role) {
  localStorage.setItem(STORAGE_KEY, role);
}

export function clearCurrentRole() {
  localStorage.removeItem(STORAGE_KEY);
  sessionStorage.removeItem(STORAGE_KEY);
}
