import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, LogOut, User } from "lucide-react";
import { authApi } from "../../api/authApi";
import { getAuthItem } from "@/utils/authUtils";

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
  
  const roleLabel = roles[0] || "–";

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
            ? "border-slate-700 hover:bg-slate-800 text-white"
            : "border-slate-200 hover:bg-slate-50 text-slate-800",
          open ? (isDark ? "bg-slate-800" : "bg-slate-50 shadow-sm") : "",
        ].join(" ")}
      >
        {/* Avatar circle */}
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 text-sm font-bold text-white shadow">
          {avatarLetter}
        </span>
        <span className="hidden sm:flex flex-col items-start max-w-[140px]">
          <span className="text-xs font-semibold leading-tight truncate">{displayName}</span>
          <span className={`text-[10px] leading-tight truncate ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            {roleLabel}
          </span>
        </span>
        <ChevronDown
          size={14}
          className={[
            "transition-transform duration-200 shrink-0",
            isDark ? "text-slate-400" : "text-slate-500",
            open ? "rotate-180" : "",
          ].join(" ")}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-12 z-50 w-64 rounded-2xl border border-slate-200 bg-white shadow-xl">
          {/* User info header */}
          <div className="px-4 py-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 text-base font-bold text-white shadow">
                {avatarLetter}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-800 truncate">{displayName}</p>
                {email && <p className="text-xs text-slate-500 truncate">{email}</p>}
                <span className="mt-0.5 inline-block rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700">
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
              className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <User size={16} />
              </span>
              Thông tin tài khoản
            </button>

            <div className="my-1 h-px bg-slate-100" />

            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600">
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
