import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2, MapPin, Phone, Clock3, Wrench, Users, CalendarDays, CircleDollarSign,
  Search, RefreshCcw, Plus, AlertTriangle, MoreHorizontal, CheckCircle2, PauseCircle,
} from "lucide-react";
import PageContainer from "@/components/shared/PageContainer";
import PageHeader from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import { confirmDialog } from "@/components/shared/ConfirmDialog";
import { garageApi } from "../../api/garageApi";
import { adminApi } from "../../api/adminApi";
import { servicePackageApi } from "../../api/servicePackageApi";
import { normalizeBookingList, normalizeStaffBooking } from "../../lib/staff-booking-data";
import { todayISO, formatDate, formatMoneyShort, formatMoneyCompact, formatNumber, friendlyName } from "../../lib/format";
import { cn } from "@/lib/utils";
import { GarageFormModal } from "../../components/admin/garages/GarageFormModal";
import { AdminGarageDrawer, GARAGE_STATUS_META } from "../../components/admin/garages/AdminGarageDrawer";

const TABS = [
  { key: "ALL", label: "Tất cả" },
  { key: "ACTIVE", label: "Đang hoạt động" },
  { key: "INACTIVE", label: "Tạm ngừng" },
  { key: "NEEDS_UPDATE", label: "Cần cập nhật" },
  { key: "ATTENTION", label: "Cần chú ý" },
];

const SORT_OPTIONS = [
  ["updated", "Mới cập nhật"],
  ["revenue", "Doanh thu cao nhất"],
  ["bookings", "Nhiều lịch nhất"],
  ["name", "Tên A-Z"],
];

function toISO(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function GaragesSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
        {Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
      </div>
      <Skeleton className="h-20 rounded-2xl" />
      <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-64 rounded-2xl" />)}
      </div>
    </div>
  );
}

/**
 * Trang Cơ sở / Chi nhánh (Admin) — toàn bộ dữ liệu thật:
 *   chi nhánh: GET /v1/garages (+ CRUD thật POST/PUT/DELETE /v1/garages)
 *   dịch vụ: GET /v1/services/garage/{id} · nhân viên: GET /admin/users (garageIds)
 *   hiệu suất kỳ: tổng hợp từ GET /bookings (kỳ = tháng hiện tại, trọn tháng)
 * TODO(BE): chưa có field phân biệt garage seed/test — FE hiển thị đúng dữ liệu
 * thật, chỉ lọc bản ghi DELETED; chưa có field email/khu vực/giờ mở cửa/slot.
 */
