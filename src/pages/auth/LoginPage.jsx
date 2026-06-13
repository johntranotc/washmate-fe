import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import "../../components/common/ui.css";

function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    if (!email.trim()) {
      setError("Vui lòng nhập email.");
      return false;
    }

    if (!email.includes("@")) {
      setError("Email không hợp lệ.");
      return false;
    }

    if (!password.trim()) {
      setError("Vui lòng nhập mật khẩu.");
      return false;
    }

    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự.");
      return false;
    }

    setError("");
    return true;
  };

  const handleForgotPassword = () => {
    alert("Tính năng quên mật khẩu đang được phát triển.");
  };

  const handleLogin = (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    setTimeout(() => {
      if (rememberMe) {
        localStorage.setItem("token", "mock-token");
        localStorage.setItem("userEmail", email);
      } else {
        sessionStorage.setItem("token", "mock-token");
        sessionStorage.setItem("userEmail", email);
      }

      setLoading(false);
      navigate("/customer");
    }, 800);
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="mb-8 text-center md:text-left">
        <h2 className="text-2xl font-bold text-[var(--text-main)]">
          Đăng nhập
        </h2>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          Chào mừng bạn quay lại WashMate. Vui lòng đăng nhập để tiếp tục.
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <Input
          label="Email hoặc số điện thoại"
          icon={Mail}
          type="text"
          placeholder="email@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />

        <div className="ui-field">
          <label className="ui-field-label" htmlFor="login-password">
            Mật khẩu
          </label>
          <div className="ui-field-wrap">
            <Lock size={18} className="ui-field-icon" />
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              className="ui-field-input"
              placeholder="Nhập mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="ui-field-icon"
              style={{
                background: "none",
                border: "none",
                padding: 0,
                cursor: "pointer",
                display: "flex",
              }}
              aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-[var(--text-muted)]">
            <input
              type="checkbox"
              className="accent-[var(--brand-blue)]"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            Ghi nhớ đăng nhập
          </label>

          <button
            type="button"
            onClick={handleForgotPassword}
            className="font-semibold text-[var(--brand-blue)] hover:underline"
          >
            Quên mật khẩu?
          </button>
        </div>

        <Button type="submit" variant="primary" fullWidth loading={loading}>
          {loading ? "Đang đăng nhập..." : "Đăng nhập"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-[var(--text-muted)]">
        Chưa có tài khoản?{" "}
        <Link
          to="/register"
          className="font-semibold text-[var(--brand-blue)] hover:underline"
        >
          Đăng ký ngay
        </Link>
      </p>
    </div>
  );
}

export default LoginPage;
