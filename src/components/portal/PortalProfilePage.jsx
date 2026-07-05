import { useEffect, useState } from "react";
import { ArrowLeft, Check, Pencil, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { userApi } from "../../api/userApi";
import { Button } from "@/components/ui/button";

/**
 * PortalProfilePage — trang thông tin tài khoản dùng chung cho Admin + Staff.
 * 
 * BE endpoints:
 *   GET  /api/users/me  → MeResponse { id, email, fullName, phone, status, roles, garageIds }
 *   PUT  /api/users/me  → UpdateProfileRequest { fullName, phone }
 */
export default function PortalProfilePage({ backPath, role }) {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ fullName: "", phone: "", address: "" });
  const [formError, setFormError] = useState({});
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Màu role badge
  const roleColors = {
    ADMIN: "bg-primary-container text-primary-strong",
    STAFF: "bg-accent-cyan/15 text-accent-cyan",
    CUSTOMER: "bg-success-container text-success",
  };

  useEffect(() => {
    setLoading(true);
    userApi
      .getMe()
      .then((data) => {
        setProfile(data);
        setForm({ fullName: data.fullName || "", phone: data.phone || "", address: data.address || "" });
        // Sync localStorage
        localStorage.setItem("currentUser", JSON.stringify(data));
      })
      .catch((err) => {
        setError(err?.message || "Không thể tải thông tin tài khoản.");
        // Fallback từ localStorage nếu có
        try {
          const cached = JSON.parse(localStorage.getItem("currentUser") || "{}");
          if (cached?.email) {
            setProfile(cached);
            setForm({ fullName: cached.fullName || "", phone: cached.phone || "", address: cached.address || "" });
            setError(null);
          }
        } catch {
          // nothing
        }
      })
      .finally(() => setLoading(false));
  }, []);

  function validate() {
    const errs = {};
    if (!form.fullName.trim()) errs.fullName = "Họ tên không được để trống.";
    if (!form.phone.trim()) errs.phone = "Số điện thoại không được để trống.";
    else if (!/^[0-9+\-\s]{8,15}$/.test(form.phone.trim())) errs.phone = "Số điện thoại không hợp lệ.";
    return errs;
  }

  async function handleSave(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setFormError(errs); return; }
    
    if (avatarFile) {
      setFormError({ general: "BE chưa hỗ trợ upload avatar (chưa có endpoint)." });
      return;
    }
    
    setFormError({});
    setSaving(true);
    try {
      const updated = await userApi.updateMe({ 
        fullName: form.fullName.trim(), 
        phone: form.phone.trim(),
        address: form.address?.trim()
      });
      setProfile(updated);
      localStorage.setItem("currentUser", JSON.stringify(updated));
      setSaveSuccess(true);
      setEditing(false);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setFormError({ general: err?.message || "Không thể lưu thay đổi. Vui lòng thử lại." });
    } finally {
      setSaving(false);
    }
  }

  function cancelEdit() {
    setEditing(false);
    setFormError({});
    setAvatarFile(null);
    setAvatarPreview(null);
    if (profile) setForm({ fullName: profile.fullName || "", phone: profile.phone || "", address: profile.address || "" });
  }

  const displayRoles = (() => {
    let r = [];
    if (Array.isArray(profile?.roles)) r = profile.roles;
    else if (profile?.role) r = [profile.role];
    return r;
  })();
  const avatarLetter = (profile?.fullName || "U").charAt(0).toUpperCase();

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex items-center gap-3">
        <Button variant="outline" size="icon-sm" onClick={() => navigate(backPath)} aria-label="Quay lại">
          <ArrowLeft />
        </Button>
        <div>
          <p className="text-xs font-semibold text-primary">
            {role === "ADMIN" ? "Quản trị viên" : "Nhân viên"}
          </p>
          <h1 className="text-2xl font-extrabold text-foreground">Thông tin tài khoản</h1>
        </div>
      </header>

      {/* Success toast */}
      {saveSuccess && (
        <div className="flex items-center gap-2 rounded-2xl border border-success/25 bg-success-container px-4 py-3 text-sm font-semibold text-success">
          <Check size={16} />
          Cập nhật thông tin thành công!
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
          Đang tải thông tin tài khoản...
        </div>
      ) : error && !profile ? (
        <div className="rounded-2xl border border-critical/25 bg-critical-container p-10 text-center text-sm text-critical">
          {error}
        </div>
      ) : profile ? (
        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          {/* Avatar card */}
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card p-6 text-center">
            <div className="relative group">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent-cyan text-4xl font-extrabold text-white overflow-hidden">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="h-full w-full object-cover" />
                ) : profile.avatarUrl ? (
                  <img src={profile.avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  avatarLetter
                )}
              </div>
              {editing && (
                <label className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-xs font-semibold">Đổi ảnh</span>
                  <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                </label>
              )}
            </div>
            <div>
              <p className="text-base font-extrabold text-foreground">{profile.fullName || "Chưa cập nhật"}</p>
              <p className="mt-1 text-sm text-muted-foreground">{profile.email}</p>
            </div>
            <div className="flex flex-wrap justify-center gap-1.5">
              {displayRoles.map((r) => (
                <span key={r} className={`rounded-full px-3 py-1 text-xs font-bold ${roleColors[r] || "bg-muted text-muted-foreground"}`}>
                  {r}
                </span>
              ))}
            </div>
            <div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ${
                  profile.status === "ACTIVE"
                    ? "bg-success-container text-success"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {profile.status || "–"}
              </span>
            </div>
          </div>

          {/* Info + Edit card */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-extrabold text-foreground">Chi tiết thông tin</h2>
              {!editing && (
                <Button variant="outline" size="sm" onClick={() => setEditing(true)} className="text-xs text-muted-foreground">
                  <Pencil />
                  Chỉnh sửa
                </Button>
              )}
            </div>

            {!editing ? (
              /* View mode */
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {[
                  ["Mã tài khoản", profile.id ? `WM-USER-${String(profile.id).padStart(8, '0')}` : "–"],
                  ["Email", profile.email ?? "–"],
                  ["Họ và tên", profile.fullName || "Chưa cập nhật"],
                  ["Số điện thoại", profile.phone || "Chưa cập nhật"],
                  ["Địa chỉ", profile.address || "Chưa cập nhật"],
                  ["Trạng thái", profile.status || "–"],
                  ["Vai trò", displayRoles.join(", ") || "–"],
                  ...(profile.garageIds?.length ? [["Gara phụ trách", profile.garageIds.join(", ")]] : []),
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl bg-surface p-4">
                    <p className="text-xs font-semibold text-neutral-muted">{label}</p>
                    <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
                  </div>
                ))}
              </div>
            ) : (
              /* Edit mode */
              <form onSubmit={handleSave} className="mt-5 space-y-4">
                {formError.general && (
                  <p className="rounded-xl border border-critical/25 bg-critical-container px-4 py-3 text-sm text-critical">
                    {formError.general}
                  </p>
                )}

                {/* Email — readonly */}
                <div>
                  <label className="block text-xs font-bold text-muted-foreground">Email</label>
                  <input
                    disabled
                    value={profile.email || ""}
                    className="mt-1.5 h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm text-muted-foreground cursor-not-allowed"
                  />
                  <p className="mt-1 text-xs text-neutral-muted">Email không thể thay đổi.</p>
                </div>

                {/* Họ và tên */}
                <div>
                  <label className="block text-xs font-bold text-muted-foreground">
                    Họ và tên <span className="text-critical">*</span>
                  </label>
                  <input
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    placeholder="Nhập họ và tên"
                    className={`mt-1.5 h-11 w-full rounded-xl border px-3 text-sm outline-none focus:border-primary transition-colors ${
                      formError.fullName ? "border-critical bg-critical-container" : "border-border bg-card"
                    }`}
                  />
                  {formError.fullName && (
                    <p className="mt-1 text-xs text-critical">{formError.fullName}</p>
                  )}
                </div>

                {/* Số điện thoại */}
                <div>
                  <label className="block text-xs font-bold text-muted-foreground">
                    Số điện thoại <span className="text-critical">*</span>
                  </label>
                  <input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="VD: 0901234567"
                    className={`mt-1.5 h-11 w-full rounded-xl border px-3 text-sm outline-none focus:border-primary transition-colors ${
                      formError.phone ? "border-critical bg-critical-container" : "border-border bg-card"
                    }`}
                  />
                  {formError.phone && (
                    <p className="mt-1 text-xs text-critical">{formError.phone}</p>
                  )}
                </div>

                {/* Địa chỉ */}
                <div>
                  <label className="block text-xs font-bold text-muted-foreground">Địa chỉ</label>
                  <input
                    value={form.address || ""}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    placeholder="Nhập địa chỉ của bạn"
                    className="mt-1.5 h-11 w-full rounded-xl border border-border bg-card px-3 text-sm outline-none focus:border-primary transition-colors"
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-2">
                  <Button type="submit" disabled={saving}>
                    <Check />
                    {saving ? "Đang lưu..." : "Lưu thay đổi"}
                  </Button>
                  <Button variant="outline" onClick={cancelEdit} className="text-muted-foreground">
                    <X />
                    Hủy
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
