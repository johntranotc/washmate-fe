import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthHeading } from "@/components/auth/auth-heading";
import { Field } from "@/components/auth/field";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { authApi } from "@/api/authApi";

export default function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await authApi.login({ email, password });

      if (data?.accessToken) {
        localStorage.setItem("accessToken", data.accessToken);
      }
      if (data?.refreshToken) {
        localStorage.setItem("refreshToken", data.refreshToken);
      }
      localStorage.setItem("userEmail", email);

      navigate("/select-workspace");
    } catch (err) {
      setError(err?.message || "Đăng nhập thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <AuthHeading title="Đăng nhập" description="Chào mừng trở lại! Đăng nhập để tiếp tục chăm sóc xe của bạn." />

      {error && (
        <div className="mb-5 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <Field
          id="email"
          label="Email"
          type="email"
          placeholder="ban@email.com"
          icon="mail"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Field
          id="password"
          label="Mật khẩu"
          type="password"
          placeholder="••••••••"
          icon="lock"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Checkbox
              id="remember"
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(!!checked)}
            />
            <Label htmlFor="remember" className="text-[14px] font-medium text-muted-foreground">
              Ghi nhớ đăng nhập
            </Label>
          </div>
          <Link to="/forgot-password" className="text-[14px] font-semibold text-primary hover:underline">
            Quên mật khẩu?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-12 items-center justify-center rounded-xl bg-primary text-[15px] font-bold text-primary-foreground shadow-[0_12px_28px_-10px_rgba(11,140,255,0.75)] transition-all hover:-translate-y-0.5 hover:bg-brand-dark disabled:opacity-60"
        >
          {loading ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>
      </form>

      <div className="my-7 flex items-center gap-3">
        <span className="h-px flex-1 bg-border" />
        <span className="text-[13px] font-medium text-muted-foreground">hoặc</span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <button
        type="button"
        className="inline-flex h-12 w-full items-center justify-center gap-2.5 rounded-xl border border-border bg-card text-[15px] font-semibold text-foreground transition-colors hover:border-primary hover:text-primary"
      >
        <GoogleIcon className="size-5" />
        Tiếp tục với Google
      </button>

      <p className="mt-8 text-center text-[15px] text-muted-foreground">
        Chưa có tài khoản?{" "}
        <Link to="/register" className="font-semibold text-primary hover:underline">
          Đăng ký ngay
        </Link>
      </p>
    </div>
  );
}

function GoogleIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z"
      />
    </svg>
  );
}
