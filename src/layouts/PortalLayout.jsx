import { useState } from "react";
import {
  BarChart3, Bell, Building2, CalendarDays, CheckCircle2, CircleDollarSign,
  ClipboardList, Clock3, CreditCard, FileText, LayoutDashboard, LogOut, Menu,
  Package, Receipt, Search, Settings, Sparkles, UserRound, X,
} from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

const navigation = {
  staff: [
    { label: "Tổng quan", path: "/staff", icon: LayoutDashboard, end: true },
    { label: "Lịch hôm nay", path: "/staff/bookings", icon: CalendarDays },
    { label: "Đang xử lý", path: "/staff/queue", icon: Clock3 },
    { label: "Hoàn tất", path: "/staff/bookings?status=COMPLETED", icon: CheckCircle2 },
    { label: "Báo cáo nhanh", path: "/staff/dashboard", icon: BarChart3 },
  ],
  admin: [
    { label: "Tổng quan", path: "/admin", icon: LayoutDashboard, end: true },
    { label: "Gara", path: "/admin/garages", icon: Building2 },
    { label: "Dịch vụ", path: "/admin/services", icon: Package },
    { label: "Khung giờ", path: "/admin/slots", icon: Clock3 },
    { label: "Lịch đặt", path: "/admin/bookings", icon: ClipboardList },
    { label: "Thanh toán", path: "/admin/payments", icon: CreditCard },
    { label: "Hóa đơn", path: "/admin/invoices", icon: Receipt },
    { label: "Báo cáo", path: "/admin/reports", icon: FileText },
  ],
};

const roleCopy = {
  staff: { title: "Nhân viên", subtitle: "Vận hành gara" },
  admin: { title: "Quản trị", subtitle: "Quản lý WashMate" },
};

export default function PortalLayout({ role }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const copy = roleCopy[role];
  const userName = (() => {
    try {
      const user = JSON.parse(localStorage.getItem("currentUser") || "{}");
      return user.fullName || user.name || copy.title;
    } catch {
      return copy.title;
    }
  })();

  const logout = () => {
    ["accessToken", "refreshToken", "currentUser", "roles", "garageIds"].forEach((key) => localStorage.removeItem(key));
    navigate("/dang-nhap");
  };

  return (
    <div className="min-h-screen bg-[#f5f8fc] text-slate-950">
      {menuOpen && <button type="button" aria-label="Đóng thanh điều hướng" className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden" onClick={() => setMenuOpen(false)} />}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 bg-white px-4 py-6 transition-transform lg:translate-x-0 ${menuOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center gap-3 px-2 pb-7">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-200"><Sparkles size={21} /></span>
          <div><strong className="block text-lg font-extrabold text-blue-700">WashMate</strong><span className="text-xs text-slate-400">{copy.subtitle}</span></div>
          <button className="ml-auto rounded-lg p-2 text-slate-500 lg:hidden" onClick={() => setMenuOpen(false)}><X size={18} /></button>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto">
          {navigation[role].map(({ label, path, icon: Icon, end }) => (
            <NavLink key={path} to={path} end={end} onClick={() => setMenuOpen(false)} className={({ isActive }) => `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${isActive ? "bg-blue-600 text-white shadow-sm" : "text-slate-600 hover:bg-blue-50 hover:text-blue-700"}`}>
              <Icon size={18} />{label}
            </NavLink>
          ))}
        </nav>
        <button onClick={logout} className="mt-4 flex items-center gap-3 border-t border-slate-100 px-4 pt-5 text-sm font-semibold text-slate-500 hover:text-rose-600"><LogOut size={18} />Đăng xuất</button>
      </aside>
      <div className="min-h-screen lg:pl-72">
        <header className="sticky top-0 z-30 flex h-[70px] items-center gap-3 border-b border-slate-200 bg-white/95 px-4 backdrop-blur md:px-7">
          <button className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 lg:hidden" onClick={() => setMenuOpen(true)}><Menu size={20} /></button>
          <div className="hidden h-10 w-[300px] items-center gap-2 rounded-full bg-slate-100 px-4 text-slate-400 md:flex"><Search size={15} /><input className="w-full bg-transparent text-xs text-slate-700 outline-none" placeholder="Tìm kiếm nhanh..." /></div>
          <div className="ml-auto flex items-center gap-3">
            <button className="rounded-full border border-slate-200 p-2.5 text-slate-500"><Bell size={17} /></button>
            <button className="hidden rounded-full border border-slate-200 p-2.5 text-slate-500 sm:block"><Settings size={17} /></button>
            <div className="flex items-center gap-3 rounded-full border border-slate-200 py-1.5 pl-1.5 pr-4"><span className="grid h-8 w-8 place-items-center rounded-full bg-blue-600 text-white"><UserRound size={15} /></span><div className="hidden sm:block"><b className="block text-xs">{userName}</b><span className="text-[9px] text-slate-400">{copy.title}</span></div></div>
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1280px] px-4 py-6 md:px-7 md:py-8"><Outlet /></main>
      </div>
    </div>
  );
}
