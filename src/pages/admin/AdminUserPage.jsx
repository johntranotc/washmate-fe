import { useEffect, useState } from "react";
import { RefreshCcw } from "lucide-react";
import { adminApi } from "../../api/adminApi";

const roleColors = {
  ADMIN: "bg-blue-100 text-blue-700",
  STAFF: "bg-cyan-100 text-cyan-700",
  CUSTOMER: "bg-emerald-100 text-emerald-700",
};

export default function AdminUserPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  function load(p = 0) {
    setLoading(true);
    adminApi
      .getAllUsers({ page: p, size: 20 })
      .then((data) => {
        if (Array.isArray(data)) {
          setUsers(data);
          setTotalPages(1);
        } else {
          setUsers(data?.content ?? []);
          setTotalPages(data?.totalPages ?? 1);
        }
        setPage(p);
      })
      .catch(() => { setUsers([]); setTotalPages(0); })
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(0); }, []);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">Quản trị WashMate</p>
          <h1 className="mt-1 text-2xl font-extrabold text-slate-900">Người dùng hệ thống</h1>
          <p className="mt-1 text-sm text-slate-500">Danh sách tất cả tài khoản trong hệ thống.</p>
        </div>
        <button onClick={() => load(page)} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50">
          <RefreshCcw size={13} /> Tải lại
        </button>
      </header>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {loading ? (
          <p className="py-14 text-center text-sm text-slate-500">Đang tải danh sách người dùng...</p>
        ) : users.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm font-semibold text-slate-600">Chưa có người dùng nào.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-xs">
              <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="p-4">ID</th>
                  <th className="p-4">Họ và tên</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Số điện thoại</th>
                  <th className="p-4">Vai trò</th>
                  <th className="p-4">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 text-slate-400 font-mono">#{u.id}</td>
                    <td className="p-4 font-semibold text-slate-900">{u.fullName || u.name || "–"}</td>
                    <td className="p-4 text-slate-500">{u.email || "–"}</td>
                    <td className="p-4 text-slate-500">{u.phone || "–"}</td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {(u.roles ?? []).map((r) => (
                          <span key={r} className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${roleColors[r] || "bg-slate-100 text-slate-600"}`}>
                            {r}
                          </span>
                        ))}
                        {(u.roles ?? []).length === 0 && <span className="text-slate-400">–</span>}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        u.status === "ACTIVE" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
                      }`}>
                        {u.status || "–"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button disabled={page === 0} onClick={() => load(page - 1)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 disabled:opacity-40 hover:bg-slate-50">← Trước</button>
          <span className="text-xs text-slate-500">Trang {page + 1} / {totalPages}</span>
          <button disabled={page >= totalPages - 1} onClick={() => load(page + 1)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 disabled:opacity-40 hover:bg-slate-50">Sau →</button>
        </div>
      )}
    </div>
  );
}
