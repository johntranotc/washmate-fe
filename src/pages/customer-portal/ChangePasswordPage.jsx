import { useState } from "react";
import PageContainer from "@/components/shared/PageContainer";
import PageHeader from "@/components/shared/PageHeader";
import { Eye, EyeOff, CheckCircle, XCircle, Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
    <PageContainer variant="narrow" className="animate-in fade-in-0 duration-300">
      <PageHeader
        title="Đổi mật khẩu"
        description="Để bảo vệ an toàn cho tài khoản WashMate, vui lòng đặt mật khẩu mạnh với ít nhất 8 ký tự bao gồm chữ và số."
      />

      <div className="rounded-3xl border border-border/80 bg-card p-8 shadow-floating">
        {status && (
          <div
            className={cn(
              "mb-6 flex items-center gap-3 rounded-2xl px-5 py-4 text-sm font-bold shadow-sm animate-in zoom-in-95",
              status === "success"
                ? "bg-success-container border border-success/25 text-success"
                : "bg-critical-container border border-critical/25 text-critical",
            )}
          >
            {status === "success" ? <CheckCircle size={20} className="text-success shrink-0" /> : <XCircle size={20} className="text-critical shrink-0" />}
            <span>{message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
          {pwFields.map(({ label, key, placeholder }) => (
            <div key={key} className="space-y-2">
              <label className="block text-xs font-semibold text-muted-foreground">
                {label} <span className="text-critical">*</span>
              </label>
              <div className="relative">
                <input
                  type={show[key] ? "text" : "password"}
                  value={form[key]}
                  onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
                  placeholder={placeholder}
                  className="w-full h-12 rounded-2xl border border-border bg-surface/50 px-4 pr-12 text-sm font-medium text-foreground transition focus:bg-card focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15"
                />
                <button
                  type="button"
                  onClick={() => toggleShow(key)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-xl p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                  aria-label={show[key] ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {show[key] ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          ))}

          <div className="pt-4">
            <Button
              type="submit"
              size="xl"
              disabled={loading}
              className="w-full sm:w-auto px-8 shadow-cta"
            >
              {loading ? <Loader2 className="animate-spin" /> : <Lock />}
              {loading ? "Đang cập nhật..." : "Cập nhật mật khẩu ngay"}
            </Button>
          </div>
        </form>
      </div>
    </PageContainer>
  );
}
