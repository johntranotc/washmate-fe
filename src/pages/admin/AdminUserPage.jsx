import { useCallback, useEffect, useMemo, useState } from "react";
import {
  UsersRound, UserPlus, UserCheck, CalendarCheck2, Star, Search,
  RefreshCw, AlertTriangle, Download, MoreHorizontal,
} from "lucide-react";
import PageContainer from "@/components/shared/PageContainer";
import PageHeader from "@/components/shared/PageHeader";
import Pagination from "../../components/common/Pagination";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import { confirmDialog } from "@/components/shared/ConfirmDialog";
import { adminApi } from "../../api/adminApi";
import { garageApi } from "../../api/garageApi";
import { vehicleApi } from "../../api/vehicleApi";
import { normalizeBookingList, normalizeStaffBooking } from "../../lib/staff-booking-data";
import { todayISO, formatDate, formatNumber, friendlyName } from "../../lib/format";
import { cn } from "@/lib/utils";
import { AdminCustomerDrawer } from "../../components/admin/customers/AdminCustomerDrawer";

const USER_STATUS_LABELS = {
  ACTIVE: "Hoạt động",
  INACTIVE: "Không hoạt động",
  BLOCKED: "Bị khóa",
  PENDING_VERIFY: "Chờ xác minh",
};

const STATUS_TONES = {
  ACTIVE: "bg-success-container text-success",
  INACTIVE: "bg-muted text-muted-foreground",
  BLOCKED: "bg-critical-container text-critical",
  PENDING_VERIFY: "bg-warning-container text-warning",
};

const TABS = [
  { key: "ALL", label: "Tất cả" },
  { key: "ACTIVE", label: "Hoạt động" },
  { key: "INACTIVE", label: "Không hoạt động" },
  { key: "NEW", label: "Khách mới" },
  { key: "HAS_BOOKING", label: "Có booking" },
  { key: "ATTENTION", label: "Cần chú ý" },
];

function extractPage(data) {
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.data?.content)) return data.data.content;
  if (Array.isArray(data)) return data;
  return [];
}

function CustomersSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
        {Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
      </div>
      <Skeleton className="h-24 rounded-2xl" />
      <Skeleton className="h-96 rounded-2xl" />
    </div>
  );
}

/**
 * Trang Khách hàng (Admin) — hồ sơ customer + xe + lịch sử dịch vụ.
 * Dữ liệu thật: GET /admin/users (lọc role CUSTOMER), GET /v1/vehicles,
 * GET /bookings, GET /v1/garages. Loyalty per-khách chưa có API admin →
 * hiển thị trạng thái chờ, không bịa điểm/hạng.
 */
