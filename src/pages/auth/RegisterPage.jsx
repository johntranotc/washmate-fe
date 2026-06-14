import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthHeading } from "@/components/auth/auth-heading";
import { Field } from "@/components/auth/field";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { authApi } from "@/api/authApi";

export default function RegisterPage() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!agreed) {
      setError("Bạn cần đồng ý với Điều khoản dịch vụ và Chính sách bảo mật.");
      return;
    }

    setLoading(true);

    try {
      const data = await authApi.register({
        fullName,
        email,
        phone,
        password,
      });

      if (data?.accessToken) {
        localStorage.setItem("accessToken", data.accessToken);
      }
      if (data?.refreshToken) {
        localStorage.setItem("refreshToken", data.refreshToken);
      }
      localStorage.setItem("userEmail", email);

      navigate("/select-workspace");
    } catch (err) {
      setError(err?.message || "Đăng ký thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <AuthHeading
        title="Tạo tài khoản"
        description="Đăng ký miễn phí để đặt lịch rửa xe, theo dõi tiến độ và tích điểm thành viên."
      />

      {error && (
        <div className="mb-5 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <Field
          id="name"
          label="Họ và tên"
          placeholder="Nguyễn Văn A"
          icon="user"
          autoComplete="name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
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
          id="phone"
          label="Số điện thoại"
          type="tel"
          placeholder="09xx xxx xxx"
          icon="phone"
          autoComplete="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <Field
          id="password"
          label="Mật khẩu"
          type="password"
          placeholder="Tối thiểu 8 ký tự"
          icon="lock"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className="flex items-start gap-2.5">
          <Checkbox
            id="terms"
            className="mt-0.5"
            checked={agreed}
            onCheckedChange={(checked) => setAgreed(!!checked)}
          />
          <Label htmlFor="terms" className="text-[14px] font-medium leading-relaxed text-muted-foreground">
            Tôi đồng ý với{" "}
            <Link to="#" className="font-semibold text-primary hover:underline">
              Điều khoản dịch vụ
            </Link>{" "}
            và{" "}
            <Link to="#" className="font-semibold text-primary hover:underline">
              Chính sách bảo mật
            </Link>
          </Label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-12 items-center justify-center rounded-xl bg-primary text-[15px] font-bold text-primary-foreground shadow-[0_12px_28px_-10px_rgba(11,140,255,0.75)] transition-all hover:-translate-y-0.5 hover:bg-brand-dark disabled:opacity-60"
        >
          {loading ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
        </button>
      </form>

      <p className="mt-8 text-center text-[15px] text-muted-foreground">
        Đã có tài khoản?{" "}
        <Link to="/login" className="font-semibold text-primary hover:underline">
          Đăng nhập
        </Link>
      </p>
    </div>
  );
}
