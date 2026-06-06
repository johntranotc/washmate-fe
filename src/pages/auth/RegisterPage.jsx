import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function RegisterPage() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

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
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-slate-800 mb-2">
          AutoWash Pro
        </h1>

        <p className="text-center text-slate-500 mb-6">Tạo tài khoản mới</p>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister}>
          <div className="mb-4 text-left">
            <label className="block mb-2 font-medium text-slate-700">
              Họ và tên
            </label>

            <input
              type="text"
              placeholder="Nhập họ tên"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-800"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div className="mb-4 text-left">
            <label className="block mb-2 font-medium text-slate-700">
              Số điện thoại
            </label>

            <input
              type="text"
              placeholder="Nhập số điện thoại"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-800"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="mb-4 text-left">
            <label className="block mb-2 font-medium text-slate-700">
              Email
            </label>

            <input
              type="email"
              placeholder="Nhập email"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-800"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="mb-4 text-left">
            <label className="block mb-2 font-medium text-slate-700">
              Mật khẩu
            </label>

            <input
              type="password"
              placeholder="Nhập mật khẩu"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-800"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="mb-6 text-left">
            <label className="block mb-2 font-medium text-slate-700">
              Xác nhận mật khẩu
            </label>

            <input
              type="password"
              placeholder="Nhập lại mật khẩu"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-800"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-slate-900 py-2 text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {loading ? "Đang đăng ký..." : "Đăng ký"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-500">
          Đã có tài khoản?{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