export default function AdminUserPage() {
  const [users, setUsers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [garages, setGarages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [garageFilter, setGarageFilter] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [tab, setTab] = useState("ALL");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  const [detailTarget, setDetailTarget] = useState(null);
  const [menu, setMenu] = useState(null); // { customer, x, y }
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const [uRes, vRes, bRes, gRes] = await Promise.allSettled([
      adminApi.getAllUsers({ size: 1000 }),
      vehicleApi.getAllVehicles(),
      adminApi.getBookings({ size: 1000 }),
      garageApi.getAll(),
    ]);
    if (uRes.status === "fulfilled") {
      setUsers(extractPage(uRes.value));
      setLastUpdated(new Date());
    } else {
      console.error("[AdminCustomers] load users failed:", uRes.reason);
      setError(uRes.reason?.message || "Không thể tải danh sách khách hàng.");
      setUsers([]);
    }
    setVehicles(vRes.status === "fulfilled" && Array.isArray(vRes.value) ? vRes.value : []);
    setBookings(bRes.status === "fulfilled" ? normalizeBookingList(bRes.value).map(normalizeStaffBooking) : []);
    setGarages(gRes.status === "fulfilled" && Array.isArray(gRes.value) ? gRes.value : []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [keyword, statusFilter, garageFilter, fromDate, toDate, tab, pageSize, users]);

  // "Kỳ" = khoảng ngày filter; mặc định tháng này.
  const period = useMemo(() => {
    const today = todayISO();
    if (fromDate || toDate) {
      const f = fromDate || toDate;
      const t = toDate || fromDate;
      return f <= t ? [f, t] : [t, f];
    }
    return [`${today.slice(0, 8)}01`, today];
  }, [fromDate, toDate]);

  // Gộp dữ liệu thật theo từng khách: xe + booking + tổng hợp + lý do cần chú ý.
  const customers = useMemo(() => {
    const vehiclesByUser = new Map();
    vehicles.forEach((v) => {
      const key = String(v.userId);
      if (!vehiclesByUser.has(key)) vehiclesByUser.set(key, []);
      vehiclesByUser.get(key).push(v);
    });
    const bookingsByCustomer = new Map();
    bookings.forEach((b) => {
      if (b.customerId == null) return;
      const key = String(b.customerId);
      if (!bookingsByCustomer.has(key)) bookingsByCustomer.set(key, []);
      bookingsByCustomer.get(key).push(b);
    });

    return users
      .filter((u) => {
        const roles = Array.isArray(u.roles) ? u.roles : u.role ? [u.role] : [];
        return roles.includes("CUSTOMER");
      })
      .map((u) => {
        const myBookings = (bookingsByCustomer.get(String(u.id)) || [])
          .sort((a, b) => (b.bookingDate || "").localeCompare(a.bookingDate || ""));
        const completed = myBookings.filter((b) => b.bookingStatus === "COMPLETED");
        const noShowCount = myBookings.filter((b) => b.bookingStatus === "NO_SHOW").length;
        const failedPayments = myBookings.filter((b) => b.paymentStatus === "FAILED").length;
        const dates = myBookings.map((b) => b.bookingDate).filter(Boolean).sort();
        const firstDate = dates[0] || null;
        const lastDate = dates[dates.length - 1] || null;
        const garageIds = [...new Set(myBookings.map((b) => String(b.garageId)).filter((x) => x !== "null"))];

        const attentionReasons = [];
        if (u.status === "BLOCKED") attentionReasons.push("Tài khoản bị khóa");
        if (noShowCount >= 2) attentionReasons.push(`Nhiều lần no-show (${noShowCount})`);
        if (failedPayments > 0) attentionReasons.push("Có thanh toán thất bại cần đối soát");
        if (!u.phone && !u.email) attentionReasons.push("Thiếu thông tin liên hệ");

        return {
          ...u,
          vehicles: vehiclesByUser.get(String(u.id)) || [],
          bookings: myBookings,
          totals: {
            bookings: myBookings.length,
            spend: completed.reduce((s, b) => s + (b.finalAmount || 0), 0),
            lastDate,
          },
          firstDate,
          garageIds,
          attentionReasons,
        };
      });
  }, [users, vehicles, bookings]);

  const inPeriod = useCallback(
    (date) => date && date >= period[0] && date <= period[1],
    [period],
  );
  const hasBookingInPeriod = useCallback(
    (c) => c.bookings.some((b) => inPeriod(b.bookingDate)),
    [inPeriod],
  );

  // KPI — số thật; loyalty chưa có API admin nên hiển thị "—".
  const kpis = useMemo(() => ({
    total: customers.length,
    newInPeriod: customers.filter((c) => inPeriod(c.firstDate)).length,
    active: customers.filter((c) => c.status === "ACTIVE").length,
    withBooking: customers.filter(hasBookingInPeriod).length,
    loyalty: null,
  }), [customers, inPeriod, hasBookingInPeriod]);

  const KPI_CARDS = [
    { key: "total", label: "Tổng khách hàng", Icon: UsersRound, tone: "text-primary bg-primary-container" },
    { key: "newInPeriod", label: "Khách mới trong kỳ", Icon: UserPlus, tone: "text-accent-cyan bg-accent-cyan/10" },
    { key: "active", label: "Đang hoạt động", Icon: UserCheck, tone: "text-success bg-success-container" },
    { key: "withBooking", label: "Có booking trong kỳ", Icon: CalendarCheck2, tone: "text-accent-violet bg-accent-violet/10" },
    { key: "loyalty", label: "Thành viên loyalty", Icon: Star, tone: "text-gold-ink bg-gold/20", pendingApi: true },
  ];

  const tabMatch = useCallback((c, key) => {
    switch (key) {
      case "ACTIVE": return c.status === "ACTIVE";
      case "INACTIVE": return c.status !== "ACTIVE";
      case "NEW": return inPeriod(c.firstDate);
      case "HAS_BOOKING": return hasBookingInPeriod(c);
      case "ATTENTION": return c.attentionReasons.length > 0;
      default: return true;
    }
  }, [inPeriod, hasBookingInPeriod]);

  const scoped = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return customers.filter((c) => {
      if (statusFilter !== "ALL" && c.status !== statusFilter) return false;
      if (garageFilter !== "all" && !c.garageIds.includes(String(garageFilter))) return false;
      if (kw) {
        const plates = c.vehicles.map((v) => v.licensePlate || "").join(" ");
        const hay = `${c.fullName || ""} ${c.email || ""} ${c.phone || ""} ${c.accountCode || ""} ${plates}`.toLowerCase();
        if (!hay.includes(kw)) return false;
      }
      return true;
    });
  }, [customers, keyword, statusFilter, garageFilter]);

  const tabCounts = useMemo(
    () => Object.fromEntries(TABS.map((t) => [t.key, scoped.filter((c) => tabMatch(c, t.key)).length])),
    [scoped, tabMatch],
  );

  const filtered = useMemo(
    () => scoped
      .filter((c) => tabMatch(c, tab))
      .sort((a, b) => (b.totals.lastDate || "").localeCompare(a.totals.lastDate || "") || b.id - a.id),
    [scoped, tab, tabMatch],
  );
  const paged = useMemo(
    () => filtered.slice((page - 1) * pageSize, page * pageSize),
    [filtered, page, pageSize],
  );

  const hasFilter = keyword.trim() !== "" || statusFilter !== "ALL" || garageFilter !== "all" || fromDate || toDate || tab !== "ALL";
  const clearFilters = () => {
    setKeyword(""); setStatusFilter("ALL"); setGarageFilter("all");
    setFromDate(""); setToDate(""); setTab("ALL");
  };

  // Khóa / mở khóa — API thật PUT /admin/users/{id}/status.
  async function handleToggleLock(customer) {
    const locking = customer.status !== "BLOCKED";
    const ok = await confirmDialog({
      title: locking ? "Khóa tài khoản khách hàng?" : "Mở khóa tài khoản?",
      description: `${friendlyName(customer.fullName, "Khách hàng")} (${customer.email || customer.accountCode}). ${
        locking ? "Khách sẽ không thể đăng nhập và đặt lịch." : "Khách sẽ đăng nhập và đặt lịch bình thường."
      }`,
      confirmLabel: locking ? "Khóa tài khoản" : "Mở khóa",
      destructive: locking,
    });
    if (!ok) return;
    setBusyId(customer.id);
    try {
      await adminApi.updateUserStatus(customer.id, { status: locking ? "BLOCKED" : "ACTIVE" });
      toast.success(locking ? "Đã khóa tài khoản" : "Đã mở khóa tài khoản", {
        description: friendlyName(customer.fullName, "Khách hàng"),
      });
      load();
    } catch (e) {
      toast.error("Thao tác thất bại", { description: e?.message || "Lỗi không xác định" });
    } finally {
      setBusyId(null);
    }
  }

  function openMenu(e, customer) {
    const r = e.currentTarget.getBoundingClientRect();
    setMenu({ customer, x: r.right, y: r.bottom });
  }

  const updatedLabel = lastUpdated
    ? lastUpdated.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    : null;

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Quản trị hệ thống"
        title="Khách hàng"
        description="Quản lý hồ sơ khách hàng, xe, lịch sử sử dụng dịch vụ và loyalty."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={load} disabled={loading}>
              <RefreshCw className={loading ? "animate-spin" : ""} /> Tải lại
            </Button>
            {updatedLabel && (
              <span className="text-xs font-medium text-muted-foreground">Cập nhật lúc {updatedLabel}</span>
            )}
          </div>
        }
      />

      {loading && !users.length ? (
        <CustomersSkeleton />
      ) : error && !users.length ? (
        <div className="rounded-2xl border border-critical/25 bg-critical-container p-8 text-center">
          <AlertTriangle className="mx-auto mb-3 text-critical" size={28} />
          <p className="text-sm font-bold text-critical">{error}</p>
          <Button size="sm" onClick={load} className="mt-4 bg-critical text-white hover:bg-critical/90">Thử lại</Button>
        </div>
      ) : (
        <>
          {/* KPI */}
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
            {KPI_CARDS.map(({ key, label, Icon, tone, pendingApi }) => (
              <article key={key} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
                <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${tone}`}>
                  <Icon size={18} />
                </span>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground">{label}</p>
                  <b className="mt-0.5 block text-xl font-semibold text-foreground">
                    {pendingApi ? "—" : formatNumber(kpis[key])}
                  </b>
                  {pendingApi && <p className="text-xs text-neutral-muted">Chưa có dữ liệu</p>}
                </div>
              </article>
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
                  placeholder="Tìm theo tên, email, SĐT, biển số..."
                  className="w-full bg-transparent text-sm outline-none"
                />
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 rounded-xl border border-input bg-background px-3 text-xs font-bold outline-none focus:border-ring"
                aria-label="Lọc trạng thái"
              >
                <option value="ALL">Tất cả trạng thái</option>
                {Object.entries(USER_STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
              <select
                value={garageFilter}
                onChange={(e) => setGarageFilter(e.target.value)}
                className="h-10 rounded-xl border border-input bg-background px-3 text-xs font-bold outline-none focus:border-ring"
                aria-label="Lọc chi nhánh"
                title="Khách có booking tại chi nhánh"
              >
                <option value="all">Tất cả chi nhánh</option>
                {garages.map((g) => (
                  <option key={g.id ?? g.garageId} value={g.id ?? g.garageId}>
                    {friendlyName(g.name ?? g.garageName, "Chi nhánh chưa cập nhật")}
                  </option>
                ))}
              </select>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="h-10 rounded-xl border border-input px-2.5 text-xs font-bold text-muted-foreground outline-none"
                  aria-label="Từ ngày"
                />
                <span className="text-xs text-neutral-muted">→</span>
                <input
                  type="date"
                  value={toDate}
                  min={fromDate || undefined}
                  onChange={(e) => setToDate(e.target.value)}
                  className="h-10 rounded-xl border border-input px-2.5 text-xs font-bold text-muted-foreground outline-none"
                  aria-label="Đến ngày"
                />
              </div>
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

          {/* Bảng khách hàng */}
          <section className="rounded-2xl border border-border bg-card">
            <div className="flex flex-wrap items-center justify-between gap-3 p-5 pb-3">
              <div>
                <h2 className="text-lg font-bold text-foreground">Danh sách khách hàng</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Hiển thị {paged.length} / {filtered.length} khách hàng
                </p>
              </div>
              {/* BE chưa có API export — nút disabled, không tạo file giả */}
              <Button variant="outline" size="sm" disabled title="Tính năng đang được hoàn thiện">
                <Download /> Xuất dữ liệu
              </Button>
            </div>

            {filtered.length === 0 ? (
              <div className="px-6 py-14 text-center">
                <UsersRound size={40} className="mx-auto text-border" />
                <p className="mt-3 text-sm font-semibold text-foreground">Không có khách hàng phù hợp.</p>
                <p className="mt-1 text-xs text-muted-foreground">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.</p>
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
                        <th className="py-3 pr-3 font-semibold">Khách hàng</th>
                        <th className="py-3 pr-3 font-semibold">Liên hệ</th>
                        <th className="py-3 pr-3 font-semibold">Xe</th>
                        <th className="py-3 pr-3 font-semibold">Lịch sử</th>
                        <th className="py-3 pr-3 font-semibold">Loyalty</th>
                        <th className="py-3 pr-3 font-semibold">Trạng thái</th>
                        <th className="py-3 text-right font-semibold">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface">
                      {paged.map((c) => (
                        <tr key={c.id} className="align-middle hover:bg-surface">
                          <td className="min-w-[190px] py-3 pr-3">
                            <button
                              type="button"
                              onClick={() => setDetailTarget(c)}
                              className="flex items-center gap-2.5 text-left"
                            >
                              {c.avatarUrl ? (
                                <img src={c.avatarUrl} alt="" className="h-9 w-9 shrink-0 rounded-full object-cover" />
                              ) : (
                                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent-cyan text-sm font-bold text-white">
                                  {(c.fullName || "K").charAt(0).toUpperCase()}
                                </span>
                              )}
                              <span className="min-w-0">
                                <b className="block truncate text-sm text-foreground hover:text-primary">
                                  {friendlyName(c.fullName, "Khách hàng chưa cập nhật")}
                                </b>
                                <span className="block text-neutral-muted">{c.accountCode || `#${c.id}`}</span>
                              </span>
                            </button>
                          </td>
                          <td className="py-3 pr-3">
                            <p className="font-semibold text-ink-soft">{friendlyName(c.phone, "SĐT chưa cập nhật")}</p>
                            <p className="mt-0.5 max-w-[180px] truncate text-muted-foreground">
                              {friendlyName(c.email, "Email chưa cập nhật")}
                            </p>
                          </td>
                          <td className="py-3 pr-3">
                            {c.vehicles.length === 0 ? (
                              <span className="text-neutral-muted">Xe chưa cập nhật</span>
                            ) : (
                              <>
                                <b className="text-foreground">{c.vehicles[0].licensePlate}</b>
                                {c.vehicles.length > 1 && (
                                  <span className="ml-1.5 rounded-full bg-muted px-1.5 py-0.5 font-bold text-muted-foreground">
                                    +{c.vehicles.length - 1} xe
                                  </span>
                                )}
                              </>
                            )}
                          </td>
                          <td className="py-3 pr-3">
                            {c.totals.bookings === 0 ? (
                              <span className="text-neutral-muted">Chưa có booking</span>
                            ) : (
                              <>
                                <b className="text-foreground">{formatNumber(c.totals.bookings)} lượt</b>
                                {c.totals.lastDate && (
                                  <p className="mt-0.5 text-muted-foreground">Gần nhất: {formatDate(c.totals.lastDate)}</p>
                                )}
                              </>
                            )}
                          </td>
                          {/* BE chưa có API loyalty theo khách cho admin */}
                          <td className="py-3 pr-3 text-neutral-muted">Chưa có loyalty</td>
                          <td className="py-3 pr-3">
                            <span className="flex flex-wrap gap-1">
                              <span className={`rounded-full px-2.5 py-0.5 font-bold ${STATUS_TONES[c.status] || "bg-muted text-muted-foreground"}`}>
                                {USER_STATUS_LABELS[c.status] || c.status || "—"}
                              </span>
                              {c.attentionReasons.length > 0 && (
                                <span
                                  className="rounded-full bg-warning-container px-2.5 py-0.5 font-bold text-warning"
                                  title={c.attentionReasons.join(" · ")}
                                >
                                  Cần chú ý
                                </span>
                              )}
                            </span>
                          </td>
                          <td className="py-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button size="sm" variant="outline" onClick={() => setDetailTarget(c)}>
                                Chi tiết
                              </Button>
                              <button
                                type="button"
                                aria-label="Thao tác khác"
                                onClick={(e) => openMenu(e, c)}
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
                  Chi tiết khách hàng mở trong ngăn trượt để xem xe, lịch sử booking và loyalty.
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
            className="fixed z-50 w-52 rounded-xl border border-border bg-popover p-1 shadow-floating"
            style={{ top: menu.y + 4, left: Math.max(8, menu.x - 208) }}
          >
            {[
              ["Xem chi tiết", () => setDetailTarget(menu.customer)],
              ["Xem lịch sử booking", () => setDetailTarget(menu.customer)],
              ["Xem danh sách xe", () => setDetailTarget(menu.customer)],
              ["Xem loyalty", () => setDetailTarget(menu.customer)],
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
              disabled={busyId === menu.customer.id}
              onClick={() => { const c = menu.customer; setMenu(null); handleToggleLock(c); }}
              className={cn(
                "block w-full rounded-lg px-3 py-2 text-left text-xs font-bold hover:bg-surface",
                menu.customer.status === "BLOCKED" ? "text-success" : "text-critical",
              )}
            >
              {menu.customer.status === "BLOCKED" ? "Mở khóa tài khoản" : "Khóa tài khoản"}
            </button>
          </div>
        </>
      )}

      <AdminCustomerDrawer
        customer={detailTarget}
        open={Boolean(detailTarget)}
        onOpenChange={(open) => { if (!open) setDetailTarget(null); }}
      />
    </PageContainer>
  );
}
