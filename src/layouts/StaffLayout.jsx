import { useEffect } from "react";
import {
  CalendarDays, LayoutDashboard, ListChecks, Search, User, Bell, LogOut, Car,
} from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { authApi } from "../api/authApi";
import { getAuthItem } from "@/utils/authUtils";

const navLinks = [
  { icon: LayoutDashboard, label: "Tổng quan", to: "/nhan-vien", end: true },
  { icon: ListChecks, label: "Hàng đợi", to: "/nhan-vien/hang-doi", end: false },
  { icon: CalendarDays, label: "Danh sách lịch đặt", to: "/nhan-vien/danh-sach", end: false },
  { icon: Search, label: "Tra cứu booking", to: "/staff/bookings", end: false },
  { icon: User, label: "Hồ sơ nhân viên", to: "/nhan-vien/profile", end: false },
];

function readUser() {
  try {
    return JSON.parse(getAuthItem("currentUser") || "{}");
  } catch {
    return {};
  }
}

export default function StaffLayout() {
  const navigate = useNavigate();
  const user = readUser();
  const displayName = user?.fullName || user?.name || "Nhân viên";
  const initial = displayName.charAt(0).toUpperCase() || "S";

  async function handleLogout() {
    try {
      await authApi.logout();
    } catch {
      ["token", "accessToken", "refreshToken", "currentUser", "roles", "garageIds", "userEmail", "washmate_user_role"]
        .forEach((k) => { sessionStorage.removeItem(k); localStorage.removeItem(k); });
    }
    navigate("/dang-nhap");
  }

  // Tiêu đề tab trình duyệt theo khu vực — như một web thật
  useEffect(() => {
    document.title = "WashMate — Nhân viên";
  }, []);

  return (
    <div className="wm-staff flex h-screen overflow-hidden bg-slate-50 font-sans text-slate-900">
      {/* Dark sidebar */}
      <aside className="flex w-64 shrink-0 flex-col bg-[#0F172A] text-slate-300">
        <div className="flex h-16 shrink-0 items-center gap-3 px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500 shadow-sm shadow-blue-500/30">
            <Car size={18} className="text-white" />
          </div>
          <div>
            <p className="text-[15px] font-extrabold leading-none text-white">WashMate</p>
            <p className="mt-1 text-[10px] leading-none text-blue-300">Staff Portal</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {navLinks.map(({ icon: Icon, label, to, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                [
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all",
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white",
                ].join(" ")
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User card + logout */}
        <div className="shrink-0 border-t border-slate-800 p-4">
          <div className="flex items-center gap-3 rounded-xl px-2 py-2">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 text-sm font-bold text-white shadow">
              {initial}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-white">{displayName}</p>
              <p className="flex items-center gap-1 text-[11px] text-slate-400">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" /> Đang làm việc
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 py-2.5 text-xs font-bold text-slate-200 transition hover:bg-slate-800"
          >
            <LogOut size={15} /> Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-16 shrink-0 items-center justify-end gap-3 border-b border-slate-200 bg-white px-6">
          <button
            type="button"
            aria-label="Thông báo"
            className="relative grid h-10 w-10 place-items-center rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50"
          >
            <Bell size={18} />
          </button>
          <div className="flex items-center gap-2.5 rounded-full border border-slate-200 py-1.5 pl-1.5 pr-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 text-sm font-bold text-white shadow">
              {initial}
            </span>
            <div className="hidden sm:block">
              <p className="text-xs font-bold leading-tight text-slate-800">{displayName}</p>
              <p className="text-[10px] leading-tight text-slate-500">STAFF</p>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
