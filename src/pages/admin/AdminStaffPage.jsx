import { useEffect, useMemo, useState } from "react";
import { RefreshCw, AlertTriangle, Search, UserCog } from "lucide-react";
import { adminApi } from "../../api/adminApi";
import { garageApi } from "../../api/garageApi";
import Pagination from "../../components/common/Pagination";

const PAGE_SIZE = 10;

const statusTone = {
  ACTIVE: "bg-emerald-100 text-emerald-700",
  INACTIVE: "bg-slate-100 text-slate-600",
  LOCKED: "bg-red-100 text-red-700",
};

export default function AdminStaffPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);

  const load = () => {
    setLoading(true);
    setError(null);
    adminApi.getAllUsers()
      .then((data) => {
        const list = Array.isArray(data?.content) ? data.content
          : Array.isArray(data?.data?.content) ? data.data.content
          : Array.isArray(data) ? data : [];
        setUsers(list);
      })
      .catch((e) => { setError(e?.message || "Không thể tải danh sách nhân viên."); setUsers([]); })
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const [garages, setGarages] = useState([]);
  useEffect(() => {
    garageApi.getAll()
      .then((d) => setGarages(Array.isArray(d) ? d : d?.data || []))
      .catch(() => setGarages([]));
  }, []);

  const garageNames = (ids) => {
    if (!Array.isArray(ids) || ids.length === 0) return "—";
    return ids.map((id) => {
      const g = garages.find((x) => String(x.id ?? x.garageId) === String(id));
      return g ? (g.name ?? g.garageName) : `Gara #${id}`;
    }).join(", ");
  };

  // Nhân sự vận hành: STAFF và MANAGER
  const staff = useMemo(() => users.filter((u) => {
    const roles = Array.isArray(u.roles) ? u.roles : u.role ? [u.role] : [];
    return roles.some((r) => ["STAFF", "MANAGER"].includes(String(r).toUpperCase()));
  }), [users]);

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    if (!kw) return staff;
    return staff.filter((u) => `${u.fullName || u.name || ""} ${u.email || ""} ${u.phone || ""}`.toLowerCase().includes(kw));
  }, [staff, keyword]);

  useEffect(() => { setPage(1); }, [keyword, users]);
  const paged = useMemo(() => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [filtered, page]);

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 p-4 sm:p-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Nhân viên</h1>
          <p className="mt-1 text-sm text-slate-500">Danh sách tài khoản nhân viên vận hành trong hệ thống.</p>
        </div>
        <button onClick={load} className="flex h-10 w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50">
          <RefreshCw size={16} /> Tải lại
        </button>
      </header>

      <div className="rounded-2xl border border-slate-200 bg-white">
        <div className="flex flex-col gap-3 p-5 pb-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-2 text-slate-800">
            <UserCog size={18} className="text-blue-600" />
            <span className="font-extrabold">Tổng {filtered.length} nhân viên</span>
          </div>
          <label className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-3 lg:w-80">
            <Search size={16} className="text-slate-400" />
            <input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="Tìm theo tên, email, SĐT..." className="w-full bg-transparent text-sm outline-none" />
          </label>
        </div>

        {loading ? (
          <p className="py-16 text-center text-sm text-slate-500"><RefreshCw className="mx-auto mb-2 animate-spin" size={22} />Đang tải...</p>
        ) : error ? (
          <div className="p-10 text-center">
            <AlertTriangle className="mx-auto mb-2 text-red-500" size={24} />
            <p className="text-sm font-bold text-red-700">{error}</p>
            <button onClick={load} className="mt-3 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white">Thử lại</button>
          </div>
        ) : filtered.length === 0 ? (
          <p className="py-16 text-center text-sm text-slate-400">Chưa có nhân viên nào.</p>
        ) : (
          <>
            <div className="overflow-x-auto px-5">
              <table className="w-full min-w-[720px] text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] uppercase tracking-wider text-slate-400">
                    <th className="py-3 pr-3 font-bold">Nhân viên</th>
                    <th className="py-3 pr-3 font-bold">Email</th>
                    <th className="py-3 pr-3 font-bold">Số điện thoại</th>
                    <th className="py-3 pr-3 font-bold">Vai trò</th>
                    <th className="py-3 pr-3 font-bold">Chi nhánh</th>
                    <th className="py-3 font-bold">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {paged.map((u) => {
                    const roles = Array.isArray(u.roles) ? u.roles : u.role ? [u.role] : [];
                    return (
                      <tr key={u.id} className="hover:bg-slate-50">
                        <td className="py-3 pr-3 font-bold text-slate-800">{u.fullName || u.name || "–"}</td>
                        <td className="py-3 pr-3 text-slate-600">{u.email || "–"}</td>
                        <td className="py-3 pr-3 text-slate-600">{u.phone || "–"}</td>
                        <td className="py-3 pr-3 text-slate-600">{roles.join(", ") || "–"}</td>
                        <td className="max-w-[200px] truncate py-3 pr-3 text-slate-600">{garageNames(u.garageIds)}</td>
                        <td className="py-3">
                          <span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold ${statusTone[u.status] || "bg-slate-100 text-slate-600"}`}>
                            {u.status || "—"}
                          </span>
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
      </div>
    </div>
  );
}
