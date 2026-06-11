import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppStore } from "../../state/AppStore";

function RegisterPage() {
  const navigate = useNavigate();
  const { actions } = useAppStore();
  const [form, setForm] = useState({ fullName: "", phone: "", email: "", password: "" });
  const [error, setError] = useState("");

  function submit(event) {
    event.preventDefault();
    if (!form.fullName || !form.email.includes("@") || form.password.length < 6) {
      setError("Vui lòng nhập đầy đủ thông tin. Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }
    actions.register(form);
    navigate("/customer");
  }

  const fields = [
    ["fullName", "Họ và tên", "text"],
    ["phone", "Số điện thoại", "text"],
    ["email", "Thư điện tử", "email"],
    ["password", "Mật khẩu", "password"],
  ];

  return (
    <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 shadow-xl shadow-blue-950/5">
      <h1 className="text-2xl font-extrabold">Tạo tài khoản</h1>
      <p className="mt-2 text-sm text-slate-500">Đăng ký tài khoản khách hàng AquaSmart.</p>
      {error && <p className="mt-4 rounded-lg bg-rose-50 p-3 text-xs text-rose-700">{error}</p>}
      <form onSubmit={submit} className="mt-6 space-y-3">
        {fields.map(([key, label, type]) => (
          <label key={key} className="block text-xs font-bold text-slate-600">
            {label}
            <input type={type} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} className="mt-2 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
          </label>
        ))}
        <button className="mt-2 h-11 w-full rounded-lg bg-blue-600 text-sm font-bold text-white">Đăng ký</button>
      </form>
      <p className="mt-5 text-center text-xs text-slate-500">
        Đã có tài khoản? <Link to="/login" className="font-bold text-blue-600">Đăng nhập</Link>
      </p>
    </div>
  );
}

export default RegisterPage;
