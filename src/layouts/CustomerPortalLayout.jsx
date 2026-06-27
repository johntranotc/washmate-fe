import { useEffect, useState, useRef } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Bell,
  Calendar,
  Car,
  CheckCircle,
  ChevronDown,
  CreditCard,
  Eye,
  EyeOff,
  Gift,
  LayoutGrid,
  LogOut,
  Plus,
  Shield,
  Star,
  User,
  X,
  XCircle,
} from "lucide-react";
import { Logo } from "@/components/site/logo";
import { loyaltyApi } from "@/api/loyaltyApi";
import { cn } from "@/lib/utils";
import { jwtDecode } from "jwt-decode";

const defaultLoyaltyInfo = {
  tierName: "Thành viên mới",
  availablePoints: 0,
};

const menuItems = [
  { href: "/khach-hang", label: "Tổng quan", icon: LayoutGrid, end: true },
  { href: "/khach-hang/lich-dat", label: "Lịch đặt của tôi", icon: Calendar },
  { href: "/khach-hang/xe-cua-toi", label: "Xe của tôi", icon: Car },
  { href: "/khach-hang/dat-lich-moi", label: "Đặt lịch mới", icon: Plus },
  { href: "/khach-hang/thanh-toan", label: "Thanh toán & hóa đơn", icon: CreditCard },
  { href: "/khach-hang/diem-thanh-vien", label: "Điểm thành viên", icon: Star },
  { href: "/khach-hang/uu-dai", label: "Ưu đãi", icon: Gift },
];

function resolveDisplayName() {
  try {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = jwtDecode(token);

      console.log("=== TOKEN PAYLOAD (HEADER) ===", decoded);

      let name =
        decoded.full_name ||
        decoded.fullName ||
        decoded.name ||
        decoded.username ||
        decoded.user_name ||
        decoded.customerName;

      if (!name && decoded.user && typeof decoded.user === "object") {
        name = decoded.user.name || decoded.user.fullName || decoded.user.full_name;
      }
      if (!name && decoded.customer && typeof decoded.customer === "object") {
        name = decoded.customer.name || decoded.customer.fullName || decoded.customer.full_name;
      }

      if (name && typeof name === "string" && isNaN(Number(name))) {
        return name;
      }

      const email = decoded.email || decoded.sub;
      if (email && typeof email === "string" && email.includes("@")) {
        return email.split("@")[0];
      }
    }

    const raw = localStorage.getItem("washmate_user_profile");
    if (raw) {
      const p = JSON.parse(raw);
      if (p && p.name && typeof p.name === "string") return p.name;
    }
  } catch (error) {
    console.error("Lỗi bóc tách tên hiển thị tại Layout:", error);
  }
  return "Khách hàng";
}

