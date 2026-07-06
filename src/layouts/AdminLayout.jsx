import {
  BarChart3, Building2, CalendarDays, Car, CircleDollarSign,
  LayoutDashboard, Lightbulb, LogOut, Megaphone, Settings, Star, Users, UsersRound,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import AccountDropdown from "../components/portal/AccountDropdown";
import PortalShell from "@/components/shared/PortalShell";
import { Button } from "@/components/ui/button";
import { authApi } from "../api/authApi";
import { getAuthItem } from "@/utils/authUtils";
import { STAFF_ASSETS } from "@/lib/staff-assets";

const navLinks = [
  { icon: LayoutDashboard, label: "Tổng quan", to: "/quan-tri", end: true },
  { icon: CalendarDays, label: "Lịch hẹn", to: "/quan-tri/bookings", end: false },
  { icon: UsersRound, label: "Khách hàng", to: "/quan-tri/users", end: false },
  { icon: Car, label: "Xe & Dịch vụ", to: "/quan-tri/services", end: false },
  { icon: Star, label: "Tích điểm & Thành viên", to: "/quan-tri/loyalty", end: false },
  { icon: CircleDollarSign, label: "Doanh thu", to: "/quan-tri/invoices", end: false },
  { icon: BarChart3, label: "Báo cáo", to: "/quan-tri/reports", end: false },
  { icon: Lightbulb, label: "Insight vận hành", to: "/quan-tri/ai-insights", end: false },
  { icon: Megaphone, label: "Chiến dịch", to: "/quan-tri/campaigns", end: false },
  { icon: Building2, label: "Cơ sở / Chi nhánh", to: "/quan-tri/garages", end: false },
  { icon: Users, label: "Nhân viên", to: "/quan-tri/staff", end: false },
  { icon: Settings, label: "Cài đặt", to: "/quan-tri/settings", end: false },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  // Đọc currentUser từ storage (đã lưu lúc login) — cùng nguồn với AccountDropdown
  let user = {};
  try {
    user = JSON.parse(getAuthItem("currentUser") || "{}");
  } catch {
    user = {};
  }
  const displayName = user?.fullName || user?.name || "Quản trị viên";
  const subtitle = user?.email || "Quản trị hệ thống";
  const avatarLetter = displayName.charAt(0).toUpperCase() || "A";

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
      brand={{ title: "WashMate", subtitle: "Admin Portal", logoSrc: STAFF_ASSETS.logo.mark }}
      sidebarBackground={STAFF_ASSETS.banner.sidebar}
      documentTitle="WashMate — Quản trị"
      headerRight={<AccountDropdown profilePath="/quan-tri/profile" colorScheme="light" />}
      sidebarFooter={
        <>
          <div className="flex items-center gap-3 rounded-xl px-2 py-2">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent-cyan text-sm font-bold text-white">
              {avatarLetter}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-white">{displayName}</p>
              <p className="truncate text-xs text-neutral-muted">{subtitle}</p>
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
