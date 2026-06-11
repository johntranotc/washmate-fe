import { LockKeyhole, Mail } from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAppStore } from "../../state/AppStore";

const demoAccounts = [
  ["Khách hàng", "customer@demo.com"],
  ["Nhân viên", "staff@demo.com"],
  ["Quản trị viên", "admin@demo.com"],
];

const homeByRole = {
  CUSTOMER: "/customer",
  STAFF: "/staff/queue",
  ADMIN: "/admin/dashboard",
};

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { actions } = useAppStore();
  const [email, setEmail] = useState("customer@demo.com");
  const [password, setPassword] = useState("123456");
  const [error, setError] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    if (!email.includes("@") || password.length < 6) {
      setError("Vui lòng nhập email hợp lệ và mật khẩu có ít nhất 6 ký tự.");
      return;
    }
    const user = actions.login(email);
    navigate(location.state?.from || homeByRole[user.role], { replace: true });
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 shadow-xl shadow-blue-950/5">
      <h1 className="text-2xl font-extrabold">Chào mừng trở lại</h1>
      <p className="mt-2 text-sm text-slate-500">
        Đăng nhập để tiếp tục sử dụng hệ thống.
      </p>
      {error && <div className="mt-5 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">{error}</div>}
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <label className="block text-xs font-bold text-slate-600">
          Thư điện tử
          <span className="mt-2 flex h-11 items-center gap-2 rounded-lg border border-slate-200 px-3 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100">
            <Mail size={16} className="text-slate-400" />
            <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border-0 bg-transparent text-sm outline-none" />
          </span>
        </label>
        <label className="block text-xs font-bold text-slate-600">
          Mật khẩu
          <span className="mt-2 flex h-11 items-center gap-2 rounded-lg border border-slate-200 px-3 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100">
            <LockKeyhole size={16} className="text-slate-400" />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border-0 bg-transparent text-sm outline-none" />
          </span>
        </label>
        <button className="h-11 w-full rounded-lg bg-blue-600 text-sm font-bold text-white hover:bg-blue-700">
          Đăng nhập
        </button>
      </form>
      <div className="mt-6 border-t border-slate-100 pt-5">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Tài khoản dùng thử
        </p>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {demoAccounts.map(([label, account]) => (
            <button key={account} type="button" onClick={() => setEmail(account)} className="rounded-lg border border-blue-100 bg-blue-50 px-2 py-2 text-[10px] font-bold text-blue-700">
              {label}
            </button>
          ))}
        </div>
      </div>
      <p className="mt-5 text-center text-xs text-slate-500">
        Chưa có tài khoản? <Link to="/register" className="font-bold text-blue-600">Đăng ký ngay</Link>
      </p>
    </div>
  );
}

export default LoginPage;
