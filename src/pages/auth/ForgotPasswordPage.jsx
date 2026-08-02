import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Check } from "lucide-react";
import { AuthHeading } from "@/components/auth/auth-heading";
import { Field } from "@/components/auth/field";
import { Button } from "@/components/ui/button";
import { authApi } from "@/api/authApi";
import { cn } from "@/lib/utils";

// Hai bước, KHÔNG tách "nhập OTP" thành bước riêng: backend chỉ có một đường xác thực OTP
// (/auth/password/reset) và mã bị xóa ngay khi verify thành công. Nếu tách bước, màn nhập OTP
// không thể gọi server để kiểm tra -> gõ 6 số bất kỳ cũng qua được, và số lần nhập sai không
// bao giờ được ghi nhận nên giới hạn 5 lần của backend trở thành vô nghĩa.
const labels = ["Xác nhận tài khoản", "Nhập mã & mật khẩu mới"];

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ identifier: "", otp: "", password: "", confirmPassword: "" });
  const [message, setMessage] = useState({ error: "", success: "" });
  const [loading, setLoading] = useState(false);
  const [resetDone, setResetDone] = useState(false);
  const update = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage({ error: "", success: "" });
    if (step === 2) {
      if (!/^[0-9]{6}$/.test(form.otp.trim())) return setMessage({ error: "Mã xác thực gồm 6 chữ số.", success: "" });
      if (form.password !== form.confirmPassword) return setMessage({ error: "Mật khẩu xác nhận không khớp.", success: "" });
    }
    setLoading(true);
    try {
      if (step === 1) {
        await authApi.forgotPassword({ emailOrPhone: form.identifier });
        setMessage({ error: "", success: "Mã xác thực đã được gửi. Vui lòng kiểm tra email." });
        setStep(2);
      } else {
        // Một request duy nhất: backend kiểm tra OTP rồi mới đổi mật khẩu.
        // Mã sai -> 401 và backend tăng bộ đếm số lần sai, đủ 5 lần thì thu hồi mã.
        await authApi.resetPassword({ identifier: form.identifier, otp: form.otp.trim(), newPassword: form.password });
        setMessage({ error: "", success: "Đổi mật khẩu thành công! Bạn có thể đăng nhập bằng mật khẩu mới ngay bây giờ." });
        setResetDone(true);
      }
    } catch (err) {
      setMessage({ error: err?.errorCode === "INVALID_OTP" ? "Mã xác thực không hợp lệ." : err?.message || "Không thể hoàn tất yêu cầu.", success: "" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <AuthHeading title="Khôi phục mật khẩu" description="Xác nhận tài khoản, nhập mã xác thực gửi qua email và tạo mật khẩu mới." />
      <ol className="mb-8 grid grid-cols-2 gap-2">
        {labels.map((label, index) => {
          const number = index + 1;
          const done = step > number || (step === 2 && resetDone);
          return <li key={label} className="text-center"><span className={cn("mx-auto grid size-9 place-items-center rounded-full border text-sm font-bold", step >= number ? "border-primary bg-primary text-white" : "border-border text-muted-foreground")}>{done ? <Check className="size-4" /> : number}</span><span className="mt-2 hidden text-xs font-semibold text-muted-foreground sm:block">{label}</span></li>;
        })}
      </ol>
      {message.error && <div role="alert" className="mb-5 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">{message.error}</div>}
      {message.success && <div className="mb-5 rounded-xl border border-success/25 bg-success-container px-4 py-3 text-sm font-medium text-success">{message.success}</div>}
      {!resetDone ? (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {step === 1 && <Field id="identifier" label="Email hoặc số điện thoại" placeholder="ban@email.com hoặc 09xx xxx xxx" icon="mail" value={form.identifier} onChange={update("identifier")} />}
          {step === 2 && <><Field id="otp" label="Mã xác thực" placeholder="Nhập mã gồm 6 chữ số" icon="shield" inputMode="numeric" maxLength={6} value={form.otp} onChange={update("otp")} /><Field id="password" label="Mật khẩu mới" type="password" placeholder="Tối thiểu 8 ký tự" icon="lock" minLength={8} value={form.password} onChange={update("password")} /><Field id="confirmPassword" label="Xác nhận mật khẩu mới" type="password" placeholder="Nhập lại mật khẩu" icon="lock" value={form.confirmPassword} onChange={update("confirmPassword")} /></>}
          <Button type="submit" size="xl" disabled={loading} className="w-full shadow-cta">{loading ? "Đang xử lý..." : step === 1 ? "Gửi mã xác thực" : "Đổi mật khẩu"}</Button>
        </form>
      ) : <Button size="xl" render={<Link to="/dang-nhap" />} className="w-full shadow-cta">Đăng nhập ngay</Button>}
      <Link to="/dang-nhap" className="mt-7 flex items-center justify-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary"><ArrowLeft className="size-4" /> Quay lại đăng nhập</Link>
    </div>
  );
}
