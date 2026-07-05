import {
  CalendarDays, LayoutDashboard, ListChecks, Search, User, Bell, LogOut,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../api/authApi";
import { getAuthItem } from "@/utils/authUtils";
import PortalShell from "@/components/shared/PortalShell";
import { Button } from "@/components/ui/button";

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

  return (
    <PortalShell
      navLinks={navLinks}
      brand={{ title: "WashMate", subtitle: "Staff Portal" }}
      documentTitle="WashMate — Nhân viên"
      contentClassName="p-4 sm:p-6"
      headerRight={
        <>
          <button
            type="button"
            aria-label="Thông báo"
            className="relative grid h-10 w-10 place-items-center rounded-full border border-border text-muted-foreground hover:bg-surface"
          >
            <Bell size={18} />
          </button>
          <div className="flex items-center gap-2.5 rounded-full border border-border py-1.5 pl-1.5 pr-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent-cyan text-sm font-bold text-white">
              {initial}
            </span>
            <div className="hidden sm:block">
              <p className="text-xs font-bold leading-tight text-foreground">{displayName}</p>
              <p className="text-xs leading-tight text-muted-foreground">STAFF</p>
            </div>
          </div>
        </>
      }
      sidebarFooter={
        <>
          <div className="flex items-center gap-3 rounded-xl px-2 py-2">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent-cyan text-sm font-bold text-white">
              {initial}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-white">{displayName}</p>
              <p className="flex items-center gap-1 text-xs text-neutral-muted">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-success" /> Đang làm việc
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="mt-3 w-full border border-ink-soft text-xs text-border hover:bg-ink-soft hover:text-white"
          >
            <LogOut /> Đăng xuất
          </Button>
        </>
      }
    />
  );
}
