import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  BookOpen,
  Car,
  CheckCircle,
  Crown,
  Edit3,
  Home,
  LogOut,
  Mail,
  MapPin,
  Phone,
  Save,
  Sparkles,
  User,
  X,
} from "lucide-react";
import PageContainer from "@/components/shared/PageContainer";
import PageHeader from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/toast";
import { jwtDecode } from "jwt-decode";
import { userApi } from "@/api/userApi";
import { loyaltyApi } from "@/api/loyaltyApi";
import { vehicleApi } from "@/api/vehicleApi";
import { loadCustomerBookingList } from "@/lib/customer-bookings";
import { friendlyError } from "@/lib/api-error";
import { formatNumber } from "@/lib/format";
import { TierBadge, tierLabel, tierTheme } from "@/components/customer-portal/tier-badge";
import { computeTierProgress, normalizeLoyaltyAccount, normalizeTiers } from "@/lib/customer-loyalty-data";

const PROFILE_KEY = "washmate_user_profile";
const fmt = (n) => new Intl.NumberFormat("vi-VN").format(Number(n || 0));

function asList(res) {
  if (Array.isArray(res)) return res;
  return res?.data ?? res?.content ?? [];
}

function getStoredProfile() {
  try {
    return JSON.parse(localStorage.getItem(PROFILE_KEY) || "null");
  } catch {
    return null;
  }
}

function getInitialProfile() {
  let name = "";
  let email = "";
  try {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (token) {
      const decoded = jwtDecode(token);
      email = decoded.email || decoded.sub || "";
      name = decoded.full_name || decoded.fullName || decoded.name || email.split("@")[0] || "";
    }
  } catch {
    /* token lỗi → để trống, getMe sẽ điền */
  }
  return getStoredProfile() || { name, email, phone: "", address: "" };
}

