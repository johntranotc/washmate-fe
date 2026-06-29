import { CalendarDays, LayoutDashboard, ListChecks, Search, ChevronDown, Clock, XCircle, Timer } from "lucide-react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import AccountDropdown from "../components/portal/AccountDropdown";
import { cn } from "@/lib/utils";

const navLinks = [
  { icon: LayoutDashboard, label: "Tổng quan", to: "/nhan-vien", end: true },
  { 
    icon: ListChecks, 
    label: "Hàng đợi", 
    to: "/nhan-vien/hang-doi", 
    end: false,
    subItems: [
      { label: "Chờ xác nhận", hash: "#pending", icon: Clock },
      { label: "Đang xử lý", hash: "#queue", icon: Timer },
      { label: "Từ chối", hash: "#rejected", icon: XCircle },
      { label: "Hủy", hash: "#cancelled", icon: XCircle }
    ]
  },
  { icon: CalendarDays, label: "Danh sách lịch đặt", to: "/nhan-vien/danh-sach", end: false },
  { icon: Search, label: "Tra cứu booking", to: "/staff/bookings", end: false },
];

function StaffLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState({});

  // Initialize expanded state based on current route
  useEffect(() => {
    navLinks.forEach(item => {
      if (item.subItems) {
        const isActiveRoute = location.pathname === item.to || (item.to !== "/nhan-vien" && location.pathname.startsWith(item.to));
        if (isActiveRoute && expanded[item.to] === undefined) {
          setExpanded(prev => ({ ...prev, [item.to]: true }));
        }
      }
    });
  }, [location.pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  // Scroll to hash when URL changes
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace("#", "");
      const el = document.getElementById(id);
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
      }
    }
  }, [location.pathname, location.hash]);

  const handleSubItemClick = (e, to, hash) => {
    e.preventDefault();
    if (location.pathname !== to) {
      navigate(to + hash);
    } else {
      navigate(hash);
    }
  };

  const handleParentClick = (e, item) => {
    if (item.subItems) {
      // If clicking on a parent that has subItems, always toggle its expansion
      setExpanded(prev => ({ ...prev, [item.to]: !prev[item.to] }));
      
      // If we are already on this route, prevent default navigation so it just acts as an accordion
      if (location.pathname === item.to) {
        e.preventDefault();
      }
    }
  };

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
        <aside className="sticky top-14 h-[calc(100vh-56px)] w-60 shrink-0 overflow-y-auto border-r border-slate-200 bg-white p-3">
          <nav className="space-y-1">
            {navLinks.map((item) => {
              const isExpanded = !!expanded[item.to];
              
              return (
                <div key={item.to} className="space-y-1">
                  <NavLink
                    to={item.to}
                    end={item.end}
                    onClick={(e) => handleParentClick(e, item)}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-blue-600 text-white shadow-sm"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <div className="flex items-center gap-2.5">
                          <item.icon size={16} />
                          {item.label}
                        </div>
                        {item.subItems && (
                          <ChevronDown 
                            size={14} 
                            className={cn("transition-transform", isExpanded && "rotate-180")} 
                          />
                        )}
                      </>
                    )}
                  </NavLink>
                  
                  {/* Dropdown for sub-items */}
                  {item.subItems && isExpanded && (
                    <div className="pl-9 pr-2 space-y-1 py-1">
                      {item.subItems.map((sub) => {
                        const isSubActive = location.hash === sub.hash;
                        return (
                          <a
                            key={sub.hash}
                            href={`${item.to}${sub.hash}`}
                            onClick={(e) => handleSubItemClick(e, item.to, sub.hash)}
                            className={cn(
                              "flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors",
                              isSubActive
                                ? "bg-blue-50 text-blue-700"
                                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                            )}
                          >
                            <sub.icon size={14} />
                            {sub.label}
                          </a>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
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
