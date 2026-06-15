import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Check } from "lucide-react";
import { AuthHeading } from "@/components/auth/auth-heading";
import { Field } from "@/components/auth/field";
import { authApi } from "@/api/authApi";
import { cn } from "@/lib/utils";

const labels = ["Xác nhận tài khoản", "Nhập mã xác thực", "Tạo mật khẩu mới"];

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ identifier: "", otp: "", password: "", confirmPassword: "" });
  const [message, setMessage] = useState({ error: "", success: "" });
  const [loading, setLoading] = useState(false);
  const update = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage({ error: "", success: "" });
    if (step === 3 && form.password !== form.confirmPassword) return setMessage({ error: "Mật khẩu xác nhận không khớp.", success: "" });
    setLoading(true);
    try {
      if (step === 1) {
        await authApi.forgotPassword({ identifier: form.identifier });
        setMessage({ error: "", success: "Mã xác thực đã được gửi." });
        setStep(2);
      } else if (step === 2) {
        await authApi.verifyOtp({ identifier: form.identifier, otp: form.otp });
        setMessage({ error: "", success: "Mã xác thực hợp lệ." });
        setStep(3);
      } else {
        await authApi.resetPassword({ identifier: form.identifier, otp: form.otp, newPassword: form.password });
        setMessage({ error: "", success: "Đặt lại mật khẩu thành công. Bạn có thể đăng nhập ngay." });
      }
    } catch (err) {
      setMessage({ error: err?.errorCode === "INVALID_OTP" ? "Mã xác thực không hợp lệ." : err?.message || "Không thể hoàn tất yêu cầu.", success: "" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <AuthHeading title="Khôi phục mật khẩu" description="Hoàn tất ba bước bảo mật để tạo mật khẩu mới cho tài khoản WashMate." />
      <ol className="mb-8 grid grid-cols-3 gap-2">
        {labels.map((label, index) => {
          const number = index + 1;
          const done = step > number;
          return <li key={label} className="text-center"><span className={cn("mx-auto grid size-9 place-items-center rounded-full border text-sm font-bold", step >= number ? "border-primary bg-primary text-white" : "border-border text-muted-foreground")}>{done ? <Check className="size-4" /> : number}</span><span className="mt-2 hidden text-xs font-semibold text-muted-foreground sm:block">{label}</span></li>;
        })}
      </ol>
      {message.error && <div role="alert" className="mb-5 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">{message.error}</div>}
      {message.success && <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">{message.success}</div>}
      {!(step === 3 && message.success) ? (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {step === 1 && <Field id="identifier" label="Email hoặc số điện thoại" placeholder="ban@email.com hoặc 09xx xxx xxx" icon="mail" value={form.identifier} onChange={update("identifier")} />}
          {step === 2 && <Field id="otp" label="Mã xác thực" placeholder="Nhập mã gồm 6 chữ số" icon="shield" inputMode="numeric" maxLength={6} value={form.otp} onChange={update("otp")} />}
          {step === 3 && <><Field id="password" label="Mật khẩu mới" type="password" placeholder="Tối thiểu 8 ký tự" icon="lock" minLength={8} value={form.password} onChange={update("password")} /><Field id="confirmPassword" label="Xác nhận mật khẩu mới" type="password" placeholder="Nhập lại mật khẩu" icon="lock" value={form.confirmPassword} onChange={update("confirmPassword")} /></>}
          <button type="submit" disabled={loading} className="h-12 rounded-xl bg-primary font-bold text-white hover:bg-brand-dark disabled:opacity-60">{loading ? "Đang xử lý..." : step === 1 ? "Gửi mã xác thực" : step === 2 ? "Xác thực mã" : "Tạo mật khẩu mới"}</button>
        </form>
      ) : <Link to="/dang-nhap" className="flex h-12 items-center justify-center rounded-xl bg-primary font-bold text-white">Đăng nhập ngay</Link>}
      <Link to="/dang-nhap" className="mt-7 flex items-center justify-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary"><ArrowLeft className="size-4" /> Quay lại đăng nhập</Link>
    </div>
  );
}