function DashboardHeader() {
  const navigate = useNavigate();
  const [customerName, setCustomerName] = useState(resolveDisplayName);
  const [loyaltyInfo, setLoyaltyInfo] = useState(defaultLoyaltyInfo);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pwForm, setPwForm] = useState({ current: "", newPw: "", confirm: "" });
  const [showPw, setShowPw] = useState({ current: false, newPw: false, confirm: false });
  const [pwStatus, setPwStatus] = useState(null);
  const [pwMessage, setPwMessage] = useState("");

  function toggleShowPw(key) {
    setShowPw((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function validatePw() {
    if (!pwForm.current) return "Vui lòng nhập mật khẩu hiện tại.";
    if (pwForm.newPw.length < 8) return "Mật khẩu mới phải có ít nhất 8 ký tự.";
    if (pwForm.newPw !== pwForm.confirm) return "Xác nhận mật khẩu không khớp.";
    return null;
  }

  async function handlePasswordSubmit(e) {
    e.preventDefault();
    const err = validatePw();
    if (err) {
      setPwStatus("error");
      setPwMessage(err);
      return;
    }
    setPwStatus("success");
    setPwMessage("Mật khẩu đã được đổi thành công!");
    setPwForm({ current: "", newPw: "", confirm: "" });
    setTimeout(() => {
      setPwStatus(null);
      setShowPasswordModal(false);
    }, 2000);
  }

  const pwFields = [
    { label: "Mật khẩu hiện tại", key: "current" },
    { label: "Mật khẩu mới", key: "newPw" },
    { label: "Xác nhận mật khẩu mới", key: "confirm" },
  ];

  useEffect(() => {
    function handleProfileUpdate() {
      setCustomerName(resolveDisplayName());
    }
    window.addEventListener("washmate-profile-updated", handleProfileUpdate);
    return () => window.removeEventListener("washmate-profile-updated", handleProfileUpdate);
  }, []);

  useEffect(() => {
    async function fetchLoyalty() {
      try {
        const res = await loyaltyApi.getMyLoyalty();
        if (res) {
          setLoyaltyInfo({
            tierName: res.tierName || res.tier || "Thành viên mới",
            availablePoints: Number(res.availablePoints ?? res.points ?? 0) || 0
          });
        }
      } catch {
        // Fallback im lặng nếu lỗi
      }
    }
    fetchLoyalty();
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("washmate_user_profile");
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("userEmail");
    navigate("/dang-nhap");
  };

  const getAvatarLetter = () => {
    if (customerName && typeof customerName === "string" && customerName.length > 0) {
      return customerName.charAt(0).toUpperCase();
    }
    if (customerName && typeof customerName === "object") {
      const str = customerName.name || customerName.full_name || "D";
      return String(str).charAt(0).toUpperCase();
    }
    return "D";
  };

  const renderCustomerName = () => {
    if (typeof customerName === "string") return customerName;
    if (customerName && typeof customerName === "object") {
      return customerName.name || customerName.full_name || "Khách hàng";
    }
    return "Khách hàng";
  };

  return (
    <header className="border-b border-white/40 bg-white/40 backdrop-blur-xl shadow-sm z-30">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <Logo />
          <div className="h-6 w-px bg-border" />
          <span className="text-sm font-medium text-muted-foreground">Khu vực khách hàng</span>
        </div>

        <div className="flex items-center gap-4 relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setShowDropdown(!showDropdown)}
            className={cn(
              "flex items-center gap-3 rounded-full py-1.5 px-3 transition-all duration-200 border cursor-pointer select-none",
              showDropdown
                ? "bg-white/80 border-blue-500/40 shadow-md shadow-blue-500/10"
                : "bg-white/40 border-white/60 hover:bg-white/70 hover:shadow-sm"
            )}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-brand-dark font-bold text-white text-sm shadow-md">
              {getAvatarLetter()}
            </div>
            <div className="text-left hidden md:block">
              <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                {renderCustomerName()}
                <ChevronDown size={16} className={cn("text-muted-foreground transition-transform duration-200", showDropdown && "rotate-180")} />
              </p>
              <p className="text-xs text-muted-foreground">
                Hạng {loyaltyInfo.tierName} • {Number(loyaltyInfo.availablePoints || 0).toLocaleString("vi-VN")} điểm
              </p>
            </div>
          </button>

          {showDropdown && (
            <div className="absolute right-0 top-14 mt-1 w-64 rounded-2xl border border-white/80 bg-white/95 p-2 shadow-2xl backdrop-blur-2xl animate-in fade-in-0 zoom-in-95 z-50">
              <div className="px-3 py-2.5 border-b border-border/40 mb-1 md:hidden">
                <p className="text-sm font-semibold text-foreground">{renderCustomerName()}</p>
                <p className="text-xs text-muted-foreground">
                  Hạng {loyaltyInfo.tierName} • {Number(loyaltyInfo.availablePoints || 0).toLocaleString("vi-VN")} điểm
                </p>
              </div>
              <button
                type="button"
                onClick={() => { setShowDropdown(false); navigate("/khach-hang/thong-bao"); }}
                className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition-all hover:bg-blue-50 hover:text-blue-600"
              >
                <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600">
                  <Bell size={18} />
                  <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-gold" />
                </div>
                <span>Thông báo</span>
              </button>
              <button
                type="button"
                onClick={() => { setShowDropdown(false); navigate("/khach-hang/tai-khoan"); }}
                className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition-all hover:bg-blue-50 hover:text-blue-600"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600">
                  <User size={18} />
                </div>
                <span>Tài khoản của tôi</span>
              </button>
              <button
                type="button"
                onClick={() => { setShowDropdown(false); setShowPasswordModal(true); }}
                className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition-all hover:bg-blue-50 hover:text-blue-600"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600">
                  <Shield size={18} />
                </div>
                <span>Đổi mật khẩu</span>
              </button>
              <div className="my-1 h-px bg-border/40" />
              <button
                type="button"
                onClick={() => { setShowDropdown(false); handleLogout(); }}
                className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-destructive transition-all hover:bg-destructive/10"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                  <LogOut size={18} />
                </div>
                <span>Đăng xuất</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in-0">
          <div className="w-full max-w-md rounded-3xl border border-border bg-white p-6 shadow-2xl animate-in zoom-in-95">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="flex items-center gap-2 text-xl font-extrabold text-foreground">
                  <Shield size={22} className="text-primary" />
                  Bảo mật tài khoản
                </h2>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  Đổi mật khẩu để bảo vệ tài khoản.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowPasswordModal(false)}
                className="rounded-full p-1 text-muted-foreground hover:bg-slate-100 hover:text-foreground transition"
              >
                <X size={20} />
              </button>
            </div>

            {pwStatus && (
              <div
                className={cn(
                  "mb-4 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold",
                  pwStatus === "success"
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-700",
                )}
              >
                {pwStatus === "success" ? <CheckCircle size={16} /> : <XCircle size={16} />}
                {pwMessage}
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-3">
              {pwFields.map(({ label, key }) => (
                <div key={key}>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-muted-foreground">
                    {label}
                  </label>
                  <div className="relative">
                    <input
                      type={showPw[key] ? "text" : "password"}
                      value={pwForm[key]}
                      onChange={(e) => setPwForm((prev) => ({ ...prev, [key]: e.target.value }))}
                      className="w-full rounded-xl border border-border bg-white px-4 py-2.5 pr-11 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
                    />
                    <button
                      type="button"
                      onClick={() => toggleShowPw(key)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
                      aria-label={showPw[key] ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                    >
                      {showPw[key] ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              ))}

              <button
                type="submit"
                className="mt-2 w-full rounded-xl bg-primary py-3 text-sm font-bold text-white shadow-lg shadow-primary/25 transition hover:bg-brand-dark"
              >
                Đổi mật khẩu
              </button>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}

function DashboardSidebar() {
  return (
    <div className="relative w-[88px] shrink-0 z-30">
      <aside className="absolute top-0 left-0 h-full w-[88px] hover:w-64 group transition-all duration-300 ease-in-out border-r border-white/40 bg-white/40 hover:bg-white/60 hover:shadow-2xl backdrop-blur-2xl font-sans overflow-hidden flex flex-col">
        <nav className="p-4 space-y-2 flex-1 overflow-y-auto no-scrollbar">
          {menuItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.end}
              title={item.label}
              className={({ isActive }) =>
                cn(
                  "rounded-2xl p-3.5 flex items-center gap-4 transition-all duration-200",
                  isActive
                    ? "bg-blue-500/15 text-blue-800 shadow-md shadow-blue-500/20 border border-blue-500/30 backdrop-blur-md font-semibold"
                    : "text-slate-500 hover:bg-white/60 hover:text-slate-900",
                )
              }
            >
              <item.icon size={22} className="shrink-0" />
              <span className="whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-medium">
                {item.label}
              </span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </div>
  );
}

function CustomerPortalLayout() {
  return (
    <div className="relative flex h-screen flex-col overflow-hidden">
      {/* Background Image for the whole portal */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img
          src="/images/hero-carwash.png"
          alt="Portal Background"
          className="size-full object-cover opacity-40 grayscale"
        />
        <div className="absolute inset-0 bg-slate-100/70 backdrop-blur-[40px]" />
      </div>

      <div className="relative z-10 flex flex-col h-full w-full">
        <DashboardHeader />
        <div className="flex flex-1 overflow-hidden">
          <DashboardSidebar />
          <main className="flex-1 overflow-auto no-scrollbar">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

// Dòng cực kỳ quan trọng xuất dữ liệu ra ngoài AppRoutes
export default CustomerPortalLayout;