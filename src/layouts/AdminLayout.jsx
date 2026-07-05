import {
  BarChart3, Building2, CalendarDays, Car, CircleDollarSign,
  LayoutDashboard, Megaphone, Settings, Star, Users, UsersRound, BrainCircuit,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import AccountDropdown from "../components/portal/AccountDropdown";
import PortalShell from "@/components/shared/PortalShell";
import { getAuthItem } from "@/utils/authUtils";

const navLinks = [
  { icon: LayoutDashboard, label: "Tổng quan", to: "/quan-tri", end: true },
  { icon: CalendarDays, label: "Lịch hẹn", to: "/quan-tri/bookings", end: false },
  { icon: UsersRound, label: "Khách hàng", to: "/quan-tri/users", end: false },
  { icon: Car, label: "Xe & Dịch vụ", to: "/quan-tri/services", end: false },
  { icon: Star, label: "Tích điểm & Thành viên", to: "/quan-tri/loyalty", end: false },
  { icon: CircleDollarSign, label: "Doanh thu", to: "/quan-tri/invoices", end: false },
  { icon: BarChart3, label: "Báo cáo", to: "/quan-tri/reports", end: false },
  { icon: BrainCircuit, label: "AI Insight", to: "/quan-tri/ai-insights", end: false },
  { icon: Megaphone, label: "Chiến dịch", to: "/quan-tri/campaigns", end: false },
  { icon: Building2, label: "Cơ sở / Chi nhánh", to: "/quan-tri/garages", end: false },
  { icon: Users, label: "Nhân viên", to: "/quan-tri/staff", end: false },
  { icon: Settings, label: "Cài đặt", to: "/quan-tri/settings", end: false },
];

export default function AdminLayout() {
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

  return (
    <PortalShell
      navLinks={navLinks}
      brand={{ title: "WashMate", subtitle: "Hệ thống rửa xe thông minh" }}
      documentTitle="WashMate — Quản trị"
      headerRight={<AccountDropdown profilePath="/quan-tri/profile" colorScheme="light" />}
      sidebarExtra={
        <div className="mt-4 mb-2 px-2">
          <div className="rounded-2xl border border-primary-strong/30 bg-ink-soft p-4">
            <h4 className="text-sm font-bold text-white">Nâng cấp trải nghiệm của khách hàng</h4>
            <p className="mt-1 text-xs leading-relaxed text-neutral-muted">Gửi ưu đãi và chăm sóc khách hàng hiệu quả hơn.</p>
            <NavLink to="/quan-tri/campaigns" className="mt-3 block w-full rounded-xl bg-card py-2 text-center text-xs font-bold text-primary-strong shadow-sm transition-colors hover:bg-primary-container">
              Tạo chiến dịch tích điểm
            </NavLink>
          </div>
        </div>
      }
      sidebarFooter={
        <div className="flex items-center gap-3 rounded-xl px-2 py-2">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent-cyan text-sm font-bold text-white">
            {avatarLetter}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-white">{displayName}</p>
            <p className="truncate text-xs text-neutral-muted">{subtitle}</p>
          </div>
        </div>
      }
    />
  );
}
