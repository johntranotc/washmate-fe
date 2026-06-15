import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { AuthHeading } from "@/components/auth/auth-heading";
import { Field } from "@/components/auth/field";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { authApi } from "@/api/authApi";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: "", phone: "", email: "", password: "", confirmPassword: "" });
  const [agreed, setAgreed] = useState(false);
  const [status, setStatus] = useState({ error: "", success: "" });
  const [loading, setLoading] = useState(false);
  const update = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus({ error: "", success: "" });
    if (form.password !== form.confirmPassword) return setStatus({ error: "Mật khẩu xác nhận không khớp.", success: "" });
    if (!agreed) return setStatus({ error: "Bạn cần đồng ý với Điều khoản dịch vụ và Chính sách bảo mật.", success: "" });
    setLoading(true);
    try {
      await authApi.register({ fullName: form.fullName, phone: form.phone, email: form.email, password: form.password });
      setStatus({ error: "", success: "Đăng ký thành công. Đang chuyển đến trang đăng nhập..." });
      window.setTimeout(() => navigate("/dang-nhap"), 900);
    } catch (err) {
      setStatus({ error: err?.message || "Đăng ký thất bại. Vui lòng thử lại.", success: "" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <AuthHeading title="Tạo tài khoản WashMate" description="Đăng ký để đặt lịch, theo dõi tiến độ và nhận quyền lợi thành viên." />
      {status.error && <div role="alert" className="mb-5 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">{status.error}</div>}
      {status.success && <div className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700"><CheckCircle2 className="size-4" />{status.success}</div>}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field id="fullName" label="Họ và tên" placeholder="Nguyễn Văn A" icon="user" autoComplete="name" value={form.fullName} onChange={update("fullName")} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="phone" label="Số điện thoại" type="tel" placeholder="09xx xxx xxx" icon="phone" autoComplete="tel" value={form.phone} onChange={update("phone")} />
          <Field id="email" label="Email" type="email" placeholder="ban@email.com" icon="mail" autoComplete="email" value={form.email} onChange={update("email")} />
        </div>
        <Field id="password" label="Mật khẩu" type="password" placeholder="Tối thiểu 8 ký tự" icon="lock" autoComplete="new-password" minLength={8} value={form.password} onChange={update("password")} />
        <Field id="confirmPassword" label="Xác nhận mật khẩu" type="password" placeholder="Nhập lại mật khẩu" icon="lock" autoComplete="new-password" value={form.confirmPassword} onChange={update("confirmPassword")} />
        <div className="flex items-start gap-2.5"><Checkbox id="terms" className="mt-0.5" checked={agreed} onCheckedChange={(checked) => setAgreed(Boolean(checked))} /><Label htmlFor="terms" className="text-sm leading-relaxed text-muted-foreground">Tôi đồng ý với <a href="#" className="font-semibold text-primary">Điều khoản dịch vụ</a> và <a href="#" className="font-semibold text-primary">Chính sách bảo mật</a>.</Label></div>
        <button type="submit" disabled={loading} className="mt-1 h-12 rounded-xl bg-primary font-bold text-white shadow-[0_12px_28px_-10px_rgba(11,140,255,.75)] hover:bg-brand-dark disabled:opacity-60">{loading ? "Đang tạo tài khoản..." : "Tạo tài khoản"}</button>
      </form>
      <p className="mt-7 text-center text-[15px] text-muted-foreground">Đã có tài khoản? <Link to="/dang-nhap" className="font-semibold text-primary hover:underline">Đăng nhập</Link></p>
    </div>
  );
}
