import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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

  const handleLogin = (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    setTimeout(() => {
      console.log({
        email,
        password,
      });

      localStorage.setItem("token", "mock-token");
      localStorage.setItem("userEmail", email);

      setLoading(false);
      navigate("/customer");
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-slate-800 mb-2">
          AutoWash Pro
        </h1>

        <p className="text-center text-slate-500 mb-6">Đăng nhập hệ thống</p>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block mb-2 font-medium text-slate-700">
              Email
            </label>

            <input
              type="email"
              placeholder="Nhập email"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-slate-800"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="mb-6">
            <label className="block mb-2 font-medium text-slate-700">
              Password
            </label>

            <input
              type="password"
              placeholder="Nhập mật khẩu"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-slate-800"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white py-2 rounded-lg hover:bg-slate-800 disabled:bg-slate-400 disabled:cursor-not-allowed"
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>

        <p className="text-center mt-4 text-sm text-slate-500">
          Chưa có tài khoản?{" "}
          <Link to="/register" className="text-blue-600 hover:underline">
            Đăng ký
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
