const roleDestinations = {
  CUSTOMER: "/customer/dashboard",
  STAFF: "/staff/queue",
  ADMIN: "/admin/dashboard",
  OWNER: "/admin/dashboard",
  MANAGER: "/admin/dashboard",
};

export function normalizeRoles(data) {
  const raw = data?.roles || data?.currentUser?.roles || data?.user?.roles || data?.authorities || [];
  return [...new Set((Array.isArray(raw) ? raw : [raw]).map((role) => String(role?.name || role?.authority || role).replace(/^ROLE_/, "").toUpperCase()))];
}

export function saveSession(data, fallbackUser = {}) {
  const currentUser = data?.currentUser || data?.user || fallbackUser;
  const roles = normalizeRoles(data);
  const garageIds = data?.garageIds || currentUser?.garageIds || [];
  if (data?.accessToken) {
    sessionStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("accessToken", data.accessToken);
  }
  if (data?.refreshToken) {
    sessionStorage.setItem("refreshToken", data.refreshToken);
    localStorage.setItem("refreshToken", data.refreshToken);
  }
  sessionStorage.setItem("currentUser", JSON.stringify(currentUser));
  localStorage.setItem("currentUser", JSON.stringify(currentUser));
  sessionStorage.setItem("roles", JSON.stringify(roles));
  localStorage.setItem("roles", JSON.stringify(roles));
  sessionStorage.setItem("garageIds", JSON.stringify(garageIds));
  localStorage.setItem("garageIds", JSON.stringify(garageIds));
  return { currentUser, roles, garageIds };
}

export function getStoredRoles() {
  try {
    return JSON.parse(sessionStorage.getItem("roles") || localStorage.getItem("roles") || "[]");
  } catch {
    return [];
  }
}

export function destinationForRole(role) {
  return roleDestinations[role] || "/";
}

export function clearSession() {
  ["token", "accessToken", "refreshToken", "currentUser", "roles", "garageIds", "userEmail"].forEach((key) => {
    sessionStorage.removeItem(key);
    localStorage.removeItem(key);
  });
}
