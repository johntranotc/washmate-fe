import {
  BarChart3, Building2, CalendarDays, FileText,
  LayoutDashboard, PackagePlus, UsersRound, BrainCircuit
} from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import AccountDropdown from "../components/portal/AccountDropdown";

const navLinks = [
  [LayoutDashboard, "Dashboard", "/quan-tri", true],
  [Building2, "Gara", "/quan-tri/garages", false],
  [CalendarDays, "Bookings", "/quan-tri/bookings", false],
  [PackagePlus, "Dịch vụ", "/quan-tri/services", false],
  [FileText, "Hóa đơn", "/quan-tri/invoices", false],
  [UsersRound, "Người dùng", "/quan-tri/users", false],
  [BarChart3, "Báo cáo", "/quan-tri/reports", false],
  [BrainCircuit, "AI Insight", "/quan-tri/ai-insights", false],
];

function AdminLayout() {
  return (
    <div className="min-h-screen bg-slate-100">
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 shadow">
            <span className="text-xs font-black text-white">W</span>
          </div>
          <div>
            <p className="text-sm font-extrabold text-slate-900 leading-none">WashMate</p>
            <p className="text-[10px] text-slate-500 leading-none mt-0.5">Admin Portal</p>
          </div>
        </div>

        <AccountDropdown profilePath="/quan-tri/profile" colorScheme="light" />
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

export default AdminLayout;
