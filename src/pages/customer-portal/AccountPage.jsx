import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  Bell,
  BookOpen,
  Building2,
  Calendar,
  Car,
  CheckCircle,
  Edit3,
  Eye,
  EyeOff,
  Home,
  LogOut,
  Mail,
  MapPin,
  Phone,
  Save,
  Shield,
  Star,
  Trash2,
  User,
  X,
  XCircle,
} from "lucide-react";
import { tiers as membershipTiers } from "@/lib/site-data";
import { tierCodeToBadgeName } from "@/lib/customer-engagement-data";
import { loyaltyMockAccount } from "@/mocks/loyaltyMockData";
import { dashboardCustomer, upcomingBookings, userVehicles } from "@/lib/customer-dashboard-data";
import { TierBadge } from "@/components/site/tier-badge";
import { cn } from "@/lib/utils";

// ── Shared constants ───────────────────────────────────────────
const PROFILE_KEY = "washmate_user_profile";
const NOTIF_KEY = "washmate_notifications";

// Resolve tier object from site-data via loyaltyMockAccount
const currentTierBadgeName =
  tierCodeToBadgeName[loyaltyMockAccount.tier] ?? loyaltyMockAccount.tierName;
const currentTier =
  membershipTiers.find((t) => t.name === currentTierBadgeName) ?? membershipTiers[0];

