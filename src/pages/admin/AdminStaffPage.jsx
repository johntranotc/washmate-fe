import { useCallback, useEffect, useMemo, useState } from "react";
import {
  UsersRound, UserCheck, ShieldCheck, UserCog, Building2, Lock,
  Search, RefreshCw, AlertTriangle, MoreHorizontal, UserPlus,
} from "lucide-react";
import PageContainer from "@/components/shared/PageContainer";
import PageHeader from "@/components/shared/PageHeader";
import { KpiCard } from "@/components/shared/KpiCard";
import Pagination from "../../components/common/Pagination";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import { confirmDialog } from "@/components/shared/ConfirmDialog";
import { adminApi } from "../../api/adminApi";
import { garageApi } from "../../api/garageApi";
import { formatNumber, friendlyName } from "../../lib/format";
import { cn } from "@/lib/utils";
import {
  AdminStaffDrawer,
  STAFF_ROLE_LABELS,
  STAFF_ROLE_TONES,
  STAFF_STATUS_LABELS,
  STAFF_STATUS_TONES,
  roleLabel,
  statusLabel,
} from "../../components/admin/staff/AdminStaffDrawer";

// Vai trò vận hành hiển thị ở trang này (theo enum role thật của BE)
const OPERATIONAL_ROLES = ["ADMIN", "OWNER", "MANAGER", "STAFF"];

const TABS = [
  { key: "ALL", label: "Tất cả" },
  { key: "MANAGER", label: "Quản lý" },
  { key: "STAFF", label: "Nhân viên" },
  { key: "UNASSIGNED", label: "Chưa gán chi nhánh" },
  { key: "BLOCKED", label: "Tạm khóa" },
];

const SORT_OPTIONS = [
  // BE không trả updatedAt → sort mặc định theo tài khoản mới nhất (id)
  { key: "newest", label: "Mới nhất" },
  { key: "name", label: "Tên A-Z" },
  { key: "role", label: "Vai trò" },
  { key: "branch", label: "Chi nhánh" },
  { key: "status", label: "Trạng thái" },
];

function extractPage(data) {
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.data?.content)) return data.data.content;
  if (Array.isArray(data)) return data;
  return [];
}

function StaffSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
        {Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
      </div>
      <Skeleton className="h-24 rounded-2xl" />
      <Skeleton className="h-96 rounded-2xl" />
    </div>
  );
}

/**
 * Trang Nhân viên (Admin) — quản lý tài khoản vận hành, vai trò, trạng thái
 * và chi nhánh được gán. Dữ liệu thật: GET /admin/users (lọc role vận hành),
 * GET /v1/garages (tên chi nhánh). Action thật duy nhất BE hỗ trợ:
 * PUT /admin/users/{id}/status (tạm khóa / kích hoạt lại).
 * BE chưa có API: tạo/mời nhân viên, đổi vai trò, gán chi nhánh, đặt lại
 * mật khẩu bởi admin, lịch làm việc → disable/toast rõ ràng, không fake.
 */
