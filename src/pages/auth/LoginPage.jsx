import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthHeading } from "@/components/auth/auth-heading";
import { Field } from "@/components/auth/field";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { authApi } from "@/api/authApi";
import { destinationForRole, saveSession } from "@/lib/auth-session";

const errorMessages = {
  INVALID_CREDENTIALS: "Sai email, số điện thoại hoặc mật khẩu.",
  ACCOUNT_LOCKED: "Tài khoản đã bị khóa. Vui lòng liên hệ hỗ trợ.",
};

export default function LoginPage() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await authApi.login({ identifier, email: identifier, password, rememberMe });
      const { roles } = saveSession(data, { email: identifier });
      if (roles.length !== 1) navigate("/chon-khong-gian-lam-viec");
      else navigate(destinationForRole(roles[0]));
    } catch (err) {
      setError(errorMessages[err?.errorCode] || err?.message || "Đăng nhập thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <AuthHeading title="Đăng nhập vào WashMate" description="Chào mừng bạn trở lại. Đăng nhập để tiếp tục chăm sóc xe và quản lý công việc." />
      {error && <div role="alert" className="mb-5 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">{error}</div>}
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <Field id="identifier" label="Email hoặc số điện thoại" placeholder="ban@email.com hoặc 09xx xxx xxx" icon="mail" autoComplete="username" value={identifier} onChange={(event) => setIdentifier(event.target.value)} />
        <Field id="password" label="Mật khẩu" type="password" placeholder="Nhập mật khẩu" icon="lock" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} />
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2"><Checkbox id="remember" checked={rememberMe} onCheckedChange={(checked) => setRememberMe(Boolean(checked))} /><Label htmlFor="remember" className="text-sm text-muted-foreground">Ghi nhớ đăng nhập</Label></div>
          <Link to="/quen-mat-khau" className="text-sm font-semibold text-primary hover:underline">Quên mật khẩu?</Link>
        </div>
        <button type="submit" disabled={loading} className="h-12 rounded-xl bg-primary text-[15px] font-bold text-white shadow-[0_12px_28px_-10px_rgba(11,140,255,.75)] transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60">{loading ? "Đang đăng nhập..." : "Đăng nhập"}</button>
      </form>
      <p className="mt-8 text-center text-[15px] text-muted-foreground">Chưa có tài khoản? <Link to="/dang-ky" className="font-semibold text-primary hover:underline">Đăng ký ngay</Link></p>
    </div>
  );
}