// ── Helpers ────────────────────────────────────────────────────
function getStoredProfile() {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function getStoredNotifications() {
  try {
    const raw = localStorage.getItem(NOTIF_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

const defaultProfile = {
  name: dashboardCustomer.name,
  email: dashboardCustomer.email,
  phone: "0901 234 567",
  dob: "1995-03-15",
  gender: "Nam",
  address: "123 Nguyễn Trãi",
  district: "Quận 5",
  city: "TP. Hồ Chí Minh",
  carNote: "Xe nhạy cảm với chất tẩy mạnh, ưu tiên dung dịch trung tính",
};

const defaultNotifications = {
  reminderWash: true,
  paymentNotif: true,
  garageOffers: false,
  pointsUpdate: true,
  systemNotif: false,
};

// ── Profile Hero Card ──────────────────────────────────────────
function ProfileHeroCard({ profile }) {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-brand-dark p-6 text-primary-foreground shadow-lg shadow-primary/20">
      {/* Decorative blur */}
      <div className="pointer-events-none absolute -right-10 -top-10 size-64 rounded-full bg-accent/30 blur-3xl" />

      <div className="relative grid gap-5 md:grid-cols-[auto_1fr] md:items-center lg:grid-cols-[auto_1fr_210px]">
        {/* Tier badge + glow */}
        <div className="relative flex justify-center md:justify-start">
          <div
            className="absolute -inset-6 rounded-full blur-3xl opacity-50"
            style={{ backgroundColor: currentTier?.color ?? "#0b8cff" }}
          />
          <div className="relative drop-shadow-[0_0_24px_rgba(255,255,255,0.22)]">
            <TierBadge tier={currentTier} size="lg" />
          </div>
        </div>

        {/* Info column */}
        <div className="space-y-3">
          {/* Name + chips */}
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-2xl font-extrabold">{profile.name}</h2>
            <span className="inline-flex rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold">
              Hạng {loyaltyMockAccount.tierName}
            </span>
            <span className="inline-flex rounded-full bg-green-400/25 px-3 py-1 text-[11px] font-semibold text-green-100">
              ● Đang hoạt động
            </span>
          </div>

          {/* Contact */}
          <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-primary-foreground/75">
            <span className="flex items-center gap-1.5">
              <Mail size={14} className="shrink-0" />
              {profile.email}
            </span>
            {profile.phone && (
              <span className="flex items-center gap-1.5">
                <Phone size={14} className="shrink-0" />
                {profile.phone}
              </span>
            )}
          </div>

          {/* Points */}
          <div>
            <p className="text-sm font-medium text-primary-foreground/70">Điểm khả dụng</p>
            <p className="mt-0.5 text-4xl font-extrabold leading-tight">
              {loyaltyMockAccount.availablePoints.toLocaleString("vi-VN")}
            </p>
          </div>

          {/* Progress – mobile/tablet only; desktop shows in mini panel */}
          <div className="lg:hidden">
            <div className="mb-2 flex justify-between text-xs font-semibold text-primary-foreground/65">
              <span>Hạng {loyaltyMockAccount.tierName}</span>
              <span>
                Còn {loyaltyMockAccount.pointsToNextTier.toLocaleString("vi-VN")} điểm →{" "}
                {loyaltyMockAccount.nextTierName}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full rounded-full bg-white transition-all duration-500"
                style={{ width: `${Math.min(loyaltyMockAccount.progressPercent, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Mini info panel – desktop only */}
        <div className="hidden lg:flex lg:flex-col lg:gap-3">
          <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
            <p className="text-[10px] font-bold uppercase tracking-widest text-primary-foreground/55">
              Gara thường dùng
            </p>
            <div className="mt-1.5 flex items-center gap-1.5">
              <Home size={14} className="shrink-0" />
              <span className="text-sm font-bold">WashMate Quận 7</span>
            </div>
          </div>

          <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
            <p className="text-[10px] font-bold uppercase tracking-widest text-primary-foreground/55">
              Tiến độ lên hạng {loyaltyMockAccount.nextTierName}
            </p>
            <p className="mt-1 text-lg font-extrabold">
              Còn {loyaltyMockAccount.pointsToNextTier.toLocaleString("vi-VN")} điểm
            </p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full rounded-full bg-white/80 transition-all duration-500"
                style={{ width: `${Math.min(loyaltyMockAccount.progressPercent, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Stats Row ──────────────────────────────────────────────────
function StatsRow() {
  const stats = [
    {
      label: "Tổng lịch đã đặt",
      value: upcomingBookings.length + 5,
      icon: BookOpen,
      cls: "text-blue-600 bg-blue-50",
    },
    {
      label: "Xe đang quản lý",
      value: userVehicles.length,
      icon: Car,
      cls: "text-teal-600 bg-teal-50",
    },
    {
      label: "Điểm tích luỹ",
      value: loyaltyMockAccount.availablePoints.toLocaleString("vi-VN"),
      icon: Star,
      cls: "text-amber-600 bg-amber-50",
    },
    {
      label: "Gara thường dùng",
      value: "WashMate Q7",
      icon: Home,
      cls: "text-purple-600 bg-purple-50",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((s) => (
        <div
          key={s.label}
          className="rounded-2xl border border-border bg-white p-4 shadow-sm transition hover:border-primary/30 hover:shadow"
        >
          <div
            className={cn(
              "mb-2 inline-flex h-9 w-9 items-center justify-center rounded-xl",
              s.cls,
            )}
          >
            <s.icon size={18} />
          </div>
          <div className="text-xl font-extrabold text-foreground">{s.value}</div>
          <div className="mt-0.5 text-xs text-muted-foreground">{s.label}</div>
        </div>
      ))}
    </div>
  );
}

// ── Profile fields config ──────────────────────────────────────
const profileFields = [
  { label: "Họ và tên", name: "name", icon: User, type: "text", colSpan: 2 },
  { label: "Email", name: "email", icon: Mail, type: "email", colSpan: 2 },
  { label: "Số điện thoại", name: "phone", icon: Phone, type: "tel" },
  { label: "Ngày sinh", name: "dob", icon: Calendar, type: "date" },
  {
    label: "Giới tính",
    name: "gender",
    icon: User,
    type: "select",
    options: ["Nam", "Nữ", "Khác"],
  },
  { label: "Địa chỉ", name: "address", icon: MapPin, type: "text", colSpan: 2 },
  { label: "Quận/Huyện", name: "district", icon: Building2, type: "text" },
  { label: "Thành phố", name: "city", icon: Building2, type: "text" },
  {
    label: "Ghi chú chăm sóc xe",
    name: "carNote",
    icon: Car,
    type: "textarea",
    colSpan: 3,
  },
];

// colSpan mapping for 3-column info grid (view) / 2-column edit grid (form)
function viewColClass(field) {
  if (field.colSpan === 3 || field.colSpan === 4) return "sm:col-span-2 lg:col-span-3";
  if (field.colSpan === 2) return "sm:col-span-2";
  return "";
}
function editColClass(field) {
  if (field.colSpan === 3 || field.colSpan === 4) return "sm:col-span-2";
  return "";
}

// ── Personal Info Card ─────────────────────────────────────────
function PersonalInfoCard({ profile, onSave }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(profile);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setForm(profile);
  }, [profile]);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSave() {
    // API-ready: replace with API call here; localStorage is the fallback demo
    localStorage.setItem(PROFILE_KEY, JSON.stringify(form));
    window.dispatchEvent(new CustomEvent("washmate-profile-updated"));
    onSave(form);
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  function handleCancel() {
    setForm(profile);
    setEditing(false);
  }

  const inputClass =
    "w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition";

  return (
    <div className="rounded-3xl border border-border bg-white p-5 shadow-sm">
      {/* Card header */}
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold text-foreground">Thông tin cá nhân</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Hồ sơ và thông tin liên hệ của bạn.
          </p>
        </div>

        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-2 rounded-xl border border-primary px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary/5"
          >
            <Edit3 size={15} />
            Chỉnh sửa
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-semibold text-muted-foreground transition hover:bg-secondary"
            >
              <X size={15} />
              Huỷ
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark"
            >
              <Save size={15} />
              Lưu thay đổi
            </button>
          </div>
        )}
      </div>

      {/* Success toast */}
      {saved && (
        <div className="mb-5 flex items-center gap-2 rounded-xl bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
          <CheckCircle size={16} />
          Đã lưu thông tin thành công!
        </div>
      )}

      {/* View mode – clean info grid */}
      {!editing && (
        <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
          {profileFields.map((field) => (
            <div key={field.name} className={viewColClass(field)}>
              <dt className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                <field.icon size={11} />
                {field.label}
              </dt>
              <dd className="text-sm font-semibold text-foreground">
                {form[field.name] || <span className="text-muted-foreground">—</span>}
              </dd>
            </div>
          ))}
        </dl>
      )}

      {/* Edit mode – input grid */}
      {editing && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {profileFields.map((field) => (
            <div key={field.name} className={editColClass(field)}>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                <field.icon size={11} />
                {field.label}
              </label>

              {field.type === "select" ? (
                <select
                  name={field.name}
                  value={form[field.name] ?? ""}
                  onChange={handleChange}
                  className={inputClass}
                >
                  {field.options.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : field.type === "textarea" ? (
                <textarea
                  name={field.name}
                  value={form[field.name] ?? ""}
                  onChange={handleChange}
                  rows={2}
                  className={cn(inputClass, "resize-none")}
                />
              ) : (
                <input
                  type={field.type}
                  name={field.name}
                  value={form[field.name] ?? ""}
                  onChange={handleChange}
                  className={inputClass}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Security Card ──────────────────────────────────────────────
function SecurityCard() {
  const [form, setForm] = useState({ current: "", newPw: "", confirm: "" });
  const [show, setShow] = useState({ current: false, newPw: false, confirm: false });
  const [status, setStatus] = useState(null); // "success" | "error"
  const [message, setMessage] = useState("");

  function toggleShow(key) {
    setShow((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function validate() {
    if (!form.current) return "Vui lòng nhập mật khẩu hiện tại.";
    if (form.newPw.length < 8) return "Mật khẩu mới phải có ít nhất 8 ký tự.";
    if (form.newPw !== form.confirm) return "Xác nhận mật khẩu không khớp.";
    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const err = validate();
    if (err) {
      setStatus("error");
      setMessage(err);
      return;
    }
    // API-ready: await authApi.changePassword({ currentPassword: form.current, newPassword: form.newPw });
    setStatus("success");
    setMessage("Mật khẩu đã được đổi thành công!");
    setForm({ current: "", newPw: "", confirm: "" });
    setTimeout(() => setStatus(null), 4000);
  }

  const pwFields = [
    { label: "Mật khẩu hiện tại", key: "current" },
    { label: "Mật khẩu mới", key: "newPw" },
    { label: "Xác nhận mật khẩu mới", key: "confirm" },
  ];

  return (
    <div className="rounded-3xl border border-border bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="flex items-center gap-2 text-lg font-extrabold text-foreground">
          <Shield size={19} className="text-primary" />
          Bảo mật tài khoản
        </h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Đổi mật khẩu để bảo vệ tài khoản.
        </p>
      </div>

      {status && (
        <div
          className={cn(
            "mb-4 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold",
            status === "success"
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700",
          )}
        >
          {status === "success" ? <CheckCircle size={16} /> : <XCircle size={16} />}
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        {pwFields.map(({ label, key }) => (
          <div key={key}>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-muted-foreground">
              {label}
            </label>
            <div className="relative">
              <input
                type={show[key] ? "text" : "password"}
                value={form[key]}
                onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
                className="w-full rounded-xl border border-border bg-white px-4 py-2.5 pr-11 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
              />
              <button
                type="button"
                onClick={() => toggleShow(key)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
                aria-label={show[key] ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {show[key] ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
        ))}

        <button
          type="submit"
          className="mt-1 w-full rounded-xl bg-primary py-2.5 text-sm font-bold text-white transition hover:bg-brand-dark"
        >
          Đổi mật khẩu
        </button>
      </form>
    </div>
  );
}

// ── Notifications Card ─────────────────────────────────────────
const notifItems = [
  {
    key: "reminderWash",
    label: "Nhắc lịch rửa xe",
    desc: "Nhắc khi xe lâu chưa được rửa",
  },
  {
    key: "paymentNotif",
    label: "Thông báo thanh toán",
    desc: "Xác nhận và nhắc nhở thanh toán",
  },
  {
    key: "garageOffers",
    label: "Ưu đãi theo gara",
    desc: "Khuyến mãi từ gara yêu thích",
  },
  {
    key: "pointsUpdate",
    label: "Cập nhật điểm thưởng",
    desc: "Khi điểm được cộng hoặc trừ",
  },
  {
    key: "systemNotif",
    label: "Thông báo hệ thống",
    desc: "Cập nhật chính sách và hệ thống",
  },
];

function NotificationsCard() {
  const [prefs, setPrefs] = useState(getStoredNotifications() ?? defaultNotifications);

  function toggle(key) {
    setPrefs((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      localStorage.setItem(NOTIF_KEY, JSON.stringify(next));
      return next;
    });
  }

  return (
    <div className="rounded-3xl border border-border bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="flex items-center gap-2 text-lg font-extrabold text-foreground">
          <Bell size={19} className="text-primary" />
          Tuỳ chọn thông báo
        </h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Chọn loại thông báo bạn muốn nhận.
        </p>
      </div>

      {/* 2-column toggle grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {notifItems.map(({ key, label, desc }) => (
          <div
            key={key}
            className="flex items-center justify-between gap-3 rounded-2xl border border-border/60 bg-secondary/30 px-4 py-3.5 transition hover:bg-secondary/60"
          >
            <div className="min-w-0">
              <div className="text-sm font-semibold text-foreground">{label}</div>
              <div className="truncate text-xs text-muted-foreground">{desc}</div>
            </div>

            {/* Toggle switch */}
            <button
              type="button"
              role="switch"
              aria-checked={prefs[key]}
              onClick={() => toggle(key)}
              className={cn(
                "relative h-6 w-11 shrink-0 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30",
                prefs[key] ? "bg-primary" : "bg-border",
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform",
                  prefs[key] ? "translate-x-5" : "translate-x-0.5",
                )}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Session Management Card ────────────────────────────────────
function SessionCard() {
  const navigate = useNavigate();
  const [cleared, setCleared] = useState(false);

  function handleLogout() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userEmail");
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("userEmail");
    navigate("/dang-nhap");
  }

  function handleClearDemo() {
    localStorage.removeItem(PROFILE_KEY);
    localStorage.removeItem(NOTIF_KEY);
    setCleared(true);
    setTimeout(() => window.location.reload(), 1500);
  }

  return (
    <div className="rounded-3xl border border-border bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="text-lg font-extrabold text-foreground">Quản lý phiên đăng nhập</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Đăng xuất hoặc đặt lại dữ liệu demo.
        </p>
      </div>

      {/* Soft warning notice */}
      <div className="mb-4 flex items-start gap-3 rounded-2xl bg-amber-50 px-4 py-3">
        <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-500" />
        <p className="text-xs font-medium text-amber-700">
          Đăng xuất sẽ kết thúc phiên làm việc hiện tại. Xoá dữ liệu demo sẽ đặt lại thông tin
          hồ sơ và cài đặt về mặc định.
        </p>
      </div>

      {cleared && (
        <div className="mb-4 flex items-center gap-2 rounded-xl bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
          <CheckCircle size={16} />
          Đã xoá dữ liệu demo. Đang tải lại...
        </div>
      )}

      <div className="flex flex-col gap-3">
        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-500 py-2.5 text-sm font-bold text-white transition hover:bg-red-600"
        >
          <LogOut size={16} />
          Đăng xuất khỏi thiết bị này
        </button>
        <button
          onClick={handleClearDemo}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-border py-2.5 text-sm font-bold text-muted-foreground transition hover:bg-secondary"
        >
          <Trash2 size={16} />
          Xoá dữ liệu demo local
        </button>
      </div>
    </div>
  );
}

// ── Main AccountPage ───────────────────────────────────────────
export default function AccountPage() {
  const [profile, setProfile] = useState(() => {
    const stored = getStoredProfile();
    if (stored) return stored;
    // Write on first visit so header immediately reads the same name
    localStorage.setItem(PROFILE_KEY, JSON.stringify(defaultProfile));
    window.dispatchEvent(new CustomEvent("washmate-profile-updated"));
    return defaultProfile;
  });

  const handleProfileSave = useCallback((newProfile) => {
    setProfile(newProfile);
  }, []);

  return (
    <div className="mx-auto max-w-7xl space-y-4 p-5 lg:p-7">
      {/* Page header */}
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Tài khoản</p>
        <h1 className="mt-1 text-2xl font-extrabold leading-tight text-foreground">
          Tài khoản của tôi
        </h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Quản lý thông tin cá nhân, bảo mật và tuỳ chọn nhận thông báo.
        </p>
      </div>

      {/* Hero profile card */}
      <ProfileHeroCard profile={profile} />

      {/* Stats row */}
      <StatsRow />

      {/* Unified 2-col layout: left 2/3 stacked, right 1/3 stacked */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <PersonalInfoCard profile={profile} onSave={handleProfileSave} />
          <NotificationsCard />
        </div>
        <div className="space-y-4">
          <SecurityCard />
          <SessionCard />
        </div>
      </div>
    </div>
  );
}