export default function AdminStaffPage() {
  const [users, setUsers] = useState([]);
  const [garages, setGarages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const [keyword, setKeyword] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [garageFilter, setGarageFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortKey, setSortKey] = useState("newest");
  const [tab, setTab] = useState("ALL");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  const [detailTarget, setDetailTarget] = useState(null);
  const [menu, setMenu] = useState(null); // { member, x, y }
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const [uRes, gRes] = await Promise.allSettled([
      adminApi.getAllUsers({ size: 1000 }),
      garageApi.getAll(),
    ]);
    if (uRes.status === "fulfilled") {
      setUsers(extractPage(uRes.value));
      setLastUpdated(new Date());
    } else {
      console.error("[AdminStaff] load users failed:", uRes.reason);
      setError(uRes.reason?.message || "Không thể tải danh sách nhân viên. Vui lòng thử lại.");
      setUsers([]);
    }
    setGarages(gRes.status === "fulfilled" && Array.isArray(gRes.value) ? gRes.value : []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [keyword, roleFilter, garageFilter, statusFilter, sortKey, tab, pageSize, users]);

  const garageNameOf = useCallback((id) => {
    const g = garages.find((x) => String(x.id ?? x.garageId) === String(id));
    return g ? friendlyName(g.name ?? g.garageName, "Chi nhánh chưa cập nhật") : `Chi nhánh #${id}`;
  }, [garages]);

  // Nhân sự vận hành thật từ GET /admin/users: có role vận hành, loại DELETED.
  const members = useMemo(() => users
    .filter((u) => {
      if (u.status === "DELETED") return false;
      const roles = Array.isArray(u.roles) && u.roles.length ? u.roles : u.role ? [u.role] : [];
      return roles.some((r) => OPERATIONAL_ROLES.includes(String(r).toUpperCase()));
    })
    .map((u) => {
      const garageIds = Array.isArray(u.garageIds) ? u.garageIds : [];
      return {
        ...u,
        garageIds,
        branchNames: garageIds.map(garageNameOf),
        unassigned: garageIds.length === 0,
      };
    }), [users, garageNameOf]);

  // KPI — tính toàn bộ từ response API thật, không hardcode.
  const kpis = useMemo(() => ({
    total: members.length,
    active: members.filter((m) => m.status === "ACTIVE").length,
    managers: members.filter((m) => m.role === "MANAGER").length,
    operational: members.filter((m) => m.role === "STAFF").length,
    unassigned: members.filter((m) => m.unassigned).length,
    locked: members.filter((m) => m.status === "BLOCKED").length,
  }), [members]);

  const KPI_CARDS = [
    { key: "total", label: "Tổng nhân viên", Icon: UsersRound, tone: "text-primary bg-primary-container" },
    { key: "active", label: "Đang hoạt động", Icon: UserCheck, tone: "text-success bg-success-container" },
    { key: "managers", label: "Quản lý", Icon: ShieldCheck, tone: "text-accent-indigo bg-accent-indigo/10" },
    { key: "operational", label: "Nhân viên vận hành", Icon: UserCog, tone: "text-accent-cyan bg-accent-cyan/10" },
    { key: "unassigned", label: "Chưa gán chi nhánh", Icon: Building2, tone: "text-warning bg-warning-container" },
    { key: "locked", label: "Tạm khóa", Icon: Lock, tone: "text-critical bg-critical-container" },
  ];

  const tabMatch = useCallback((m, key) => {
    switch (key) {
      case "MANAGER": return m.role === "MANAGER";
      case "STAFF": return m.role === "STAFF";
      case "UNASSIGNED": return m.unassigned;
      case "BLOCKED": return m.status === "BLOCKED";
      default: return true;
    }
  }, []);

  const scoped = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return members.filter((m) => {
      if (roleFilter !== "ALL" && m.role !== roleFilter) return false;
      if (garageFilter === "unassigned") {
        if (!m.unassigned) return false;
      } else if (garageFilter !== "all" && !m.garageIds.some((id) => String(id) === String(garageFilter))) {
        return false;
      }
      if (statusFilter !== "ALL" && m.status !== statusFilter) return false;
      if (kw) {
        const hay = `${m.fullName || ""} ${m.email || ""} ${m.phone || ""} ${m.accountCode || ""}`.toLowerCase();
        if (!hay.includes(kw)) return false;
      }
      return true;
    });
  }, [members, keyword, roleFilter, garageFilter, statusFilter]);

  const tabCounts = useMemo(
    () => Object.fromEntries(TABS.map((t) => [t.key, scoped.filter((m) => tabMatch(m, t.key)).length])),
    [scoped, tabMatch],
  );

  const filtered = useMemo(() => {
    const list = scoped.filter((m) => tabMatch(m, tab));
    const byName = (a, b) => (a.fullName || "").localeCompare(b.fullName || "", "vi");
    switch (sortKey) {
      case "name": return [...list].sort(byName);
      case "role": return [...list].sort((a, b) =>
        OPERATIONAL_ROLES.indexOf(a.role) - OPERATIONAL_ROLES.indexOf(b.role) || byName(a, b));
      case "branch": return [...list].sort((a, b) =>
        (a.branchNames[0] || "￿").localeCompare(b.branchNames[0] || "￿", "vi") || byName(a, b));
      case "status": return [...list].sort((a, b) =>
        (a.status || "").localeCompare(b.status || "") || byName(a, b));
      default: return [...list].sort((a, b) => b.id - a.id);
    }
  }, [scoped, tab, tabMatch, sortKey]);

  const paged = useMemo(
    () => filtered.slice((page - 1) * pageSize, page * pageSize),
    [filtered, page, pageSize],
  );

  const hasFilter = keyword.trim() !== "" || roleFilter !== "ALL" || garageFilter !== "all"
    || statusFilter !== "ALL" || tab !== "ALL";
  const clearFilters = () => {
    setKeyword(""); setRoleFilter("ALL"); setGarageFilter("all");
    setStatusFilter("ALL"); setTab("ALL");
  };

  // Tạm khóa / kích hoạt lại — API thật PUT /admin/users/{id}/status.
  async function handleToggleLock(member) {
    const locking = member.status !== "BLOCKED";
    const ok = await confirmDialog({
      title: locking ? "Tạm khóa tài khoản nhân viên?" : "Kích hoạt lại tài khoản?",
      description: `${friendlyName(member.fullName, "Nhân viên")} (${member.email || member.accountCode}). ${
        locking
          ? "Nhân viên sẽ không thể đăng nhập hoặc thao tác trong hệ thống cho đến khi được kích hoạt lại."
          : "Nhân viên sẽ đăng nhập và vận hành bình thường."
      }`,
      confirmLabel: locking ? "Tạm khóa" : "Kích hoạt lại",
      destructive: locking,
    });
    if (!ok) return;
    setBusyId(member.id);
    try {
      await adminApi.updateUserStatus(member.id, { status: locking ? "BLOCKED" : "ACTIVE" });
      toast.success(locking ? "Đã tạm khóa tài khoản" : "Đã kích hoạt lại tài khoản", {
        description: friendlyName(member.fullName, "Nhân viên"),
      });
      load();
    } catch (e) {
      toast.error("Thao tác thất bại", { description: e?.message || "Lỗi không xác định" });
    } finally {
      setBusyId(null);
    }
  }

  // BE chưa có API cho các action này — toast rõ ràng, không fake success.
  const notSupported = (label) => () =>
    toast.info(`Chức năng ${label} chưa được hệ thống hỗ trợ.`);

  function openMenu(e, member) {
    const r = e.currentTarget.getBoundingClientRect();
    setMenu({ member, x: r.right, y: r.bottom });
  }

  const updatedLabel = lastUpdated
    ? lastUpdated.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    : null;

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Quản trị hệ thống"
        title="Nhân viên"
        description="Quản lý tài khoản nhân viên, vai trò và phân quyền theo chi nhánh."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={load} disabled={loading}>
              <RefreshCw className={loading ? "animate-spin" : ""} /> Tải lại
            </Button>
            {/* BE chưa có API tạo/mời nhân viên — toast, không fake */}
            <Button size="sm" onClick={notSupported("thêm nhân viên")}>
              <UserPlus /> Thêm nhân viên
            </Button>
            {updatedLabel && (
              <span className="text-xs font-medium text-muted-foreground">Cập nhật lúc {updatedLabel}</span>
            )}
          </div>
        }
      />

      {loading && !users.length ? (
        <StaffSkeleton />
      ) : error && !users.length ? (
        <div className="rounded-2xl border border-critical/25 bg-critical-container p-8 text-center">
          <AlertTriangle className="mx-auto mb-3 text-critical" size={28} />
          <p className="text-sm font-bold text-critical">{error}</p>
          <Button size="sm" onClick={load} className="mt-4 bg-critical text-white hover:bg-critical/90">Thử lại</Button>
        </div>
      ) : (
        <>
          {/* KPI */}
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
            {KPI_CARDS.map(({ key, label, Icon, tone }) => (
              <KpiCard key={key} label={label} value={formatNumber(kpis[key])} icon={<Icon size={18} />} tone={tone} />
            ))}
          </section>

          {/* Search + filter + tabs */}
          <section className="rounded-2xl border border-border bg-card p-4">
            <div className="flex flex-wrap items-center gap-3">
              <label className="flex h-10 min-w-[220px] flex-1 items-center gap-2 rounded-xl border border-border px-3 lg:max-w-sm">
                <Search size={16} className="text-neutral-muted" />
                <input
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Tìm theo tên, email, SĐT..."
                  className="w-full bg-transparent text-sm outline-none"
                />
              </label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="h-10 rounded-xl border border-input bg-background px-3 text-xs font-bold outline-none focus:border-ring"
                aria-label="Lọc vai trò"
              >
                <option value="ALL">Tất cả vai trò</option>
                {OPERATIONAL_ROLES.map((r) => (
                  <option key={r} value={r}>{STAFF_ROLE_LABELS[r]}</option>
                ))}
              </select>
              <select
                value={garageFilter}
                onChange={(e) => setGarageFilter(e.target.value)}
                className="h-10 rounded-xl border border-input bg-background px-3 text-xs font-bold outline-none focus:border-ring"
                aria-label="Lọc chi nhánh"
              >
                <option value="all">Tất cả chi nhánh</option>
                {garages.map((g) => (
                  <option key={g.id ?? g.garageId} value={g.id ?? g.garageId}>
                    {friendlyName(g.name ?? g.garageName, "Chi nhánh chưa cập nhật")}
                  </option>
                ))}
                <option value="unassigned">Chưa gán chi nhánh</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 rounded-xl border border-input bg-background px-3 text-xs font-bold outline-none focus:border-ring"
                aria-label="Lọc trạng thái"
              >
                <option value="ALL">Tất cả trạng thái</option>
                {Object.entries(STAFF_STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
              <select
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value)}
                className="h-10 rounded-xl border border-input bg-background px-3 text-xs font-bold outline-none focus:border-ring"
                aria-label="Sắp xếp"
              >
                {SORT_OPTIONS.map((o) => <option key={o.key} value={o.key}>{o.label}</option>)}
              </select>
              {hasFilter && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs font-bold text-muted-foreground">
                  Xóa bộ lọc
                </Button>
              )}
            </div>

            <div className="no-scrollbar mt-3 flex gap-1 overflow-x-auto border-t border-border pt-3">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setTab(t.key)}
                  className={cn(
                    "flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition",
                    tab === t.key ? "bg-primary text-white" : "bg-surface text-muted-foreground hover:text-foreground",
                  )}
                >
                  {t.label}
                  <span
                    className={cn(
                      "grid h-4 min-w-4 place-items-center rounded-full px-1 text-xs font-bold",
                      tab === t.key ? "bg-card/25 text-white" : "bg-muted text-muted-foreground",
                    )}
                  >
                    {tabCounts[t.key]}
                  </span>
                </button>
              ))}
            </div>
          </section>

          {/* Bảng nhân viên */}
          <section className="rounded-2xl border border-border bg-card">
            <div className="flex flex-wrap items-center justify-between gap-3 p-5 pb-3">
              <div>
                <h2 className="text-lg font-bold text-foreground">Danh sách nhân viên</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Hiển thị {paged.length} / {filtered.length} nhân viên
                </p>
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="px-6 py-14 text-center">
                <UsersRound size={40} className="mx-auto text-border" />
                <p className="mt-3 text-sm font-semibold text-foreground">
                  {hasFilter
                    ? "Không tìm thấy nhân viên phù hợp với bộ lọc hiện tại."
                    : "Chưa có nhân viên nào. Mời nhân viên đầu tiên để bắt đầu phân quyền vận hành."}
                </p>
                {hasFilter && (
                  <Button size="sm" variant="outline" className="mt-4" onClick={clearFilters}>
                    Xóa bộ lọc
                  </Button>
                )}
              </div>
            ) : (
              <>
                <div className="overflow-x-auto px-5">
                  <table className="w-full min-w-[1000px] text-left text-xs">
                    <thead>
                      <tr className="border-b border-border font-semibold text-neutral-muted">
                        <th className="py-3 pr-3 font-semibold">Nhân viên</th>
                        <th className="py-3 pr-3 font-semibold">Email</th>
                        <th className="py-3 pr-3 font-semibold">Số điện thoại</th>
                        <th className="py-3 pr-3 font-semibold">Vai trò</th>
                        <th className="py-3 pr-3 font-semibold">Chi nhánh</th>
                        <th className="py-3 pr-3 font-semibold">Trạng thái</th>
                        <th className="py-3 text-right font-semibold">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface">
                      {paged.map((m) => (
                        <tr key={m.id} className="align-middle hover:bg-surface">
                          <td className="min-w-[190px] py-3 pr-3">
                            <button
                              type="button"
                              onClick={() => setDetailTarget(m)}
                              className="flex items-center gap-2.5 text-left"
                            >
                              {m.avatarUrl ? (
                                <img src={m.avatarUrl} alt="" className="h-9 w-9 shrink-0 rounded-full object-cover" />
                              ) : (
                                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent-cyan text-sm font-bold text-white">
                                  {(m.fullName || m.email || "N").charAt(0).toUpperCase()}
                                </span>
                              )}
                              <span className="min-w-0">
                                <b className="block truncate text-sm text-foreground hover:text-primary">
                                  {friendlyName(m.fullName, "Nhân viên chưa cập nhật")}
                                </b>
                                <span className="block text-neutral-muted">{m.accountCode || `#${m.id}`}</span>
                              </span>
                            </button>
                          </td>
                          <td className="max-w-[200px] truncate py-3 pr-3 text-muted-foreground">
                            {m.email || "Chưa cập nhật"}
                          </td>
                          <td className="py-3 pr-3 font-semibold text-ink-soft">
                            {m.phone || "Chưa cập nhật"}
                          </td>
                          <td className="py-3 pr-3">
                            <span className={`rounded-full px-2.5 py-0.5 font-bold ${STAFF_ROLE_TONES[m.role] || "bg-muted text-muted-foreground"}`}>
                              {roleLabel(m.role)}
                            </span>
                          </td>
                          <td className="max-w-[200px] py-3 pr-3">
                            {m.unassigned ? (
                              <span className="rounded-full bg-warning-container px-2.5 py-0.5 font-bold text-warning">
                                Chưa gán chi nhánh
                              </span>
                            ) : (
                              <span className="block truncate text-muted-foreground" title={m.branchNames.join(", ")}>
                                {m.branchNames[0]}
                                {m.branchNames.length > 1 && (
                                  <span className="ml-1.5 rounded-full bg-muted px-1.5 py-0.5 font-bold text-muted-foreground">
                                    +{m.branchNames.length - 1}
                                  </span>
                                )}
                              </span>
                            )}
                          </td>
                          <td className="py-3 pr-3">
                            <span className={`rounded-full px-2.5 py-0.5 font-bold ${STAFF_STATUS_TONES[m.status] || "bg-muted text-muted-foreground"}`}>
                              {statusLabel(m.status)}
                            </span>
                          </td>
                          <td className="py-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button size="sm" variant="outline" onClick={() => setDetailTarget(m)}>
                                Chi tiết
                              </Button>
                              <button
                                type="button"
                                aria-label="Thao tác khác"
                                onClick={(e) => openMenu(e, m)}
                                className="grid h-8 w-8 place-items-center rounded-lg border border-border text-muted-foreground hover:bg-surface"
                              >
                                <MoreHorizontal size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Pagination
                  page={page}
                  pageSize={pageSize}
                  total={filtered.length}
                  onPageChange={setPage}
                  onPageSizeChange={setPageSize}
                  pageSizeOptions={[8, 16, 32]}
                />
                <div className="border-t border-border px-5 py-3 text-xs text-neutral-muted">
                  Chi tiết nhân viên mở trong ngăn trượt để xem phân quyền và chi nhánh được gán.
                </div>
              </>
            )}
          </section>
        </>
      )}

      {/* Menu ba chấm — định vị fixed để không bị bảng cắt */}
      {menu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setMenu(null)} aria-hidden="true" />
          <div
            className="fixed z-50 w-56 rounded-xl border border-border bg-popover p-1 shadow-floating"
            style={{ top: menu.y + 4, left: Math.max(8, menu.x - 224) }}
          >
            {[
              ["Xem chi tiết", () => setDetailTarget(menu.member)],
              ["Chỉnh sửa thông tin", notSupported("chỉnh sửa nhân viên")],
              ["Gán / đổi chi nhánh", notSupported("gán chi nhánh")],
              ["Đổi vai trò", notSupported("đổi vai trò")],
              ["Đặt lại mật khẩu", notSupported("đặt lại mật khẩu")],
            ].map(([label, fn]) => (
              <button
                key={label}
                type="button"
                onClick={() => { setMenu(null); fn(); }}
                className="block w-full rounded-lg px-3 py-2 text-left text-xs font-semibold text-foreground hover:bg-surface"
              >
                {label}
              </button>
            ))}
            <div className="my-1 border-t border-border" />
            <button
              type="button"
              disabled={busyId === menu.member.id}
              onClick={() => { const m = menu.member; setMenu(null); handleToggleLock(m); }}
              className={cn(
                "block w-full rounded-lg px-3 py-2 text-left text-xs font-bold hover:bg-surface",
                menu.member.status === "BLOCKED" ? "text-success" : "text-critical",
              )}
            >
              {menu.member.status === "BLOCKED" ? "Kích hoạt lại tài khoản" : "Tạm khóa tài khoản"}
            </button>
          </div>
        </>
      )}

      <AdminStaffDrawer
        member={detailTarget}
        open={Boolean(detailTarget)}
        onOpenChange={(open) => { if (!open) setDetailTarget(null); }}
      />
    </PageContainer>
  );
}
