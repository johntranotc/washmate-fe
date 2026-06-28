import { useEffect, useState } from "react";
import { ArrowLeft, Check, Pencil, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { userApi } from "../../api/userApi";

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
    ADMIN: "bg-blue-100 text-blue-700",
    STAFF: "bg-cyan-100 text-cyan-700",
    CUSTOMER: "bg-emerald-100 text-emerald-700",
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
        <button
          type="button"
          onClick={() => navigate(backPath)}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
            {role === "ADMIN" ? "Quản trị viên" : "Nhân viên"}
          </p>
          <h1 className="text-2xl font-extrabold text-slate-900">Thông tin tài khoản</h1>
        </div>
      </header>

      {/* Success toast */}
      {saveSuccess && (
        <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
          <Check size={16} />
          Cập nhật thông tin thành công!
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
          Đang tải thông tin tài khoản...
        </div>
      ) : error && !profile ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-10 text-center text-sm text-red-600">
          {error}
        </div>
      ) : profile ? (
        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          {/* Avatar card */}
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-slate-200 bg-white p-6 text-center">
            <div className="relative group">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 text-4xl font-extrabold text-white shadow-lg overflow-hidden">
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
                  <span className="text-[10px] font-bold uppercase tracking-wider">Đổi ảnh</span>
                  <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                </label>
              )}
            </div>
            <div>
              <p className="text-base font-extrabold text-slate-900">{profile.fullName || "Chưa cập nhật"}</p>
              <p className="mt-1 text-sm text-slate-500">{profile.email}</p>
            </div>
            <div className="flex flex-wrap justify-center gap-1.5">
              {displayRoles.map((r) => (
                <span key={r} className={`rounded-full px-3 py-1 text-xs font-bold ${roleColors[r] || "bg-slate-100 text-slate-600"}`}>
                  {r}
                </span>
              ))}
            </div>
            <div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ${
                  profile.status === "ACTIVE"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {profile.status || "–"}
              </span>
            </div>
          </div>

          {/* Info + Edit card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-extrabold text-slate-900">Chi tiết thông tin</h2>
              {!editing && (
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  <Pencil size={13} />
                  Chỉnh sửa
                </button>
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
                  <div key={label} className="rounded-xl bg-slate-50 p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{label}</p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">{value}</p>
                  </div>
                ))}
              </div>
            ) : (
              /* Edit mode */
              <form onSubmit={handleSave} className="mt-5 space-y-4">
                {formError.general && (
                  <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {formError.general}
                  </p>
                )}

                {/* Email — readonly */}
                <div>
                  <label className="block text-xs font-bold text-slate-600">Email</label>
                  <input
                    disabled
                    value={profile.email || ""}
                    className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-500 cursor-not-allowed"
                  />
                  <p className="mt-1 text-[11px] text-slate-400">Email không thể thay đổi.</p>
                </div>

                {/* Họ và tên */}
                <div>
                  <label className="block text-xs font-bold text-slate-600">
                    Họ và tên <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    placeholder="Nhập họ và tên"
                    className={`mt-1.5 h-11 w-full rounded-xl border px-3 text-sm outline-none focus:border-blue-500 transition-colors ${
                      formError.fullName ? "border-red-400 bg-red-50" : "border-slate-200 bg-white"
                    }`}
                  />
                  {formError.fullName && (
                    <p className="mt-1 text-xs text-red-500">{formError.fullName}</p>
                  )}
                </div>

                {/* Số điện thoại */}
                <div>
                  <label className="block text-xs font-bold text-slate-600">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="VD: 0901234567"
                    className={`mt-1.5 h-11 w-full rounded-xl border px-3 text-sm outline-none focus:border-blue-500 transition-colors ${
                      formError.phone ? "border-red-400 bg-red-50" : "border-slate-200 bg-white"
                    }`}
                  />
                  {formError.phone && (
                    <p className="mt-1 text-xs text-red-500">{formError.phone}</p>
                  )}
                </div>

                {/* Địa chỉ */}
                <div>
                  <label className="block text-xs font-bold text-slate-600">Địa chỉ</label>
                  <input
                    value={form.address || ""}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    placeholder="Nhập địa chỉ của bạn"
                    className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-700 disabled:bg-slate-300 transition-colors"
                  >
                    <Check size={14} />
                    {saving ? "Đang lưu..." : "Lưu thay đổi"}
                  </button>
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    <X size={14} />
                    Hủy
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
