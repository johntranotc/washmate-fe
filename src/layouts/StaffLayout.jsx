import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Droplets,
  LayoutDashboard,
  ListTodo,
  LogOut,
  Menu,
  Search,
  Sparkles,
  UsersRound,
  Workflow,
  X,
} from "lucide-react";

const navItems = [
  { label: "Tổng quan", path: "/nhan-vien", icon: LayoutDashboard, end: true },
  { label: "Hàng đợi", path: "/nhan-vien/hang-doi", icon: UsersRound },
  { label: "Danh sách lịch đặt", path: "/nhan-vien/danh-sach", icon: ListTodo },
  { label: "Tra cứu lịch", path: "/staff/bookings", icon: Search },
  { label: "Quy trình xử lý", path: "/staff/bookings/1/workflow", icon: Workflow },
];

function StaffLayout() {
  const navigate = useNavigate();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const staffName =
    localStorage.getItem("userEmail") ||
    sessionStorage.getItem("userEmail") ||
    "Nhân viên Demo";

  const garageName = "WashMate Quận 1"; // Mock data
  const avatarInitial = staffName.trim().charAt(0).toUpperCase() || "N";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("role"); // if stored
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("userEmail");
    sessionStorage.removeItem("role");
    navigate("/chon-khong-gian-lam-viec");
  };

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
      isActive
        ? "bg-blue-600/10 text-blue-600"
        : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
    }`;

  const sidebarContent = (
    <>
      <Link to="/nhan-vien" className="flex items-center gap-3 px-2 pb-6">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-[0_12px_28px_rgba(37,99,235,0.28)]">
          <Sparkles size={22} />
        </span>
        <span>
          <span className="block text-lg font-extrabold tracking-tight text-slate-800">
            WashMate Nhân viên
          </span>
          <span className="block text-xs font-medium text-slate-500">
            Cổng vận hành gara
          </span>
        </span>
      </Link>

      <nav className="flex-1 space-y-1 overflow-y-auto px-1">
        {navItems.map(({ label, path, icon: Icon, end }) => (
          <NavLink
            key={path}
            to={path}
            end={end}
            onClick={() => setMobileNavOpen(false)}
            className={navLinkClass}
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-4 border-t border-slate-200 pt-4">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-500 transition hover:bg-red-50 hover:text-red-500"
        >
          <LogOut size={18} />
          Đăng xuất
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="sticky top-0 hidden h-screen w-72 flex-col border-r border-slate-200 bg-white px-4 py-6 lg:flex">
          {sidebarContent}
        </aside>

        {/* Mobile Sidebar */}
        {mobileNavOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div
              className="absolute inset-0 bg-black/30"
              onClick={() => setMobileNavOpen(false)}
            />
            <aside className="absolute left-0 top-0 flex h-full w-72 flex-col bg-white px-4 py-6 shadow-2xl">
              <div className="mb-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setMobileNavOpen(false)}
                  className="rounded-full p-2 text-slate-500 hover:bg-slate-50"
                  aria-label="Đóng menu"
                >
                  <X size={20} />
                </button>
              </div>
              {sidebarContent}
            </aside>
          </div>
        )}

        <div className="flex min-h-screen w-full flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
            <div className="flex items-center gap-4 px-4 py-4 sm:px-6 lg:px-8">
              <button
                type="button"
                onClick={() => setMobileNavOpen(true)}
                className="rounded-xl border border-slate-200 p-2 text-slate-700 lg:hidden"
                aria-label="Mở menu"
              >
                <Menu size={20} />
              </button>

              <div className="relative flex-1 max-w-md hidden md:block">
                <Search
                  size={18}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  placeholder="Tra cứu biển số xe..."
                  className="w-full rounded-full border border-slate-200 bg-slate-50 py-2.5 pl-11 pr-4 text-sm text-slate-800 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15"
                />
              </div>

              <div className="ml-auto flex items-center gap-3">
                <div className="hidden flex-col items-end sm:flex mr-2">
                  <span className="text-sm font-bold text-slate-800">{staffName}</span>
                  <span className="text-xs font-semibold text-blue-600">{garageName}</span>
                </div>
                <div className="flex items-center justify-center rounded-full border border-slate-200 bg-white p-1">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                    {avatarInitial}
                  </span>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-[1180px]">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default StaffLayout;
