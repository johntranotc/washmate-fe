import { useState } from "react";
import { Shield, Eye, EyeOff, CheckCircle, XCircle, KeyRound, Lock, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { authApi } from "@/api/authApi";

export default function ChangePasswordPage() {
  const [form, setForm] = useState({ current: "", newPw: "", confirm: "" });
  const [show, setShow] = useState({ current: false, newPw: false, confirm: false });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
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
    try {
      setLoading(true);
      setStatus(null);
      await authApi.changePassword({
        oldPassword: form.current,
        newPassword: form.newPw,
      });
      setStatus("success");
      setMessage("Mật khẩu của bạn đã được cập nhật thành công!");
      setForm({ current: "", newPw: "", confirm: "" });
      setTimeout(() => setStatus(null), 4000);
    } catch (error) {
      setStatus("error");
      setMessage(
        error?.response?.data?.message ||
        error?.message ||
        "Mật khẩu hiện tại không đúng hoặc lỗi kết nối máy chủ."
      );
    } finally {
      setLoading(false);
    }
  }

  const pwFields = [
    { label: "Mật khẩu hiện tại", key: "current", placeholder: "Nhập mật khẩu đang sử dụng" },
    { label: "Mật khẩu mới", key: "newPw", placeholder: "Tối thiểu 8 ký tự" },
    { label: "Xác nhận mật khẩu mới", key: "confirm", placeholder: "Nhập lại mật khẩu mới" },
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6 lg:p-10 animate-in fade-in-0 duration-300">
      <header className="bg-white/60 backdrop-blur-xl border border-white/80 p-8 rounded-[2.5rem] shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <span className="grid size-10 place-items-center rounded-2xl bg-primary/10 text-primary">
            <KeyRound size={22} />
          </span>
          <span className="text-xs font-extrabold uppercase tracking-widest text-primary">Bảo mật tài khoản</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          Đổi mật khẩu
        </h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-xl">
          Để bảo vệ an toàn cho tài khoản WashMate, vui lòng đặt mật khẩu mạnh với ít nhất 8 ký tự bao gồm chữ và số.
        </p>
      </header>

      <div className="rounded-[2.5rem] border border-border/80 bg-white p-8 shadow-xl">
        {status && (
          <div
            className={cn(
              "mb-6 flex items-center gap-3 rounded-2xl px-5 py-4 text-sm font-bold shadow-sm animate-in zoom-in-95",
              status === "success"
                ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                : "bg-red-50 border border-red-200 text-red-800",
            )}
          >
            {status === "success" ? <CheckCircle size={20} className="text-emerald-600 shrink-0" /> : <XCircle size={20} className="text-red-600 shrink-0" />}
            <span>{message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
          {pwFields.map(({ label, key, placeholder }) => (
            <div key={key} className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {label} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={show[key] ? "text" : "password"}
                  value={form[key]}
                  onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
                  placeholder={placeholder}
                  className="w-full h-12 rounded-2xl border border-border bg-slate-50/50 px-4 pr-12 text-sm font-medium text-foreground transition focus:bg-white focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15"
                />
                <button
                  type="button"
                  onClick={() => toggleShow(key)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-xl p-1.5 text-muted-foreground transition hover:bg-slate-100 hover:text-foreground"
                  aria-label={show[key] ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {show[key] ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          ))}

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="h-12 w-full sm:w-auto px-8 rounded-2xl bg-primary font-bold text-white shadow-lg shadow-primary/25 transition hover:bg-brand-dark flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Lock size={18} />}
              {loading ? "Đang cập nhật..." : "Cập nhật mật khẩu ngay"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
