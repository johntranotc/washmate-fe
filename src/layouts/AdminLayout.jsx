import { useEffect } from "react";
import {
  BarChart3, Building2, CalendarDays, Car, CircleDollarSign,
  LayoutDashboard, Megaphone, Settings, Star, Users, UsersRound, BrainCircuit
} from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import AccountDropdown from "../components/portal/AccountDropdown";

const navLinks = [
  [LayoutDashboard, "Tổng quan", "/quan-tri", true],
  [CalendarDays, "Lịch hẹn", "/quan-tri/bookings", false],
  [UsersRound, "Khách hàng", "/quan-tri/users", false],
  [Car, "Xe & Dịch vụ", "/quan-tri/services", false],
  [Star, "Tích điểm & Thành viên", "/quan-tri/loyalty", false],
  [CircleDollarSign, "Doanh thu", "/quan-tri/invoices", false],
  [BarChart3, "Báo cáo", "/quan-tri/reports", false],
  [BrainCircuit, "AI Insight", "/quan-tri/ai-insights", false],
  [Megaphone, "Chiến dịch", "/quan-tri/campaigns", false],
  [Building2, "Cơ sở / Chi nhánh", "/quan-tri/garages", false],
  [Users, "Nhân viên", "/quan-tri/staff", false],
  [Settings, "Cài đặt", "/quan-tri/settings", false],
];

function AdminLayout() {
  // Tiêu đề tab trình duyệt theo khu vực — như một web thật
  useEffect(() => {
    document.title = "WashMate — Quản trị";
  }, []);

  return (
    <div className="wm-admin flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-900">
      {/* Sidebar - Dark theme */}
      <aside className="flex flex-col w-64 shrink-0 bg-[#0F172A] text-slate-300 transition-all duration-300">
        <div className="flex h-16 items-center px-6 gap-3 shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500 shadow-sm shadow-blue-500/20">
            <Car size={18} className="text-white" />
          </div>
          <div>
            <p className="text-[15px] font-extrabold text-white leading-none">WashMate</p>
            <p className="text-[10px] text-blue-300 leading-none mt-1">Hệ thống rửa xe thông minh</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 no-scrollbar">
          {navLinks.map(([Icon, label, to, end]) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                [
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200",
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

          <div className="mt-4 px-2 mb-2">
            <div className="rounded-2xl bg-gradient-to-br from-blue-900/50 to-slate-800 p-4 border border-blue-800/30">
              <h4 className="font-bold text-white text-sm">Nâng cấp trải nghiệm của khách hàng</h4>
              <p className="mt-1 text-xs text-slate-400 leading-relaxed">Gửi ưu đãi và chăm sóc khách hàng hiệu quả hơn.</p>
              <NavLink to="/quan-tri/campaigns" className="mt-3 block w-full rounded-xl bg-white text-blue-900 text-xs font-bold py-2 text-center hover:bg-blue-50 transition-colors shadow-sm">
                Tạo chiến dịch tích điểm
              </NavLink>
            </div>
          </div>
        </nav>

        <div className="p-4 border-t border-slate-800 shrink-0">
          <div className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-slate-800 transition-colors cursor-pointer">
            <img src="https://api.dicebear.com/9.x/notionists/svg?seed=Admin" alt="Admin" className="h-9 w-9 rounded-full bg-slate-700 object-cover" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">Nguyễn Văn A</p>
              <p className="text-xs text-slate-400 truncate">Chủ doanh nghiệp</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-8">
          <div className="flex-1"></div>
          <div className="flex items-center gap-3">
             <AccountDropdown profilePath="/quan-tri/profile" colorScheme="light" />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default AdminLayout;
