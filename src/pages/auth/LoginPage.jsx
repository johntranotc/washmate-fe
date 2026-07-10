import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthHeading } from "@/components/auth/auth-heading";
import { Field } from "@/components/auth/field";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { GoogleLogin } from "@react-oauth/google";
import { authApi } from "@/api/authApi";
import { getCurrentRole, homePathForRole } from "@/lib/auth-role";
import { friendlyError } from "@/lib/api-error";

function setAuthValue(key, value) {
  sessionStorage.setItem(key, value);
  localStorage.setItem(key, value);
}

export default function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [googleError, setGoogleError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await authApi.login({ email, password });

      if (data?.accessToken) {
        setAuthValue("token", data.accessToken);
        setAuthValue("accessToken", data.accessToken);
      }
      if (data?.refreshToken) {
        setAuthValue("refreshToken", data.refreshToken);
      }
      if (data?.user) {
        setAuthValue("currentUser", JSON.stringify(data.user));
      }
      setAuthValue("userEmail", email);

      const homePath = homePathForRole(getCurrentRole());
      if (homePath) {
        navigate(homePath);
      } else {
        setError("Vai trò tài khoản chưa được hỗ trợ. Vui lòng liên hệ quản trị viên.");
      }
    } catch (err) {
      setError(friendlyError(err, "Đăng nhập thất bại. Vui lòng kiểm tra email và mật khẩu."));
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
          placeholder="Nhập email của bạn"
          icon="mail"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Field
          id="password"
          label="Mật khẩu"
          type="password"
          placeholder="Nhập mật khẩu"
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
            <Label htmlFor="remember" className="text-sm font-medium text-muted-foreground">
              Ghi nhớ đăng nhập
            </Label>
          </div>
          <Link to="/forgot-password" className="text-sm font-semibold text-primary hover:underline">
            Quên mật khẩu?
          </Link>
        </div>

        <Button type="submit" size="xl" disabled={loading} className="w-full shadow-cta">
          {loading ? "Đang đăng nhập..." : "Đăng nhập"}
        </Button>
      </form>

      <div className="my-5 flex items-center gap-3">
        <span className="h-px flex-1 bg-border" />
        <span className="text-sm font-medium text-muted-foreground">hoặc</span>
        <span className="h-px flex-1 bg-border" />
      </div>

      {/* Nút hiển thị là UI custom; GoogleLogin thật nằm phủ trong suốt bên trên để giữ nguyên credential/idToken flow. */}
      <div className="relative h-12 w-full overflow-hidden rounded-xl">
        <span className="pointer-events-none flex h-full w-full items-center justify-center gap-3 rounded-xl border border-border bg-card text-sm font-bold text-foreground shadow-sm">
          <img src="/images/auth/icons/google.png" alt="" className="size-5" />
          Tiếp tục với Google
        </span>
        {/* Nút Google thật phủ trong suốt KÍN toàn bộ nút để bấm chỗ nào cũng ăn */}
        <div className="absolute inset-0 z-10 opacity-0 [&>div]:!h-full [&>div]:!w-full [&_iframe]:!h-full [&_iframe]:!w-full">
          <GoogleLogin
          onSuccess={async (credentialResponse) => {
            setError("");
            setGoogleError("");
            setLoading(true);
            try {
              const data = await authApi.loginWithGoogle({ idToken: credentialResponse.credential });
              if (data?.accessToken) {
                setAuthValue("token", data.accessToken);
                setAuthValue("accessToken", data.accessToken);
              }
              if (data?.refreshToken) setAuthValue("refreshToken", data.refreshToken);
              if (data?.user) setAuthValue("currentUser", JSON.stringify(data.user));
              const homePath = homePathForRole(getCurrentRole());
              if (homePath) {
                navigate(homePath);
              } else {
                setError("Vai trò tài khoản chưa được hỗ trợ. Vui lòng liên hệ quản trị viên.");
              }
            } catch {
              // Lỗi kỹ thuật (vd. máy chủ chưa bật đăng nhập Google) → thông báo thân thiện, KHÔNG chặn login email.
              setGoogleError("Đăng nhập bằng Google hiện chưa khả dụng. Vui lòng đăng nhập bằng email.");
            } finally {
              setLoading(false);
            }
          }}
          onError={() => {
            setGoogleError("Đăng nhập bằng Google hiện chưa khả dụng. Vui lòng đăng nhập bằng email.");
          }}
          theme="outline"
          size="large"
          text="continue_with"
          shape="pill"
          locale="vi"
          width="400"
        />
        </div>
      </div>

      {googleError && (
        <p className="mt-2 text-center text-xs font-medium text-muted-foreground">{googleError}</p>
      )}

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Chưa có tài khoản?{" "}
        <Link to="/register" className="font-semibold text-primary hover:underline">
          Đăng ký ngay
        </Link>
      </p>
    </div>
  );
}
