import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, LogOut, User } from "lucide-react";
import { authApi } from "../../api/authApi";
import { getAuthItem } from "@/utils/authUtils";
import { userRoleLabel } from "@/lib/status-tones";

/**
 * AccountDropdown — dùng chung cho AdminLayout và StaffLayout.
 *
 * Props:
 *   profilePath  — đường dẫn trang profile (VD: "/quan-tri/profile" hoặc "/nhan-vien/profile")
 *   colorScheme  — "light" (admin, nền trắng) | "dark" (staff, nền slate-900)
 */
export default function AccountDropdown({ profilePath, colorScheme = "light" }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Đọc currentUser từ localStorage (đã lưu lúc login)
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(getAuthItem("currentUser") || "{}");
    } catch {
      return {};
    }
  });

  const displayName = user?.fullName || user?.name || "Người dùng";
  const email = user?.email || "";
  const roles = (() => {
    let r = [];
    try {
      const stored = JSON.parse(getAuthItem("roles"));
      if (Array.isArray(stored)) r = stored;
    } catch {}
    if (!r.length) {
      if (Array.isArray(user?.roles)) r = user.roles;
      else if (user?.role) r = [user.role];
    }
    return r;
  })();
  
  // Map enum role → tiếng Việt, không hiển thị enum thô trên UI
  const roleLabel = userRoleLabel(roles[0], "–");

  const avatarLetter = displayName.charAt(0).toUpperCase() || "U";

  // Đóng dropdown khi click ngoài
  useEffect(() => {
    function onClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  async function handleLogout() {
    setOpen(false);
    try {
      await authApi.logout();
    } catch {
      [
        "token", "accessToken", "refreshToken",
        "currentUser", "roles", "garageIds",
        "userEmail", "washmate_user_role",
      ].forEach((k) => {
        sessionStorage.removeItem(k);
        localStorage.removeItem(k);
      });
    }
    navigate("/dang-nhap");
  }

  function goToProfile() {
    setOpen(false);
    navigate(profilePath);
  }

  const isDark = colorScheme === "dark";

  return (
    <div className="relative" ref={ref}>
      {/* Avatar button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={[
          "flex items-center gap-2.5 rounded-full py-1.5 px-3 border transition-all duration-150 cursor-pointer select-none",
          isDark
            ? "border-ink-soft hover:bg-ink-soft text-white"
            : "border-border hover:bg-surface text-foreground",
          open ? (isDark ? "bg-ink-soft" : "bg-surface shadow-sm") : "",
        ].join(" ")}
      >
        {/* Avatar circle */}
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent-cyan text-sm font-bold text-white">
          {avatarLetter}
        </span>
        <span className="hidden sm:flex flex-col items-start max-w-[140px]">
          <span className="text-xs font-semibold leading-tight truncate">{displayName}</span>
          <span className={`text-xs leading-tight truncate ${isDark ? "text-neutral-muted" : "text-muted-foreground"}`}>
            {roleLabel}
          </span>
        </span>
        <ChevronDown
          size={14}
          className={[
            "transition-transform duration-200 shrink-0",
            isDark ? "text-neutral-muted" : "text-muted-foreground",
            open ? "rotate-180" : "",
          ].join(" ")}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-12 z-50 w-64 rounded-2xl border border-border bg-card shadow-floating">
          {/* User info header */}
          <div className="px-4 py-3 border-b border-border">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent-cyan text-base font-bold text-white">
                {avatarLetter}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-bold text-foreground truncate">{displayName}</p>
                {email && <p className="text-xs text-muted-foreground truncate">{email}</p>}
                <span className="mt-0.5 inline-block rounded-full bg-primary-container px-2 py-0.5 text-xs font-bold text-primary-strong">
                  {roleLabel}
                </span>
              </div>
            </div>
          </div>

          {/* Menu items */}
          <div className="p-1.5">
            <button
              type="button"
              onClick={goToProfile}
              className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-soft hover:bg-primary-container hover:text-primary-strong transition-colors"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-container text-primary">
                <User size={16} />
              </span>
              Thông tin tài khoản
            </button>

            <div className="my-1 h-px bg-muted" />

            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-critical hover:bg-critical-container transition-colors"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-critical-container text-critical">
                <LogOut size={16} />
              </span>
              Đăng xuất
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
