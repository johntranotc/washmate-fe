import { CalendarDays, LayoutDashboard, ListChecks, Search } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import AccountDropdown from "../components/portal/AccountDropdown";

const navLinks = [
  [LayoutDashboard, "Tổng quan", "/nhan-vien", true],
  [ListChecks, "Hàng đợi", "/nhan-vien/hang-doi", false],
  [CalendarDays, "Danh sách lịch đặt", "/nhan-vien/danh-sach", false],
  [Search, "Tra cứu booking", "/staff/bookings", false],
];

function StaffLayout() {
  return (
    <div className="min-h-screen bg-slate-100">
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between bg-slate-900 px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 shadow">
            <span className="text-xs font-black text-white">W</span>
          </div>
          <div>
            <p className="text-sm font-extrabold text-white leading-none">WashMate</p>
            <p className="text-[10px] text-slate-400 leading-none mt-0.5">Staff Portal</p>
          </div>
        </div>

        <AccountDropdown profilePath="/nhan-vien/profile" colorScheme="dark" />
      </header>

      <div className="flex">
        <aside className="sticky top-14 h-[calc(100vh-56px)] w-56 shrink-0 overflow-y-auto border-r border-slate-200 bg-white p-3">
          <nav className="space-y-0.5">
            {navLinks.map(([Icon, label, to, end]) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  [
                    "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                  ].join(" ")
                }
              >
                <Icon size={15} />
                {label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="flex-1 p-6 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default StaffLayout;
