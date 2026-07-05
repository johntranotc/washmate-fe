import { useEffect, useMemo, useState } from "react";
import PageContainer from "@/components/shared/PageContainer";
import PageHeader from "@/components/shared/PageHeader";
import { RefreshCw, Lock, Unlock, Trash2, Search, UsersRound, AlertTriangle } from "lucide-react";
import { adminApi } from "../../api/adminApi";
import Pagination from "../../components/common/Pagination";
import { toast } from "@/components/ui/toast";
import { confirmDialog } from "@/components/shared/ConfirmDialog";
import { Button } from "@/components/ui/button";

const PAGE_SIZE = 10;

const roleColors = {
  ADMIN: "bg-primary-container text-primary-strong",
  OWNER: "bg-accent-violet/15 text-accent-violet",
  MANAGER: "bg-accent-indigo/15 text-accent-indigo",
  STAFF: "bg-accent-cyan/15 text-accent-cyan",
  CUSTOMER: "bg-success-container text-success",
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
    const confirmed = await confirmDialog({
      title: `${actionName} tài khoản?`,
      description: `Tài khoản ${user.email} sẽ được ${actionName.toLowerCase()}.`,
      confirmLabel: actionName,
      destructive: newStatus === "INACTIVE",
    });
    if (!confirmed) return;
    try {
      await adminApi.updateUserStatus(user.id, { status: newStatus });
      toast.success(`Đã ${actionName.toLowerCase()} tài khoản ${user.email}.`);
      load();
    } catch (err) {
      toast.error("Không thể thực hiện thao tác", { description: err?.message || "Lỗi không xác định" });
    }
  }

  async function handleDelete(user) {
    const confirmed = await confirmDialog({
      title: "Xóa tài khoản vĩnh viễn?",
      description: `Tài khoản ${user.email} sẽ bị xóa và không thể khôi phục. Nếu người dùng có lịch đặt hoặc hóa đơn, thao tác này sẽ thất bại.`,
      confirmLabel: "Xóa vĩnh viễn",
      destructive: true,
    });
    if (!confirmed) return;
    try {
      await adminApi.deleteUser(user.id);
      toast.success(`Đã xóa tài khoản ${user.email}.`);
      load();
    } catch (err) {
      toast.error("Không thể xóa tài khoản", { description: err?.message || "Lỗi không xác định" });
    }
  }

  return (
    <PageContainer>
      <PageHeader
        title="Khách hàng"
        description="Quản lý toàn bộ tài khoản người dùng trong hệ thống."
        actions={
          <Button variant="outline" onClick={load} className="w-fit text-ink-soft">
            <RefreshCw /> Tải lại
          </Button>
        }
      />

      {/* Thống kê nhanh */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          ["Tổng tài khoản", stats.total, "text-foreground"],
          ["Khách hàng", stats.customers, "text-primary"],
          ["Đang hoạt động", stats.active, "text-success"],
        ].map(([label, value, cls]) => (
          <div key={label} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <p className="text-xs font-bold text-muted-foreground">{label}</p>
            <p className={`mt-1 text-2xl font-black ${cls}`}>{new Intl.NumberFormat("vi-VN").format(value)}</p>
          </div>
        ))}
      </div>

      <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="flex flex-col gap-3 p-5 pb-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-2 text-foreground">
            <UsersRound size={18} className="text-primary" />
            <span className="font-extrabold">{filtered.length} tài khoản</span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <select value={role} onChange={(e) => setRole(e.target.value)} className="h-10 rounded-xl border border-border bg-card px-3 text-sm font-semibold outline-none focus:border-primary">
              {ROLE_FILTERS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            <label className="flex h-10 items-center gap-2 rounded-xl border border-border px-3 lg:w-80">
              <Search size={16} className="text-neutral-muted" />
              <input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="Tìm theo tên, email, SĐT..." className="w-full bg-transparent text-sm outline-none" />
            </label>
          </div>
        </div>

        {loading ? (
          <p className="py-16 text-center text-sm text-muted-foreground"><RefreshCw className="mx-auto mb-2 animate-spin" size={20} />Đang tải danh sách người dùng...</p>
        ) : error ? (
          <div className="p-10 text-center">
            <AlertTriangle className="mx-auto mb-2 text-critical" size={24} />
            <p className="text-sm font-bold text-critical">{error}</p>
            <Button variant="destructive" size="sm" onClick={load} className="mt-3">Thử lại</Button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <UsersRound size={40} className="mx-auto text-border" />
            <p className="mt-3 text-sm font-bold text-muted-foreground">Không có tài khoản nào khớp bộ lọc</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto px-5">
              <table className="w-full min-w-[820px] whitespace-nowrap text-left text-xs">
                <thead>
                  <tr className="border-b border-border text-xs font-semibold text-neutral-muted">
                    <th className="px-2 py-3 font-semibold">Mã tài khoản</th>
                    <th className="px-2 py-3 font-semibold">Họ và tên</th>
                    <th className="px-2 py-3 font-semibold">Email</th>
                    <th className="px-2 py-3 font-semibold">Số điện thoại</th>
                    <th className="px-2 py-3 font-semibold">Vai trò</th>
                    <th className="px-2 py-3 font-semibold">Trạng thái</th>
                    <th className="px-2 py-3 font-semibold">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {paged.map((u) => {
                    const roles = Array.isArray(u.roles) ? u.roles : u.role ? [u.role] : [];
                    return (
                      <tr key={u.id} className="transition-colors hover:bg-surface">
                        <td className="px-2 py-3 font-mono text-xs font-bold text-neutral-muted">{u.accountCode || `#${u.id}`}</td>
                        <td className="max-w-[180px] truncate px-2 py-3 font-semibold text-foreground">{u.fullName || u.name || "—"}</td>
                        <td className="max-w-[200px] truncate px-2 py-3 text-muted-foreground">{u.email || "—"}</td>
                        <td className="px-2 py-3 text-muted-foreground">{u.phone || "—"}</td>
                        <td className="px-2 py-3">
                          <div className="flex flex-wrap gap-1">
                            {roles.length > 0 ? roles.map((r) => (
                              <span key={r} className={`rounded-full px-2 py-0.5 text-xs font-bold ${roleColors[r] || "bg-muted text-muted-foreground"}`}>{r}</span>
                            )) : <span className="text-neutral-muted">—</span>}
                          </div>
                        </td>
                        <td className="px-2 py-3">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-extrabold ${u.status === "ACTIVE" ? "bg-success-container text-success" : "bg-muted text-muted-foreground"}`}>
                            {u.status === "ACTIVE" ? "Hoạt động" : u.status || "—"}
                          </span>
                        </td>
                        <td className="px-2 py-3">
                          {roles.includes("ADMIN") ? (
                            <span className="text-xs italic text-neutral-muted">Không thể sửa</span>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => handleToggleStatus(u)}
                                title={u.status === "ACTIVE" ? "Khóa tài khoản" : "Mở khóa tài khoản"}
                                className={u.status === "ACTIVE" ? "bg-warning-container text-warning hover:bg-warning-container hover:text-warning" : "bg-success-container text-success hover:bg-success-container hover:text-success"}
                              >
                                {u.status === "ACTIVE" ? <Lock className="size-3.5" /> : <Unlock className="size-3.5" />}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => handleDelete(u)}
                                title="Xóa tài khoản"
                                className="bg-critical-container text-critical hover:bg-critical-container hover:text-critical"
                              >
                                <Trash2 className="size-3.5" />
                              </Button>
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
    </PageContainer>
  );
}
