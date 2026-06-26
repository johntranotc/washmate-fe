import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  BarChart3,
  Building2,
  CalendarCheck,
  CreditCard,
  Gift,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Shield,
  Sparkles,
  Users,
  X,
} from "lucide-react";

const navGroups = [
  {
    label: "Tổng quan",
    items: [
      { label: "Bảng điều khiển", path: "/quan-tri", icon: LayoutDashboard, end: true },
    ],
  },
  {
    label: "Quản lý",
    items: [
      { label: "Đặt lịch", path: "/quan-tri/dat-lich", icon: CalendarCheck },
      { label: "Khách hàng", path: "/quan-tri/khach-hang", icon: Users },
      { label: "Gara / Chi nhánh", path: "/quan-tri/gara", icon: Building2 },
      { label: "Thanh toán", path: "/quan-tri/thanh-toan", icon: CreditCard },
    ],
  },
  {
    label: "Báo cáo",
    items: [
      { label: "Doanh thu", path: "/quan-tri/doanh-thu", icon: BarChart3 },
      { label: "Điểm thành viên", path: "/quan-tri/diem-thanh-vien", icon: Gift },
      { label: "AI Insights", path: "/admin/ai-insights", icon: Sparkles },
    ],
  },
  {
    label: "Hệ thống",
    items: [
      { label: "Cài đặt", path: "/quan-tri/cai-dat", icon: Settings },
    ],
  },
];

function AdminLayout() {
  const navigate = useNavigate();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const adminName =
    localStorage.getItem("userEmail") ||
    sessionStorage.getItem("userEmail") ||
    "Quản trị viên";

  const avatarInitial = adminName.trim().charAt(0).toUpperCase() || "A";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("role");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("userEmail");
    sessionStorage.removeItem("role");
    navigate("/chon-khong-gian-lam-viec");
  };

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ${
      isActive
        ? "bg-violet-600/10 text-violet-700"
        : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
    }`;

  const sidebarContent = (
    <>
      {/* Brand */}
      <Link to="/quan-tri" className="flex items-center gap-3 px-2 pb-6">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/30">
          <Shield size={20} />
        </span>
        <span>
          <span className="block text-base font-extrabold tracking-tight text-slate-800">
            WashMate Admin
          </span>
          <span className="block text-xs font-medium text-slate-500">
            Cổng quản trị hệ thống
          </span>
        </span>
      </Link>

      {/* Nav Groups */}
      <nav className="flex-1 space-y-5 overflow-y-auto px-1">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="mb-1.5 px-3 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map(({ label, path, icon: Icon, end }) => (
                <NavLink
                  key={path}
                  to={path}
                  end={end}
                  onClick={() => setMobileNavOpen(false)}
                  className={navLinkClass}
                >
                  <Icon size={17} />
                  {label}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Admin profile + logout */}
      <div className="mt-4 border-t border-slate-100 pt-4 space-y-1">
        <div className="flex items-center gap-3 rounded-xl px-3 py-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-sm font-bold text-white">
            {avatarInitial}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-slate-800">{adminName}</p>
            <p className="text-xs text-violet-600 font-semibold">Quản trị viên</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-500 transition hover:bg-red-50 hover:text-red-600"
        >
          <LogOut size={17} />
          Đăng xuất
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="sticky top-0 hidden h-screen w-64 flex-col border-r border-slate-200 bg-white px-4 py-6 lg:flex">
          {sidebarContent}
        </aside>

        {/* Mobile Sidebar */}
        {mobileNavOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div
              className="absolute inset-0 bg-black/30"
              onClick={() => setMobileNavOpen(false)}
            />
            <aside className="absolute left-0 top-0 flex h-full w-64 flex-col bg-white px-4 py-6 shadow-2xl">
              <div className="mb-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setMobileNavOpen(false)}
                  className="rounded-full p-2 text-slate-500 hover:bg-slate-50"
                >
                  <X size={20} />
                </button>
              </div>
              {sidebarContent}
            </aside>
          </div>
        )}

        {/* Main content */}
        <div className="flex min-h-screen w-full flex-1 flex-col">
          {/* Topbar */}
          <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
            <div className="flex items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
              <button
                type="button"
                onClick={() => setMobileNavOpen(true)}
                className="rounded-xl border border-slate-200 p-2 text-slate-700 lg:hidden"
              >
                <Menu size={20} />
              </button>

              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-violet-500" />
                <span className="text-sm font-bold text-slate-700">WashMate Admin</span>
              </div>

              <div className="ml-auto flex items-center gap-3">
                <div className="hidden flex-col items-end sm:flex mr-1">
                  <span className="text-sm font-bold text-slate-800">{adminName}</span>
                  <span className="text-xs font-semibold text-violet-600">Quản trị viên</span>
                </div>
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-sm font-bold text-white shadow">
                  {avatarInitial}
                </span>
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-[1200px]">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default AdminLayout;