export default function AdminGaragePage() {
  const navigate = useNavigate();
  const [garages, setGarages] = useState([]);
  const [servicesByGarage, setServicesByGarage] = useState(new Map());
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortKey, setSortKey] = useState("updated");
  const [tab, setTab] = useState("ALL");

  const [formTarget, setFormTarget] = useState(null); // { garage | null }
  const [detailTarget, setDetailTarget] = useState(null);
  const [menu, setMenu] = useState(null); // { branch, x, y }
  const [busyId, setBusyId] = useState(null);

  // Kỳ báo cáo = trọn tháng hiện tại.
  const { start, end } = useMemo(() => {
    const today = todayISO();
    const d = new Date(`${today}T00:00:00`);
    return {
      start: `${today.slice(0, 8)}01`,
      end: toISO(new Date(d.getFullYear(), d.getMonth() + 1, 0)),
    };
  }, []);
  const periodLabel = `${formatDate(start)} – ${formatDate(end)}`;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const [gRes, bRes, uRes] = await Promise.allSettled([
      garageApi.getAll(),
      adminApi.getBookings({ size: 1000 }),
      adminApi.getAllUsers({ size: 1000 }),
    ]);
    if (gRes.status === "rejected") {
      setError(gRes.reason?.message || "Không thể tải danh sách chi nhánh. Vui lòng thử lại.");
      setGarages([]);
      setLoading(false);
      return;
    }
    // Bỏ bản ghi đã xóa mềm (DELETED) khỏi danh sách quản lý
    const garageList = (Array.isArray(gRes.value) ? gRes.value : []).filter((g) => g.status !== "DELETED");
    setGarages(garageList);
    setBookings(bRes.status === "fulfilled" ? normalizeBookingList(bRes.value).map(normalizeStaffBooking) : []);
    const userPage = uRes.status === "fulfilled" ? uRes.value : null;
    setUsers(Array.isArray(userPage?.content) ? userPage.content : Array.isArray(userPage) ? userPage : []);

    // Dịch vụ của từng chi nhánh — endpoint thật theo garage, tải song song
    const svcResults = await Promise.allSettled(
      garageList.map((g) => servicePackageApi.getAll(g.id ?? g.garageId)),
    );
    const svcMap = new Map();
    svcResults.forEach((r, i) => {
      const gid = String(garageList[i].id ?? garageList[i].garageId);
      const list = r.status === "fulfilled" && Array.isArray(r.value) ? r.value : [];
      svcMap.set(gid, list.map((s) => ({
        id: s.servicePackageId ?? s.id,
        name: s.name,
        price: Number(s.price || 0),
        status: s.status,
      })));
    });
    setServicesByGarage(svcMap);
    setLastUpdated(new Date());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // ===== Gộp dữ liệu thật theo từng chi nhánh =====
  const branches = useMemo(() => {
    const bookingsByGarage = new Map();
    bookings.forEach((b) => {
      if (b.garageId == null || !b.bookingDate) return;
      if (b.bookingDate < start || b.bookingDate > end) return;
      const key = String(b.garageId);
      if (!bookingsByGarage.has(key)) bookingsByGarage.set(key, []);
      bookingsByGarage.get(key).push(b);
    });

    return garages.map((g) => {
      const gid = String(g.id ?? g.garageId);
      const myBookings = (bookingsByGarage.get(gid) || [])
        .sort((a, b) => (b.bookingDate || "").localeCompare(a.bookingDate || ""));
      const completedList = myBookings.filter((b) => b.bookingStatus === "COMPLETED");
      const stats = {
        total: myBookings.length,
        completed: completedList.length,
        cancelledNoShow: myBookings.filter((b) => ["CANCELLED", "NO_SHOW"].includes(b.bookingStatus)).length,
        revenue: completedList.reduce((s, b) => s + (b.finalAmount || 0), 0),
        payments: {
          paid: myBookings.filter((b) => b.paymentStatus === "PAID").length,
          pending: myBookings.filter((b) => b.paymentStatus === "PENDING").length,
        },
      };
      const services = servicesByGarage.get(gid) || [];
      const staff = users.filter((u) => {
        const roles = Array.isArray(u.roles) ? u.roles : u.role ? [u.role] : [];
        return (roles.includes("STAFF") || roles.includes("MANAGER")) &&
          (u.garageIds || []).some((id) => String(id) === gid);
      });

      // "Cần cập nhật" — thiếu thông tin/cấu hình (logic thật từ dữ liệu)
      const needsUpdate = [];
      if (!g.address) needsUpdate.push("Thiếu địa chỉ");
      if (!g.phone) needsUpdate.push("Thiếu số điện thoại");
      if (services.length === 0) needsUpdate.push("Chưa có dịch vụ");
      if (staff.length === 0) needsUpdate.push("Chưa có nhân viên");

      // "Cần chú ý" — vận hành bất thường trong kỳ (logic thật)
      const attention = [];
      if (g.status === "INACTIVE") attention.push("Đang tạm ngừng");
      if (g.status === "ACTIVE" && stats.total === 0) attention.push("Không có lịch mới trong kỳ");
      else if (g.status === "ACTIVE" && stats.revenue === 0) attention.push("Doanh thu 0 đ trong kỳ");

      return {
        ...g,
        id: g.id ?? g.garageId,
        services,
        staff,
        stats,
        recentBookings: myBookings.slice(0, 5),
        needsUpdate,
        attention,
      };
    });
  }, [garages, bookings, users, servicesByGarage, start, end]);

  const tabMatch = (b, key) => {
    switch (key) {
      case "ACTIVE": return b.status === "ACTIVE";
      case "INACTIVE": return b.status === "INACTIVE";
      case "NEEDS_UPDATE": return b.needsUpdate.length > 0;
      case "ATTENTION": return b.attention.length > 0;
      default: return true;
    }
  };

  const scoped = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    let list = branches.filter((b) => {
      if (statusFilter !== "ALL" && !tabMatch(b, statusFilter)) return false;
      if (kw && !`${b.name || ""} ${b.address || ""} ${b.phone || ""}`.toLowerCase().includes(kw)) return false;
      return true;
    });
    const sorters = {
      updated: (a, b) => String(b.updatedAt || b.createdAt || "").localeCompare(String(a.updatedAt || a.createdAt || "")),
      revenue: (a, b) => b.stats.revenue - a.stats.revenue,
      bookings: (a, b) => b.stats.total - a.stats.total,
      name: (a, b) => String(a.name || "").localeCompare(String(b.name || ""), "vi"),
    };
    return [...list].sort(sorters[sortKey] || sorters.updated);
  }, [branches, keyword, statusFilter, sortKey]);

  const tabCounts = useMemo(
    () => Object.fromEntries(TABS.map((t) => [t.key, scoped.filter((b) => tabMatch(b, t.key)).length])),
    [scoped],
  );
  const filtered = useMemo(() => scoped.filter((b) => tabMatch(b, tab)), [scoped, tab]);

  // KPI — toàn bộ chi nhánh (không theo tab/search)
  const kpis = useMemo(() => ({
    total: branches.length,
    active: branches.filter((b) => b.status === "ACTIVE").length,
    inactive: branches.filter((b) => b.status === "INACTIVE").length,
    bookings: branches.reduce((s, b) => s + b.stats.total, 0),
    revenue: branches.reduce((s, b) => s + b.stats.revenue, 0),
    attention: branches.filter((b) => b.attention.length > 0).length,
  }), [branches]);

  const KPI_CARDS = [
    { key: "total", label: "Tổng chi nhánh", Icon: Building2, tone: "text-primary bg-primary-container", fmt: formatNumber },
    { key: "active", label: "Đang hoạt động", Icon: CheckCircle2, tone: "text-success bg-success-container", fmt: formatNumber },
    { key: "inactive", label: "Tạm ngừng", Icon: PauseCircle, tone: "text-warning bg-warning-container", fmt: formatNumber },
    { key: "bookings", label: "Tổng lịch trong kỳ", Icon: CalendarDays, tone: "text-accent-indigo bg-accent-indigo/10", fmt: formatNumber },
    { key: "revenue", label: "Doanh thu trong kỳ", Icon: CircleDollarSign, tone: "text-accent-violet bg-accent-violet/10", fmt: formatMoneyShort },
    { key: "attention", label: "Cần chú ý", Icon: AlertTriangle, tone: "text-no-show bg-no-show-container", fmt: formatNumber },
  ];

  const attentionItems = useMemo(
    () => branches.filter((b) => b.attention.length > 0 || b.needsUpdate.length > 0).slice(0, 6),
    [branches],
  );

  // Tạm ngừng / kích hoạt — PUT /v1/garages/{id} (payload đầy đủ theo BE).
  async function handleToggleStatus(branch) {
    const pausing = branch.status === "ACTIVE";
    const ok = await confirmDialog({
      title: pausing ? "Tạm ngừng chi nhánh này?" : "Kích hoạt lại chi nhánh này?",
      description: pausing
        ? `${friendlyName(branch.name, "Chi nhánh")} sẽ không nhận lịch hẹn mới cho đến khi được kích hoạt lại.`
        : `${friendlyName(branch.name, "Chi nhánh")} sẽ nhận lịch hẹn trở lại.`,
      confirmLabel: pausing ? "Tạm ngừng" : "Kích hoạt",
      destructive: pausing,
    });
    if (!ok) return;
    setBusyId(branch.id);
    try {
      await garageApi.update(branch.id, {
        name: branch.name,
        address: branch.address,
        phone: branch.phone,
        status: pausing ? "INACTIVE" : "ACTIVE",
      });
      toast.success(pausing ? "Đã tạm ngừng chi nhánh" : "Đã kích hoạt chi nhánh", {
        description: friendlyName(branch.name, "Chi nhánh"),
      });
      load();
    } catch (e) {
      toast.error("Thao tác thất bại", { description: e?.message || "Lỗi không xác định" });
    } finally {
      setBusyId(null);
    }
  }

  // Xóa chi nhánh — DELETE /v1/garages/{id} (xóa mềm phía BE).
  async function handleDelete(branch) {
    const ok = await confirmDialog({
      title: "Xóa chi nhánh này?",
      description: `${friendlyName(branch.name, "Chi nhánh")} — hành động này có thể ảnh hưởng đến dữ liệu vận hành.`,
      confirmLabel: "Xóa chi nhánh",
      destructive: true,
    });
    if (!ok) return;
    setBusyId(branch.id);
    try {
      await garageApi.remove(branch.id);
      toast.success("Đã xóa chi nhánh", { description: friendlyName(branch.name, "Chi nhánh") });
      load();
    } catch (e) {
      toast.error("Không thể xóa chi nhánh", { description: e?.message || "Lỗi không xác định" });
    } finally {
      setBusyId(null);
    }
  }

  function openMenu(e, branch) {
    const r = e.currentTarget.getBoundingClientRect();
    setMenu({ branch, x: r.right, y: r.bottom });
  }

  const hasFilter = keyword.trim() !== "" || statusFilter !== "ALL" || tab !== "ALL";
  const clearFilters = () => { setKeyword(""); setStatusFilter("ALL"); setTab("ALL"); };

  const updatedLabel = lastUpdated
    ? lastUpdated.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    : null;

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Quản trị hệ thống"
        title="Cơ sở / Chi nhánh"
        description="Quản lý danh sách cơ sở rửa xe, trạng thái vận hành và hiệu suất theo chi nhánh."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={load} disabled={loading}>
              <RefreshCcw className={loading ? "animate-spin" : ""} /> Tải lại
            </Button>
            <Button size="sm" onClick={() => setFormTarget({ garage: null })}>
              <Plus /> Thêm chi nhánh
            </Button>
            {updatedLabel && (
              <span className="text-xs font-medium text-muted-foreground">Cập nhật lúc {updatedLabel}</span>
            )}
          </div>
        }
      />

      {loading && !garages.length ? (
        <GaragesSkeleton />
      ) : error && !garages.length ? (
        <div className="rounded-2xl border border-critical/25 bg-critical-container p-8 text-center">
          <AlertTriangle className="mx-auto mb-3 text-critical" size={28} />
          <p className="text-sm font-bold text-critical">{error}</p>
          <Button size="sm" onClick={load} className="mt-4 bg-critical text-white hover:bg-critical/90">Thử lại</Button>
        </div>
      ) : (
        <>
          {/* Kỳ báo cáo */}
          <div>
            <span className="rounded-full bg-primary-container px-3 py-1.5 text-xs font-bold text-primary-strong">
              Kỳ báo cáo: {periodLabel}
            </span>
          </div>

          {/* KPI */}
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
            {KPI_CARDS.map(({ key, label, Icon, tone, fmt }) => (
              <article key={key} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
                <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${tone}`}>
                  <Icon size={16} />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-muted-foreground">{label}</p>
                  <b className="mt-0.5 block truncate text-xl font-semibold text-foreground">{fmt(kpis[key])}</b>
                </div>
              </article>
            ))}
          </section>

          {/* Filter + tabs */}
          <section className="rounded-2xl border border-border bg-card p-4">
            <div className="flex flex-wrap items-center gap-3">
              <label className="flex h-10 min-w-[220px] flex-1 items-center gap-2 rounded-xl border border-border px-3 lg:max-w-sm">
                <Search size={16} className="text-neutral-muted" />
                <input
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Tìm theo tên chi nhánh, địa chỉ, số điện thoại..."
                  className="w-full bg-transparent text-sm outline-none"
                />
              </label>
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setTab("ALL"); }}
                className="h-10 rounded-xl border border-input bg-background px-3 text-xs font-bold outline-none focus:border-ring"
                aria-label="Lọc trạng thái"
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="ACTIVE">Đang hoạt động</option>
                <option value="INACTIVE">Tạm ngừng</option>
                <option value="NEEDS_UPDATE">Cần cập nhật</option>
              </select>
              <select
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value)}
                className="h-10 rounded-xl border border-input bg-background px-3 text-xs font-bold outline-none focus:border-ring"
                aria-label="Sắp xếp"
              >
                {SORT_OPTIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
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

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
            {/* Danh sách chi nhánh */}
            <div className="min-w-0">
              {filtered.length === 0 ? (
                <div className="rounded-2xl border border-border bg-card px-6 py-12 text-center">
                  <Building2 size={40} className="mx-auto text-border" />
                  <p className="mt-3 text-sm font-semibold text-foreground">
                    {hasFilter ? "Không có chi nhánh phù hợp bộ lọc." : "Chưa có chi nhánh nào."}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {hasFilter
                      ? "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm."
                      : "Thêm chi nhánh đầu tiên để bắt đầu quản lý vận hành."}
                  </p>
                  {hasFilter ? (
                    <Button size="sm" variant="outline" className="mt-4" onClick={clearFilters}>Xóa bộ lọc</Button>
                  ) : (
                    <Button size="sm" className="mt-4" onClick={() => setFormTarget({ garage: null })}>
                      <Plus /> Thêm chi nhánh
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
                  {filtered.map((b) => {
                    const st = GARAGE_STATUS_META[b.status] || { label: b.status || "—", tone: "bg-muted text-muted-foreground" };
                    const busy = busyId === b.id;
                    return (
                      <article key={b.id} className="flex flex-col rounded-2xl border border-border bg-card p-5">
                        {/* Hàng 1: icon + badge trạng thái; tên chiếm trọn bề ngang ở hàng 2
                            — mọi khu có chiều cao cố định để các card đều và thẳng hàng nhau */}
                        {/* Icon + badge nằm gọn cùng hàng, sát bên trái */}
                        <div className="flex items-center gap-2">
                          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-container text-primary">
                            <Building2 size={18} />
                          </span>
                          <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${st.tone}`}>
                            {st.label}
                          </span>
                          {b.needsUpdate.length > 0 && (
                            <span
                              className="rounded-full bg-warning-container px-2 py-0.5 text-xs font-bold text-warning"
                              title={b.needsUpdate.join(" · ")}
                            >
                              Cần cập nhật
                            </span>
                          )}
                        </div>
                        <h3 className="mt-2.5 min-h-10 break-words text-sm font-bold leading-5 text-foreground">
                          {friendlyName(b.name, "Chi nhánh chưa cập nhật")}
                        </h3>

                        <div className="mt-2 space-y-1.5 text-xs text-muted-foreground">
                          <p className="flex items-start gap-1.5">
                            <MapPin size={14} className="mt-0.5 shrink-0" />
                            <span className="line-clamp-2 min-h-8">{b.address || "Chưa cập nhật địa chỉ"}</span>
                          </p>
                          <p className="flex items-center gap-1.5">
                            <Phone size={14} className="shrink-0" />
                            {b.phone || "Chưa cập nhật số điện thoại"}
                          </p>
                          <p className="flex items-center gap-1.5">
                            <Clock3 size={14} className="shrink-0" />
                            Chưa cập nhật giờ mở cửa
                          </p>
                        </div>

                        <div className="mt-3 grid grid-cols-4 gap-2 rounded-xl bg-surface p-3 text-center">
                          {[
                            [Wrench, formatNumber(b.services.length), "Dịch vụ"],
                            [Users, formatNumber(b.staff.length), "Nhân viên"],
                            [CalendarDays, formatNumber(b.stats.total), "Lịch hẹn"],
                            [CircleDollarSign, b.stats.revenue > 0 ? `${formatMoneyCompact(b.stats.revenue)} đ` : "0 đ", "Doanh thu"],
                          ].map(([Icon, value, label]) => (
                            <div key={label} className="min-w-0">
                              <Icon size={14} className="mx-auto text-neutral-muted" />
                              <b className="mt-0.5 block break-words text-xs font-semibold leading-4 text-foreground">{value}</b>
                              <span className="block text-xs leading-4 text-neutral-muted">{label}</span>
                            </div>
                          ))}
                        </div>

                        {/* Dòng cảnh báo luôn giữ chỗ để hàng nút các card thẳng nhau */}
                        <p className="mt-2 min-h-5 text-xs font-bold leading-5 text-warning">
                          {b.attention[0] || ""}
                        </p>

                        <div className="flex-1 pt-3" aria-hidden="true" />
                        <div className="flex flex-wrap items-center gap-1.5 border-t border-border pt-3">
                          <Button size="sm" variant="outline" onClick={() => setDetailTarget(b)}>Chi tiết</Button>
                          <Button size="sm" variant="outline" onClick={() => setFormTarget({ garage: b })}>Chỉnh sửa</Button>
                          {b.status === "INACTIVE" && (
                            <Button size="sm" disabled={busy} onClick={() => handleToggleStatus(b)}>
                              {busy ? "..." : "Kích hoạt"}
                            </Button>
                          )}
                          <button
                            type="button"
                            aria-label="Thao tác khác"
                            onClick={(e) => openMenu(e, b)}
                            className="ml-auto grid h-8 w-8 place-items-center rounded-lg border border-border text-muted-foreground hover:bg-surface"
                          >
                            <MoreHorizontal size={16} />
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Panel cần chú ý */}
            <section className="h-fit rounded-2xl border border-border bg-card p-5">
              <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
                <AlertTriangle size={18} className="text-warning" /> Cần chú ý
              </h2>
              {attentionItems.length === 0 ? (
                <p className="py-6 text-center text-xs text-neutral-muted">Không có chi nhánh cần chú ý.</p>
              ) : (
                <div className="mt-3 space-y-2">
                  {attentionItems.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setDetailTarget(b)}
                      className="block w-full rounded-xl border border-border bg-surface p-3 text-left transition hover:border-warning/40"
                    >
                      <p className="truncate text-xs font-bold text-foreground">
                        {friendlyName(b.name, "Chi nhánh chưa cập nhật")}
                      </p>
                      <p className="mt-0.5 text-xs text-warning">
                        {[...b.attention, ...b.needsUpdate].join(" · ")}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </section>
          </div>
        </>
      )}

      {/* Menu ba chấm — định vị fixed để không bị card cắt */}
      {menu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setMenu(null)} aria-hidden="true" />
          <div
            className="fixed z-50 w-56 rounded-xl border border-border bg-popover p-1 shadow-floating"
            style={{ top: menu.y + 4, left: Math.max(8, menu.x - 224) }}
          >
            {[
              ["Xem lịch hẹn", () => navigate("/quan-tri/bookings")],
              ["Quản lý dịch vụ", () => navigate("/quan-tri/services")],
              ["Quản lý nhân viên", () => navigate("/quan-tri/staff")],
              ["Xem doanh thu", () => navigate("/quan-tri/invoices")],
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
              onClick={() => { const b = menu.branch; setMenu(null); handleToggleStatus(b); }}
              className="block w-full rounded-lg px-3 py-2 text-left text-xs font-bold text-warning hover:bg-surface"
            >
              {menu.branch.status === "ACTIVE" ? "Tạm ngừng chi nhánh" : "Kích hoạt lại"}
            </button>
            <button
              type="button"
              onClick={() => { const b = menu.branch; setMenu(null); handleDelete(b); }}
              className="block w-full rounded-lg px-3 py-2 text-left text-xs font-bold text-critical hover:bg-critical-container"
            >
              Xóa chi nhánh
            </button>
          </div>
        </>
      )}

      <GarageFormModal
        garage={formTarget?.garage || null}
        open={Boolean(formTarget)}
        onOpenChange={(open) => { if (!open) setFormTarget(null); }}
        onDone={load}
      />
      <AdminGarageDrawer
        branch={detailTarget}
        open={Boolean(detailTarget)}
        onOpenChange={(open) => { if (!open) setDetailTarget(null); }}
        periodLabel={periodLabel}
      />
    </PageContainer>
  );
}