// ── Hero: hạng thành viên + điểm THẬT (đồng bộ tông màu theo hạng) ──
function ProfileHeroCard({ profile, loyalty, tiers, status }) {
  const progress = computeTierProgress(loyalty, tiers);
  const theme = tierTheme(loyalty?.tierName);

  return (
    <section className={cn("overflow-hidden rounded-2xl border p-6 shadow-card sm:p-8", theme.card, theme.border)}>
      <div className="grid gap-6 md:grid-cols-[auto_1fr] md:items-center lg:grid-cols-[auto_1fr_220px]">
        <div className="flex justify-center md:justify-start">
          <TierBadge name={loyalty?.tierName} size="size-28" iconSize={48} className="rounded-3xl shadow-card" />
        </div>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-3xl font-extrabold">{profile.name || "Khách hàng"}</h2>
            <span className={cn("inline-flex rounded-full px-3.5 py-1.5 text-xs font-bold tracking-wide", theme.bg, theme.icon)}>
              Hạng {loyalty ? tierLabel(loyalty.tierName) : "—"}
            </span>
            {status !== "INACTIVE" && (
              <span className="inline-flex rounded-full bg-success-container px-3.5 py-1.5 text-xs font-semibold text-success">
                ● Đang hoạt động
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
            {profile.email && (
              <span className="flex items-center gap-2"><Mail size={16} className="shrink-0" />{profile.email}</span>
            )}
            {profile.phone && (
              <span className="flex items-center gap-2"><Phone size={16} className="shrink-0" />{profile.phone}</span>
            )}
          </div>

          <div className="pt-2">
            <p className="text-sm font-medium text-muted-foreground">Điểm khả dụng</p>
            <p className={cn("mt-1 text-4xl font-extrabold leading-tight", theme.icon)}>
              {loyalty ? fmt(loyalty.availablePoints) : "—"}
            </p>
          </div>
        </div>

        {/* Panel phải: gara + tiến độ (THẬT) */}
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-black/5 bg-card/70 p-5">
            <p className="mb-2 text-xs font-semibold text-muted-foreground">Gara thường dùng</p>
            <div className="flex items-center gap-2">
              <Home size={16} className={cn("shrink-0", theme.icon)} />
              <span className="text-sm font-bold text-foreground">{loyalty?.garageName || "Chưa có"}</span>
            </div>
          </div>

          <div className="rounded-2xl border border-black/5 bg-card/70 p-5">
            {!progress.hasData ? (
              <p className="text-sm text-muted-foreground">Chưa có dữ liệu tiến độ.</p>
            ) : progress.isMax ? (
              <p className={cn("inline-flex items-center gap-1.5 text-sm font-bold", theme.icon)}>
                <Crown size={16} /> Bạn đang ở hạng cao nhất
              </p>
            ) : (
              <>
                <p className="mb-2 text-xs font-semibold text-muted-foreground">
                  Tiến độ lên hạng {tierLabel(progress.next.name)}
                </p>
                <p className="text-lg font-extrabold text-foreground">Còn {fmt(progress.pointsToNext)} điểm</p>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-black/5">
                  <div className={cn("h-full rounded-full transition-all", theme.bar)} style={{ width: `${progress.progressPercent}%` }} />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Stats: dữ liệu THẬT ─────────────────────────────────────────
function StatsRow({ loyalty, bookingsCount, vehiclesCount }) {
  const stats = [
    { label: "Tổng lịch đã đặt", value: formatNumber(bookingsCount), icon: BookOpen, cls: "text-primary bg-primary-container" },
    { label: "Xe đang quản lý", value: formatNumber(vehiclesCount), icon: Car, cls: "text-accent-cyan bg-accent-cyan/10" },
    { label: "Điểm tích luỹ", value: loyalty ? fmt(loyalty.totalPoints) : "—", icon: Sparkles, cls: "text-warning bg-warning-container" },
    { label: "Gara thường dùng", value: loyalty?.garageName || "—", icon: Home, cls: "text-accent-violet bg-accent-violet/10" },
  ];
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((s) => (
        <div key={s.label} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <div className={cn("mb-2 inline-flex h-9 w-9 items-center justify-center rounded-xl", s.cls)}>
            <s.icon size={18} />
          </div>
          <div className="truncate text-xl font-extrabold text-foreground">{s.value}</div>
          <div className="mt-0.5 text-xs text-muted-foreground">{s.label}</div>
        </div>
      ))}
    </div>
  );
}

// ── Thông tin cá nhân: chỉ field backend hỗ trợ (fullName, phone, address) ──
const profileFields = [
  { label: "Họ và tên", name: "name", icon: User, type: "text", editable: true },
  { label: "Email", name: "email", icon: Mail, type: "email", editable: false },
  { label: "Số điện thoại", name: "phone", icon: Phone, type: "tel", editable: true },
  { label: "Địa chỉ", name: "address", icon: MapPin, type: "text", editable: true, colSpan: 2 },
];

function PersonalInfoCard({ profile, onSave }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(profile);
  const [saving, setSaving] = useState(false);

  useEffect(() => setForm(profile), [profile]);

  const change = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  async function save() {
    setSaving(true);
    const ok = await onSave(form);
    setSaving(false);
    if (ok) setEditing(false);
  }

  const inputClass =
    "w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground outline-none focus-visible:border-ring disabled:bg-muted disabled:text-muted-foreground";

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold text-foreground">Thông tin cá nhân</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">Hồ sơ và thông tin liên hệ của bạn.</p>
        </div>
        {!editing ? (
          <Button variant="outline" size="sm" onClick={() => setEditing(true)} className="border-primary text-primary hover:bg-primary/5">
            <Edit3 /> Chỉnh sửa
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => { setForm(profile); setEditing(false); }} disabled={saving}>
              <X /> Huỷ
            </Button>
            <Button size="sm" onClick={save} disabled={saving}>
              <Save /> {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </div>
        )}
      </div>

      {!editing ? (
        <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
          {profileFields.map((f) => (
            <div key={f.name} className={f.colSpan === 2 ? "sm:col-span-2" : ""}>
              <dt className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                <f.icon size={14} /> {f.label}
              </dt>
              <dd className="text-sm font-semibold text-foreground">
                {form[f.name] || <span className="text-muted-foreground">—</span>}
              </dd>
            </div>
          ))}
        </dl>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {profileFields.map((f) => (
            <div key={f.name} className={f.colSpan === 2 ? "sm:col-span-2" : ""}>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                <f.icon size={14} /> {f.label}
                {!f.editable && <span className="text-neutral-muted">(không đổi được)</span>}
              </label>
              <input
                type={f.type}
                name={f.name}
                value={form[f.name] ?? ""}
                onChange={change}
                disabled={!f.editable}
                className={inputClass}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Phiên đăng nhập ─────────────────────────────────────────────
function SessionCard() {
  const navigate = useNavigate();
  function logout() {
    ["token", "accessToken", "refreshToken", "currentUser", "roles", "garageIds", "userEmail", PROFILE_KEY].forEach((k) => {
      sessionStorage.removeItem(k);
      localStorage.removeItem(k);
    });
    navigate("/dang-nhap");
  }
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <h2 className="text-lg font-extrabold text-foreground">Phiên đăng nhập</h2>
      <p className="mt-0.5 text-sm text-muted-foreground">Đăng xuất khỏi thiết bị này.</p>
      <div className="mt-4 flex items-start gap-3 rounded-2xl bg-warning-container px-4 py-3">
        <AlertTriangle size={16} className="mt-0.5 shrink-0 text-warning" />
        <p className="text-xs font-medium text-warning">Đăng xuất sẽ kết thúc phiên làm việc hiện tại trên thiết bị này.</p>
      </div>
      <Button onClick={logout} className="mt-4 w-full bg-critical text-white hover:bg-critical/90">
        <LogOut /> Đăng xuất
      </Button>
    </div>
  );
}

// ── Trang chính ─────────────────────────────────────────────────
export default function AccountPage() {
  const [profile, setProfile] = useState(getInitialProfile);
  const [loyalty, setLoyalty] = useState(null);
  const [tiers, setTiers] = useState([]);
  const [bookingsCount, setBookingsCount] = useState(0);
  const [vehiclesCount, setVehiclesCount] = useState(0);
  const [status, setStatus] = useState("ACTIVE");

  useEffect(() => {
    // Hồ sơ THẬT từ /users/me
    userApi.getMe().then((res) => {
      if (!res) return;
      setStatus(res.status || "ACTIVE");
      setProfile((prev) => {
        const next = {
          ...prev,
          name: res.fullName || res.name || prev.name,
          email: res.email || prev.email,
          phone: res.phone || prev.phone,
          address: res.address || prev.address || "",
        };
        localStorage.setItem(PROFILE_KEY, JSON.stringify(next));
        window.dispatchEvent(new CustomEvent("washmate-profile-updated"));
        return next;
      });
    }).catch(() => {});

    // Loyalty + hạng + đếm lịch/xe THẬT
    (async () => {
      const [lRes, bRes, vRes] = await Promise.allSettled([
        loyaltyApi.getMyLoyalty(),
        loadCustomerBookingList(),
        vehicleApi.getMyVehicles(),
      ]);
      const acc = lRes.status === "fulfilled" ? normalizeLoyaltyAccount(lRes.value) : null;
      setLoyalty(acc);
      if (acc?.garageId != null) {
        try {
          setTiers(normalizeTiers(await loyaltyApi.getCustomerTiers(acc.garageId)));
        } catch {
          setTiers([]);
        }
      }
      setBookingsCount(bRes.status === "fulfilled" ? bRes.value.bookings.length : 0);
      setVehiclesCount(vRes.status === "fulfilled" ? asList(vRes.value).length : 0);
    })();
  }, []);

  const handleSave = useCallback(async (form) => {
    try {
      await userApi.updateMe({ fullName: form.name, phone: form.phone || "", address: form.address || "" });
      setProfile(form);
      localStorage.setItem(PROFILE_KEY, JSON.stringify(form));
      window.dispatchEvent(new CustomEvent("washmate-profile-updated"));
      toast.success("Đã cập nhật thông tin cá nhân.");
      return true;
    } catch (err) {
      toast.error("Không lưu được thông tin.", { description: friendlyError(err, "Vui lòng thử lại sau.") });
      return false;
    }
  }, []);

  return (
    <PageContainer variant="customer">
      <PageHeader
        title="Tài khoản của tôi"
        description="Quản lý thông tin cá nhân và phiên đăng nhập của bạn."
      />

      <ProfileHeroCard profile={profile} loyalty={loyalty} tiers={tiers} status={status} />
      <StatsRow loyalty={loyalty} bookingsCount={bookingsCount} vehiclesCount={vehiclesCount} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PersonalInfoCard profile={profile} onSave={handleSave} />
        </div>
        <SessionCard />
      </div>
    </PageContainer>
  );
}
