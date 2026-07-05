import { useEffect, useMemo, useState } from "react";
import PageContainer from "@/components/shared/PageContainer";
import PageHeader from "@/components/shared/PageHeader";
import { RefreshCw, AlertTriangle, Search, UserCog } from "lucide-react";
import { adminApi } from "../../api/adminApi";
import { garageApi } from "../../api/garageApi";
import Pagination from "../../components/common/Pagination";
import { Button } from "@/components/ui/button";

const PAGE_SIZE = 10;

const statusTone = {
  ACTIVE: "bg-success-container text-success",
  INACTIVE: "bg-muted text-muted-foreground",
  LOCKED: "bg-critical-container text-critical",
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
    <PageContainer>
      <PageHeader
        title="Nhân viên"
        description="Danh sách tài khoản nhân viên vận hành trong hệ thống."
        actions={
          <Button variant="outline" onClick={load} className="w-fit text-ink-soft">
            <RefreshCw /> Tải lại
          </Button>
        }
      />

      <div className="rounded-2xl border border-border bg-card">
        <div className="flex flex-col gap-3 p-5 pb-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-2 text-foreground">
            <UserCog size={18} className="text-primary" />
            <span className="font-extrabold">Tổng {filtered.length} nhân viên</span>
          </div>
          <label className="flex h-10 items-center gap-2 rounded-xl border border-border px-3 lg:w-80">
            <Search size={16} className="text-neutral-muted" />
            <input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="Tìm theo tên, email, SĐT..." className="w-full bg-transparent text-sm outline-none" />
          </label>
        </div>

        {loading ? (
          <p className="py-16 text-center text-sm text-muted-foreground"><RefreshCw className="mx-auto mb-2 animate-spin" size={20} />Đang tải...</p>
        ) : error ? (
          <div className="p-10 text-center">
            <AlertTriangle className="mx-auto mb-2 text-critical" size={24} />
            <p className="text-sm font-bold text-critical">{error}</p>
            <Button variant="destructive" size="sm" onClick={load} className="mt-3">Thử lại</Button>
          </div>
        ) : filtered.length === 0 ? (
          <p className="py-16 text-center text-sm text-neutral-muted">Chưa có nhân viên nào.</p>
        ) : (
          <>
            <div className="overflow-x-auto px-5">
              <table className="w-full min-w-[720px] text-left text-xs">
                <thead>
                  <tr className="border-b border-border text-xs text-neutral-muted">
                    <th className="py-3 pr-3 font-semibold">Nhân viên</th>
                    <th className="py-3 pr-3 font-semibold">Email</th>
                    <th className="py-3 pr-3 font-semibold">Số điện thoại</th>
                    <th className="py-3 pr-3 font-semibold">Vai trò</th>
                    <th className="py-3 pr-3 font-semibold">Chi nhánh</th>
                    <th className="py-3 font-semibold">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface">
                  {paged.map((u) => {
                    const roles = Array.isArray(u.roles) ? u.roles : u.role ? [u.role] : [];
                    return (
                      <tr key={u.id} className="hover:bg-surface">
                        <td className="py-3 pr-3 font-bold text-foreground">{u.fullName || u.name || "–"}</td>
                        <td className="py-3 pr-3 text-muted-foreground">{u.email || "–"}</td>
                        <td className="py-3 pr-3 text-muted-foreground">{u.phone || "–"}</td>
                        <td className="py-3 pr-3 text-muted-foreground">{roles.join(", ") || "–"}</td>
                        <td className="max-w-[200px] truncate py-3 pr-3 text-muted-foreground">{garageNames(u.garageIds)}</td>
                        <td className="py-3">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-extrabold ${statusTone[u.status] || "bg-muted text-muted-foreground"}`}>
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
    </PageContainer>
  );
}
