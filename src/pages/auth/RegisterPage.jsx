import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail, Phone, User } from "lucide-react";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import "../../components/common/ui.css";

function RegisterPage() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    if (!fullName.trim()) {
      setError("Vui lòng nhập họ tên.");
      return false;
    }

    if (!phone.trim()) {
      setError("Vui lòng nhập số điện thoại.");
      return false;
    }

    if (phone.length < 10) {
      setError("Số điện thoại không hợp lệ.");
      return false;
    }

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
      setError("Mật khẩu phải từ 6 ký tự trở lên.");
      return false;
    }

    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return false;
    }

    setError("");
    return true;
  };

  const handleRegister = (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    setTimeout(() => {
      console.log({
        fullName,
        phone,
        email,
        password,
      });

      setLoading(false);
      alert("Đăng ký thành công!");
      navigate("/login");
    }, 1000);
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="mb-8 text-center md:text-left">
        <h2 className="text-2xl font-bold text-[var(--text-main)]">
          Tạo tài khoản
        </h2>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          Đăng ký để bắt đầu trải nghiệm dịch vụ rửa xe cùng WashMate.
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={handleRegister} className="space-y-4">
        <Input
          label="Họ và tên"
          icon={User}
          type="text"
          placeholder="Nhập họ tên"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          autoComplete="name"
        />

        <Input
          label="Số điện thoại"
          icon={Phone}
          type="text"
          placeholder="Nhập số điện thoại"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          autoComplete="tel"
        />

        <Input
          label="Email"
          icon={Mail}
          type="email"
          placeholder="email@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />

        <div className="ui-field">
          <label className="ui-field-label" htmlFor="register-password">
            Mật khẩu
          </label>
          <div className="ui-field-wrap">
            <Lock size={18} className="ui-field-icon" />
            <input
              id="register-password"
              type={showPassword ? "text" : "password"}
              className="ui-field-input"
              placeholder="Nhập mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
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

        <div className="ui-field">
          <label className="ui-field-label" htmlFor="register-confirm-password">
            Xác nhận mật khẩu
          </label>
          <div className="ui-field-wrap">
            <Lock size={18} className="ui-field-icon" />
            <input
              id="register-confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              className="ui-field-input"
              placeholder="Nhập lại mật khẩu"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="ui-field-icon"
              style={{
                background: "none",
                border: "none",
                padding: 0,
                cursor: "pointer",
                display: "flex",
              }}
              aria-label={showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <Button type="submit" variant="primary" fullWidth loading={loading}>
          {loading ? "Đang đăng ký..." : "Đăng ký"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-[var(--text-muted)]">
        Đã có tài khoản?{" "}
        <Link
          to="/login"
          className="font-semibold text-[var(--brand-blue)] hover:underline"
        >
          Đăng nhập
        </Link>
      </p>
    </div>
  );
}

export default RegisterPage;
