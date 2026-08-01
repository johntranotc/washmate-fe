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
        setError("Vai trÃ² tÃ i khoáº£n chÆ°a Ä‘Æ°á»£c há»— trá»£. Vui lÃ²ng liÃªn há»‡ quáº£n trá»‹ viÃªn.");
      }
    } catch (err) {
      setError(friendlyError(err, "ÄÄƒng nháº­p tháº¥t báº¡i. Vui lÃ²ng kiá»ƒm tra email vÃ  máº­t kháº©u."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <AuthHeading title="ÄÄƒng nháº­p" description="ChÃ o má»«ng trá»Ÿ láº¡i! ÄÄƒng nháº­p Ä‘á»ƒ tiáº¿p tá»¥c chÄƒm sÃ³c xe cá»§a báº¡n." />

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
          placeholder="Nháº­p email cá»§a báº¡n"
          icon="mail"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Field
          id="password"
          label="Máº­t kháº©u"
          type="password"
          placeholder="Nháº­p máº­t kháº©u"
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
              Ghi nhá»› Ä‘Äƒng nháº­p
            </Label>
          </div>
          <Link to="/forgot-password" className="text-sm font-semibold text-primary hover:underline">
            QuÃªn máº­t kháº©u?
          </Link>
        </div>

        <Button type="submit" size="xl" disabled={loading} className="w-full shadow-cta">
          {loading ? "Äang Ä‘Äƒng nháº­p..." : "ÄÄƒng nháº­p"}
        </Button>
      </form>

      <div className="my-5 flex items-center gap-3">
        <span className="h-px flex-1 bg-border" />
        <span className="text-sm font-medium text-muted-foreground">hoáº·c</span>
        <span className="h-px flex-1 bg-border" />
      </div>

      {/* NÃºt hiá»ƒn thá»‹ lÃ  UI custom; GoogleLogin tháº­t náº±m phá»§ trong suá»‘t bÃªn trÃªn Ä‘á»ƒ giá»¯ nguyÃªn credential/idToken flow. */}
      <div className="relative h-12 w-full overflow-hidden rounded-xl">
        <span className="pointer-events-none flex h-full w-full items-center justify-center gap-3 rounded-xl border border-border bg-card text-sm font-bold text-foreground shadow-sm">
          <img src="/images/auth/icons/google.png" alt="" className="size-5" />
          Tiáº¿p tá»¥c vá»›i Google
        </span>
        {/* NÃºt Google tháº­t phá»§ trong suá»‘t KÃN toÃ n bá»™ nÃºt Ä‘á»ƒ báº¥m chá»— nÃ o cÅ©ng Äƒn */}
        <div className="absolute inset-0 z-10 opacity-100 [&>div]:!h-full [&>div]:!w-full [&_iframe]:!h-full [&_iframe]:!w-full">
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
                setError("Vai trÃ² tÃ i khoáº£n chÆ°a Ä‘Æ°á»£c há»— trá»£. Vui lÃ²ng liÃªn há»‡ quáº£n trá»‹ viÃªn.");
              }
            } catch {
              // Lá»—i ká»¹ thuáº­t (vd. mÃ¡y chá»§ chÆ°a báº­t Ä‘Äƒng nháº­p Google) â†’ thÃ´ng bÃ¡o thÃ¢n thiá»‡n, KHÃ”NG cháº·n login email.
              setGoogleError("ÄÄƒng nháº­p báº±ng Google hiá»‡n chÆ°a kháº£ dá»¥ng. Vui lÃ²ng Ä‘Äƒng nháº­p báº±ng email.");
            } finally {
              setLoading(false);
            }
          }}
          onError={() => {
            setGoogleError("ÄÄƒng nháº­p báº±ng Google hiá»‡n chÆ°a kháº£ dá»¥ng. Vui lÃ²ng Ä‘Äƒng nháº­p báº±ng email.");
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
        ChÆ°a cÃ³ tÃ i khoáº£n?{" "}
        <Link to="/register" className="font-semibold text-primary hover:underline">
          ÄÄƒng kÃ½ ngay
        </Link>
      </p>
    </div>
  );
}

