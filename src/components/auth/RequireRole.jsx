import { Navigate } from "react-router-dom";
import { getCurrentRole } from "@/lib/auth-role";

export function RequireRole({ role, children }) {
  const currentRole = getCurrentRole();

  if (currentRole !== role) {
    return <Navigate to="/chon-khong-gian-lam-viec" replace />;
  }

  return children;
}
