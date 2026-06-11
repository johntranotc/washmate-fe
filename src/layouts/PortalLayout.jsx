import { useState } from "react";
import {
  BarChart3,
  Bell,
  CalendarDays,
  Car,
  CircleHelp,
  ClipboardList,
  Gift,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Settings,
  Sparkles,
  UsersRound,
  UserRound,
  X,
} from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { useAppStore } from "../state/AppStore";

const navigation = {
  customer: [
    { label: "Tổng quan", path: "/customer", icon: LayoutDashboard, end: true },
    { label: "Đặt lịch", path: "/customer/bookings", icon: CalendarDays },
    { label: "Phương tiện", path: "/customer/vehicles", icon: Car },
    { label: "Điểm thưởng", path: "/customer/loyalty", icon: Gift },
    { label: "Thông báo", path: "/customer/notifications", icon: Bell },
  ],
  staff: [
    { label: "Tra cứu lịch", path: "/staff/bookings", icon: CalendarDays },
    { label: "Hàng đợi", path: "/staff/queue", icon: UsersRound },
    {
      label: "Quy trình dịch vụ",
      path: "/staff/bookings/1/workflow",
      icon: ClipboardList,
    },
  ],
  admin: [
    {
      label: "Phân tích",
      path: "/admin/dashboard",
      icon: BarChart3,
      end: true,
    },
    {
      label: "Quản trị",
      path: "/admin/management",
      icon: Settings,
    },
  ],
};

const roleCopy = {
  customer: "Chăm sóc xe cao cấp",
  staff: "Quản lý vận hành",
  admin: "Phân tích kinh doanh",
};

function PortalLayout({ role }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { state, actions } = useAppStore();
  const items = navigation[role];

  return (
    <div className="min-h-screen bg-[#f5f8fc] text-slate-950">
      {menuOpen && (
        <button
          type="button"
          aria-label="Đóng thanh điều hướng"
          className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[236px] flex-col border-r border-slate-200 bg-white px-3 py-5 transition-transform lg:translate-x-0 ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center gap-3 px-2 pb-6">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-blue-600 text-white">
            <Sparkles size={19} />
          </span>
          <div className="min-w-0">
            <strong className="block text-[15px] font-extrabold text-blue-700">
              AquaSmart Pro
            </strong>
            <span className="block text-[9px] font-medium text-slate-400">
              {roleCopy[role]}
            </span>
          </div>
          <button
            type="button"
            className="ml-auto rounded-lg p-2 text-slate-500 lg:hidden"
            onClick={() => setMenuOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        {role !== "admin" && (
          <NavLink
            to={
              role === "customer"
                ? "/customer/bookings/create"
                : "/staff/bookings"
            }
            className="mb-5 flex h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700"
            onClick={() => setMenuOpen(false)}
          >
            {role === "customer" ? "+ Đặt lịch mới" : "+ Tiếp nhận xe"}
          </NavLink>
        )}

        <nav className="space-y-1.5">
          {items.map(({ label, path, icon: Icon, end }) => (
            <NavLink
              key={path}
              to={path}
              end={end}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `flex h-11 items-center gap-3 rounded-lg px-3 text-xs font-semibold transition ${
                  isActive
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                }`
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto space-y-1 border-t border-slate-100 pt-4">
          <button className="flex h-10 w-full items-center gap-3 rounded-lg px-3 text-xs font-medium text-slate-600 hover:bg-slate-100">
            <CircleHelp size={16} /> Hỗ trợ
          </button>
          <button
            onClick={() => actions.logout()}
            className="flex h-10 items-center gap-3 rounded-lg px-3 text-xs font-medium text-slate-600 hover:bg-slate-100"
          >
            <LogOut size={16} /> Đăng xuất
          </button>
        </div>
      </aside>

      <div className="min-h-screen lg:pl-[236px]">
        <header className="sticky top-0 z-30 flex h-[62px] items-center gap-3 border-b border-slate-200 bg-white/95 px-4 backdrop-blur md:px-7">
          <button
            type="button"
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            onClick={() => setMenuOpen(true)}
          >
            <Menu size={20} />
          </button>

          <div className="ml-auto hidden h-9 w-[270px] items-center gap-2 rounded-full bg-slate-100 px-4 text-slate-400 md:flex">
            <Search size={14} />
            <input
              className="w-full border-0 bg-transparent text-[10px] text-slate-700 outline-none"
              placeholder={
                role === "admin"
                  ? "Tìm kiếm dữ liệu phân tích..."
                  : "Tìm khách hàng hoặc biển số..."
              }
            />
          </div>
          <button className="rounded-full p-2 text-slate-500 hover:bg-slate-100">
            <Bell size={17} />
          </button>
          <button className="rounded-full p-2 text-slate-500 hover:bg-slate-100">
            <Settings size={17} />
          </button>
          <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-blue-800 to-blue-500 text-[9px] font-extrabold text-white">
            {state.session?.name
              ?.split(" ")
              .map((part) => part[0])
              .slice(0, 2)
              .join("") || <UserRound size={14} />}
          </span>
        </header>

        <main className="mx-auto w-full max-w-[1280px] px-4 py-6 md:px-7 md:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default PortalLayout;
