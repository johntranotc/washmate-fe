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

import { TierBadge } from "@/components/site/tier-badge";
import { cn } from "@/lib/utils";
import { jwtDecode } from "jwt-decode";

// ── Shared constants ───────────────────────────────────────────
const PROFILE_KEY = "washmate_user_profile";
const NOTIF_KEY = "washmate_notifications";

const loyaltyData = {
  tier: "BRONZE",
  tierName: "Đồng",
  nextTierName: "Bạc",
  availablePoints: 0,
  pointsToNextTier: 500,
  progressPercent: 0,
};

const currentTierBadgeName = tierCodeToBadgeName[loyaltyData.tier] ?? loyaltyData.tierName;
const currentTier = membershipTiers.find((t) => t.name.toLowerCase() === currentTierBadgeName?.toLowerCase()) ?? membershipTiers[0];

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

function getEmptyProfile() {
  let name = "";
  let email = "";
  try {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = jwtDecode(token);
      email = decoded.email || decoded.sub || "";
      name = decoded.full_name || decoded.fullName || decoded.name || email.split("@")[0] || "";
    }
  } catch (e) {}
  return {
    name, email, phone: "", dob: "", gender: "Nam", address: "", district: "", city: "", carNote: ""
  };
}

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
    <section className="relative overflow-hidden rounded-[2rem] bg-slate-900/60 backdrop-blur-xl border border-white/10 p-8 text-white shadow-2xl">
      {/* Decorative blur */}
      <div className="pointer-events-none absolute -right-10 -top-10 size-64 rounded-full bg-blue-500/20 blur-[80px]" />
      <div className="pointer-events-none absolute -left-10 -bottom-10 size-64 rounded-full bg-purple-500/20 blur-[80px]" />

      <div className="relative grid gap-6 md:grid-cols-[auto_1fr] md:items-center lg:grid-cols-[auto_1fr_210px] z-10">
        {/* Tier badge + glow */}
        <div className="relative flex justify-center md:justify-start">
          <div
            className="absolute -inset-6 rounded-full blur-[40px] opacity-40"
            style={{ backgroundColor: currentTier?.color ?? "#0b8cff" }}
          />
          <div className="relative drop-shadow-2xl">
            <TierBadge tier={currentTier} size="lg" />
          </div>
        </div>

        {/* Info column */}
        <div className="space-y-4">
          {/* Name + chips */}
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-3xl font-extrabold">{profile.name}</h2>
            <span className="inline-flex rounded-full bg-white/10 border border-white/20 shadow-inner px-4 py-1.5 text-[12px] font-bold tracking-wide">
              Hạng {loyaltyData.tierName}
            </span>
            <span className="inline-flex rounded-full bg-green-500/20 border border-green-500/30 px-4 py-1.5 text-[12px] font-semibold text-green-300">
              ● Đang hoạt động
            </span>
          </div>

          {/* Contact */}
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-300">
            <span className="flex items-center gap-2">
              <Mail size={16} className="shrink-0 text-slate-400" />
              {profile.email}
            </span>
            {profile.phone && (
              <span className="flex items-center gap-2">
                <Phone size={16} className="shrink-0 text-slate-400" />
                {profile.phone}
              </span>
            )}
          </div>

          {/* Points */}
          <div className="pt-2">
            <p className="text-sm font-medium text-slate-400">Điểm khả dụng</p>
            <p className="mt-1 text-4xl font-extrabold leading-tight text-white drop-shadow-md">
              {loyaltyData.availablePoints.toLocaleString("vi-VN")}
            </p>
          </div>

          {/* Progress – mobile/tablet only; desktop shows in mini panel */}
          <div className="lg:hidden pt-2">
            <div className="mb-2 flex justify-between text-xs font-semibold text-slate-300">
              <span>Hạng {loyaltyData.tierName}</span>
              <span>
                Còn {loyaltyData.pointsToNextTier.toLocaleString("vi-VN")} điểm →{" "}
                {loyaltyData.nextTierName}
              </span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-white/10 border border-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-400 to-indigo-400 shadow-[0_0_10px_rgba(96,165,250,0.5)] transition-all duration-500"
                style={{ width: `${Math.min(loyaltyData.progressPercent, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Mini info panel – desktop only */}
        <div className="hidden lg:flex lg:flex-col lg:gap-4">
          <div className="rounded-2xl bg-white/5 border border-white/10 p-5 backdrop-blur-md hover:bg-white/10 transition-colors duration-300">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
              Gara thường dùng
            </p>
            <div className="flex items-center gap-2">
              <Home size={16} className="shrink-0 text-blue-400" />
              <span className="text-sm font-bold text-slate-100">WashMate Quận 7</span>
            </div>
          </div>

          <div className="rounded-2xl bg-white/5 border border-white/10 p-5 backdrop-blur-md hover:bg-white/10 transition-colors duration-300">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
              Tiến độ lên hạng {loyaltyData.nextTierName}
            </p>
            <p className="text-lg font-extrabold text-white">
              Còn {loyaltyData.pointsToNextTier.toLocaleString("vi-VN")} điểm
            </p>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10 border border-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-400 to-indigo-400 shadow-[0_0_10px_rgba(96,165,250,0.5)] transition-all duration-500"
                style={{ width: `${Math.min(loyaltyData.progressPercent, 100)}%` }}
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
      value: 0,
      icon: BookOpen,
      cls: "text-blue-600 bg-blue-50",
    },
    {
      label: "Xe đang quản lý",
      value: 0,
      icon: Car,
      cls: "text-teal-600 bg-teal-50",
    },
    {
      label: "Điểm tích luỹ",
      value: loyaltyData.availablePoints.toLocaleString("vi-VN"),
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
                "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30",
                prefs[key] ? "bg-primary" : "bg-border",
              )}
            >
              <span
                className={cn(
                  "inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform",
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
    ["token", "accessToken", "refreshToken", "currentUser", "roles", "garageIds", "userEmail"].forEach((key) => {
      sessionStorage.removeItem(key);
      localStorage.removeItem(key);
    });
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

import { userApi } from "@/api/userApi";

// ── Main AccountPage ───────────────────────────────────────────
export default function AccountPage() {
  const [profile, setProfile] = useState(() => {
    let stored = getStoredProfile();
    // Bỏ qua dữ liệu ảo cũ nếu người dùng chưa xoá local storage
    if (stored && stored.email === "khachhang@washmate.vn" && stored.phone === "0901 234 567") {
      stored = null;
    }
    if (stored) return stored;
    // Write on first visit so header immediately reads the same name
    const initial = getEmptyProfile();
    localStorage.setItem(PROFILE_KEY, JSON.stringify(initial));
    window.dispatchEvent(new CustomEvent("washmate-profile-updated"));
    return initial;
  });

  useEffect(() => {
    userApi.getMe().then((res) => {
      if (res) {
        setProfile((prev) => {
          const next = {
            ...prev,
            name: res.fullName || res.name || prev.name,
            email: res.email || prev.email,
            phone: res.phone || prev.phone,
          };
          localStorage.setItem(PROFILE_KEY, JSON.stringify(next));
          window.dispatchEvent(new CustomEvent("washmate-profile-updated"));
          return next;
        });
      }
    }).catch((err) => console.error("Lấy thông tin cá nhân lỗi:", err));
  }, []);

  const handleProfileSave = useCallback(async (newProfile) => {
    try {
      await userApi.updateMe({
        fullName: newProfile.name,
        phone: newProfile.phone || "",
      });
      setProfile(newProfile);
      localStorage.setItem(PROFILE_KEY, JSON.stringify(newProfile));
      window.dispatchEvent(new CustomEvent("washmate-profile-updated"));
    } catch (err) {
      console.error("Lỗi cập nhật API:", err);
      // Vẫn lưu local nếu muốn
      setProfile(newProfile);
      localStorage.setItem(PROFILE_KEY, JSON.stringify(newProfile));
      window.dispatchEvent(new CustomEvent("washmate-profile-updated"));
    }
  }, []);

  return (
    <div className="mx-auto max-w-7xl space-y-4 p-5 lg:p-7">
      {/* Page header */}
      <header className="bg-white/40 backdrop-blur-xl border border-white/50 p-6 sm:p-8 rounded-[2rem] shadow-sm mb-6">
        <span className="inline-block rounded-full bg-blue-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-700 mb-3">Tài khoản</span>
        <h1 className="text-3xl font-extrabold leading-tight text-slate-900">
          Tài khoản của tôi
        </h1>
        <p className="mt-2 text-sm font-medium text-slate-600">
          Quản lý thông tin cá nhân, bảo mật và tuỳ chọn nhận thông báo.
        </p>
      </header>

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
          <SessionCard />
        </div>
      </div>
    </div>
  );
}
