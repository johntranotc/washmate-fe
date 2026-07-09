import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle2, KeyRound, RefreshCw } from "lucide-react";
import { AuthHeading } from "@/components/auth/auth-heading";
import { Field } from "@/components/auth/field";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { authApi } from "@/api/authApi";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ fullName: "", phone: "", email: "", password: "", confirmPassword: "", otp: "" });
  const [agreed, setAgreed] = useState(false);
  const [status, setStatus] = useState({ error: "", success: "" });
  const [loading, setLoading] = useState(false);

  const update = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus({ error: "", success: "" });

    if (step === 1) {
      if (form.password !== form.confirmPassword) return setStatus({ error: "Mật khẩu xác nhận không khớp.", success: "" });
      if (!agreed) return setStatus({ error: "Bạn cần đồng ý với Điều khoản dịch vụ và Chính sách bảo mật.", success: "" });
      setLoading(true);
      try {
        await authApi.register({ fullName: form.fullName, phone: form.phone, email: form.email, password: form.password });
        setStatus({ error: "", success: "Đã tạo tài khoản. Vui lòng kiểm tra email để lấy mã OTP kích hoạt." });
        setStep(2);
      } catch (err) {
        setStatus({ error: err?.message || "Đăng ký thất bại. Vui lòng thử lại.", success: "" });
      } finally {
        setLoading(false);
      }
    } else {
      if (!form.otp || form.otp.length < 6) return setStatus({ error: "Vui lòng nhập đủ 6 số OTP.", success: "" });
      setLoading(true);
      try {
        await authApi.verifyOtp({ email: form.email, otp: form.otp });
        setStatus({ error: "", success: "Kích hoạt tài khoản thành công! Đang chuyển đến đăng nhập..." });
        window.setTimeout(() => navigate("/dang-nhap"), 900);
      } catch (err) {
        setStatus({ error: err?.message || "Mã OTP không chính xác hoặc đã hết hạn.", success: "" });
      } finally {
        setLoading(false);
      }
    }
  }

  async function handleResendOtp() {
    setStatus({ error: "", success: "" });
    setLoading(true);
    try {
      await authApi.requestOtp({ email: form.email });
      setStatus({ error: "", success: "Đã gửi lại mã OTP mới vào email của bạn." });
    } catch (err) {
      setStatus({ error: err?.message || "Không thể gửi lại OTP. Vui lòng thử lại sau.", success: "" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <AuthHeading
        title={step === 1 ? "Tạo tài khoản WashMate" : "Xác thực mã OTP"}
        description={step === 1 ? "Đăng ký để đặt lịch, theo dõi tiến độ và nhận quyền lợi thành viên." : `Vui lòng nhập mã 6 số được gửi đến email ${form.email}`}
      />

      {status.error && (
        <div role="alert" className="mb-5 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
          {status.error}
        </div>
      )}
      {status.success && (
        <div className="mb-5 flex items-center gap-2 rounded-xl border border-success/25 bg-success-container px-4 py-3 text-sm font-medium text-success">
          <CheckCircle2 className="size-4 shrink-0" />
          {status.success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {step === 1 ? (
          <>
            <Field id="fullName" label="Họ và tên" placeholder="Nguyễn Văn A" icon="user" autoComplete="name" value={form.fullName} onChange={update("fullName")} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="phone" label="Số điện thoại" type="tel" placeholder="09xx xxx xxx" icon="phone" autoComplete="tel" value={form.phone} onChange={update("phone")} />
              <Field id="email" label="Email" type="email" placeholder="ban@email.com" icon="mail" autoComplete="email" value={form.email} onChange={update("email")} />
            </div>
            <Field id="password" label="Mật khẩu" type="password" placeholder="Tối thiểu 8 ký tự" icon="lock" autoComplete="new-password" minLength={8} value={form.password} onChange={update("password")} />
            <Field id="confirmPassword" label="Xác nhận mật khẩu" type="password" placeholder="Nhập lại mật khẩu" icon="lock" autoComplete="new-password" value={form.confirmPassword} onChange={update("confirmPassword")} />
            <div className="flex items-start gap-2.5">
              <Checkbox id="terms" className="mt-0.5" checked={agreed} onCheckedChange={(checked) => setAgreed(Boolean(checked))} />
              {/* label thường (không flex) để chữ + link chảy liền mạch, không vỡ cột */}
              <label htmlFor="terms" className="text-sm leading-relaxed text-muted-foreground select-none">
                Tôi đồng ý với <a href="#" className="font-semibold text-primary">Điều khoản dịch vụ</a> và <a href="#" className="font-semibold text-primary">Chính sách bảo mật</a>.
              </label>
            </div>
            <Button type="submit" size="xl" disabled={loading} className="mt-1 w-full shadow-cta">
              {loading ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
            </Button>
          </>
        ) : (
          <>
            <div className="relative">
              <KeyRound className="pointer-events-none absolute left-3.5 top-9 size-5 text-muted-foreground" />
              <label htmlFor="otp" className="mb-2 block text-sm font-semibold text-foreground">Mã xác thực OTP (6 chữ số)</label>
              <input
                id="otp"
                type="text"
                maxLength={6}
                placeholder="123456"
                className="flex h-12 w-full rounded-xl border border-input bg-background px-3 pl-11 text-lg font-bold tracking-widest text-foreground outline-none ring-offset-background placeholder:font-normal placeholder:tracking-normal focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
                value={form.otp}
                onChange={update("otp")}
              />
            </div>
            <Button type="submit" size="xl" disabled={loading} className="mt-2 w-full shadow-cta">
              {loading ? "Đang xác thực..." : "Kích hoạt tài khoản"}
            </Button>
            <div className="mt-3 flex items-center justify-between text-sm">
              <button type="button" onClick={() => setStep(1)} className="font-semibold text-muted-foreground hover:text-foreground">
                &larr; Quay lại sửa thông tin
              </button>
              <button type="button" disabled={loading} onClick={handleResendOtp} className="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline disabled:opacity-50">
                <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
                Gửi lại mã OTP
              </button>
            </div>
          </>
        )}
      </form>

      {step === 1 && (
        <p className="mt-7 text-center text-base text-muted-foreground">
          Đã có tài khoản? <Link to="/dang-nhap" className="font-semibold text-primary hover:underline">Đăng nhập</Link>
        </p>
      )}
    </div>
  );
}
