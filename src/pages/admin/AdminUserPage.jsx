import { useEffect, useMemo, useState } from "react";
import { RefreshCw, Lock, Unlock, Trash2, Search, UsersRound, AlertTriangle } from "lucide-react";
import { adminApi } from "../../api/adminApi";
import Pagination from "../../components/common/Pagination";

const PAGE_SIZE = 10;

const roleColors = {
  ADMIN: "bg-blue-100 text-blue-700",
  OWNER: "bg-violet-100 text-violet-700",
  MANAGER: "bg-indigo-100 text-indigo-700",
  STAFF: "bg-cyan-100 text-cyan-700",
  CUSTOMER: "bg-emerald-100 text-emerald-700",
};

const ROLE_FILTERS = [
  ["ALL", "Tất cả vai trò"],
  ["CUSTOMER", "Khách hàng"],
  ["STAFF", "Nhân viên"],
  ["MANAGER", "Quản lý"],
  ["OWNER", "Chủ doanh nghiệp"],
  ["ADMIN", "Quản trị viên"],
];

/**
 * Trang Khách hàng / Người dùng (Admin) — dữ liệu thật từ GET /api/admin/users.
 * Điểm tích lũy per-user chưa có API admin (chờ BE) nên không hiển thị số giả.
 */
export default function AdminUserPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [keyword, setKeyword] = useState("");
  const [role, setRole] = useState("ALL");
  const [page, setPage] = useState(1);

  function load() {
    setLoading(true);
    setError(null);
    adminApi.getAllUsers({ size: 1000 })
      .then((data) => {
        const list = Array.isArray(data?.content) ? data.content
          : Array.isArray(data?.data?.content) ? data.data.content
          : Array.isArray(data) ? data : [];
        setUsers(list);
      })
      .catch((e) => { setError(e?.message || "Không thể tải danh sách người dùng."); setUsers([]); })
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);
  useEffect(() => { setPage(1); }, [keyword, role]);

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return users.filter((u) => {
      const roles = Array.isArray(u.roles) ? u.roles : u.role ? [u.role] : [];
      if (role !== "ALL" && !roles.includes(role)) return false;
      if (!kw) return true;
      return `${u.fullName || u.name || ""} ${u.email || ""} ${u.phone || ""} ${u.accountCode || ""}`.toLowerCase().includes(kw);
    });
  }, [users, keyword, role]);

  const paged = useMemo(() => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [filtered, page]);

  const stats = useMemo(() => ({
    total: users.length,
    customers: users.filter((u) => (u.roles || []).includes("CUSTOMER")).length,
    active: users.filter((u) => u.status === "ACTIVE").length,
  }), [users]);

  async function handleToggleStatus(user) {
    const newStatus = user.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    const actionName = newStatus === "ACTIVE" ? "Mở khóa" : "Khóa";
    if (!window.confirm(`Bạn có chắc chắn muốn ${actionName} tài khoản ${user.email}?`)) return;
    try {
      await adminApi.updateUserStatus(user.id, { status: newStatus });
      load();
    } catch (err) {
      alert(`Không thể thực hiện thao tác: ${err?.message || "Lỗi không xác định"}`);
    }
  }

  async function handleDelete(user) {
    if (!window.confirm(`XÓA TÀI KHOẢN VĨNH VIỄN!\nBạn có chắc chắn muốn xóa tài khoản ${user.email} không?\n(Nếu người dùng có lịch đặt hoặc hóa đơn, thao tác này sẽ thất bại).`)) return;
    try {
      await adminApi.deleteUser(user.id);
      load();
    } catch (err) {
      alert(err?.message || "Không thể xóa tài khoản.");
    }
  }

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 p-4 sm:p-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Khách hàng</h1>
          <p className="mt-1 text-sm text-slate-500">Quản lý toàn bộ tài khoản người dùng trong hệ thống.</p>
        </div>
        <button onClick={load} className="flex h-10 w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50">
          <RefreshCw size={16} /> Tải lại
        </button>
      </header>

      {/* Thống kê nhanh */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          ["Tổng tài khoản", stats.total, "text-slate-900"],
          ["Khách hàng", stats.customers, "text-blue-600"],
          ["Đang hoạt động", stats.active, "text-emerald-600"],
        ].map(([label, value, cls]) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-bold text-slate-500">{label}</p>
            <p className={`mt-1 text-2xl font-black ${cls}`}>{new Intl.NumberFormat("vi-VN").format(value)}</p>
          </div>
        ))}
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 p-5 pb-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-2 text-slate-800">
            <UsersRound size={18} className="text-blue-600" />
            <span className="font-extrabold">{filtered.length} tài khoản</span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <select value={role} onChange={(e) => setRole(e.target.value)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold outline-none focus:border-blue-500">
              {ROLE_FILTERS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            <label className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-3 lg:w-80">
              <Search size={16} className="text-slate-400" />
              <input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="Tìm theo tên, email, SĐT..." className="w-full bg-transparent text-sm outline-none" />
            </label>
          </div>
        </div>

        {loading ? (
          <p className="py-16 text-center text-sm text-slate-500"><RefreshCw className="mx-auto mb-2 animate-spin" size={22} />Đang tải danh sách người dùng...</p>
        ) : error ? (
          <div className="p-10 text-center">
            <AlertTriangle className="mx-auto mb-2 text-red-500" size={24} />
            <p className="text-sm font-bold text-red-700">{error}</p>
            <button onClick={load} className="mt-3 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white">Thử lại</button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <UsersRound size={40} className="mx-auto text-slate-200" />
            <p className="mt-3 text-sm font-bold text-slate-500">Không có tài khoản nào khớp bộ lọc</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto px-5">
              <table className="w-full min-w-[820px] whitespace-nowrap text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-[10px] uppercase tracking-wider text-slate-400">
                    <th className="px-2 py-3 font-bold">Mã tài khoản</th>
                    <th className="px-2 py-3 font-bold">Họ và tên</th>
                    <th className="px-2 py-3 font-bold">Email</th>
                    <th className="px-2 py-3 font-bold">Số điện thoại</th>
                    <th className="px-2 py-3 font-bold">Vai trò</th>
                    <th className="px-2 py-3 font-bold">Trạng thái</th>
                    <th className="px-2 py-3 font-bold">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paged.map((u) => {
                    const roles = Array.isArray(u.roles) ? u.roles : u.role ? [u.role] : [];
                    return (
                      <tr key={u.id} className="transition-colors hover:bg-slate-50">
                        <td className="px-2 py-3 font-mono text-[10px] font-bold text-slate-400">{u.accountCode || `#${u.id}`}</td>
                        <td className="max-w-[180px] truncate px-2 py-3 font-semibold text-slate-900">{u.fullName || u.name || "—"}</td>
                        <td className="max-w-[200px] truncate px-2 py-3 text-slate-500">{u.email || "—"}</td>
                        <td className="px-2 py-3 text-slate-500">{u.phone || "—"}</td>
                        <td className="px-2 py-3">
                          <div className="flex flex-wrap gap-1">
                            {roles.length > 0 ? roles.map((r) => (
                              <span key={r} className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${roleColors[r] || "bg-slate-100 text-slate-600"}`}>{r}</span>
                            )) : <span className="text-slate-400">—</span>}
                          </div>
                        </td>
                        <td className="px-2 py-3">
                          <span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold ${u.status === "ACTIVE" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                            {u.status === "ACTIVE" ? "Hoạt động" : u.status || "—"}
                          </span>
                        </td>
                        <td className="px-2 py-3">
                          {roles.includes("ADMIN") ? (
                            <span className="text-[10px] italic text-slate-400">Không thể sửa</span>
                          ) : (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleToggleStatus(u)}
                                title={u.status === "ACTIVE" ? "Khóa tài khoản" : "Mở khóa tài khoản"}
                                className={`rounded-lg p-1.5 transition-colors ${u.status === "ACTIVE" ? "bg-amber-50 text-amber-600 hover:bg-amber-100" : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"}`}
                              >
                                {u.status === "ACTIVE" ? <Lock size={14} /> : <Unlock size={14} />}
                              </button>
                              <button onClick={() => handleDelete(u)} title="Xóa tài khoản" className="rounded-lg bg-red-50 p-1.5 text-red-600 transition-colors hover:bg-red-100">
                                <Trash2 size={14} />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <Pagination page={page} pageSize={PAGE_SIZE} total={filtered.length} onPageChange={setPage} />
          </>
        )}
      </section>
    </div>
  );
}
