import { Link, Navigate } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import { getCurrentRole, homePathForRole } from "@/lib/auth-role";
import { getCurrentUser } from "@/utils/authUtils";

/**
 * Guard theo role cho từng cây route.
 * - `role="ADMIN"` (cũ) hoặc `roles={["ADMIN", "MANAGER", "OWNER"]}` (mới).
 * - Chưa đăng nhập → về trang đăng nhập.
 * - Đã đăng nhập nhưng sai quyền / role chưa hỗ trợ → màn "Không có quyền truy cập"
 *   (không đá về login gây hiểu nhầm là hết phiên).
 */
export function RequireRole({ role, roles, children }) {
  const allowed = roles || (role ? [role] : []);
  const currentRole = getCurrentRole();

  if (allowed.includes(currentRole)) return children;

  // Chưa có phiên đăng nhập thật → login
  if (!getCurrentUser()) {
    return <Navigate to="/dang-nhap" replace />;
  }

  const homePath = homePathForRole(currentRole);
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-card">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-warning-container text-warning">
          <ShieldAlert size={24} />
        </span>
        <h1 className="mt-4 text-lg font-bold text-foreground">Không có quyền truy cập</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {homePath
            ? "Tài khoản của bạn không có quyền xem khu vực này."
            : "Vai trò tài khoản chưa được hỗ trợ. Vui lòng liên hệ quản trị viên."}
        </p>
        <div className="mt-5 flex justify-center gap-2">
          {homePath && (
            <Link
              to={homePath}
              className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary/90"
            >
              Về trang chính
            </Link>
          )}
          <Link
            to="/dang-nhap"
            className="rounded-xl border border-border px-4 py-2 text-sm font-bold text-ink-soft hover:bg-surface"
          >
            Đăng nhập tài khoản khác
          </Link>
        </div>
      </div>
    </div>
  );
}
