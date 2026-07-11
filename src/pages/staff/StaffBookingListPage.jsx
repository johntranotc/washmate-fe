import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, AlertTriangle } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import StatusBadge from "@/components/shared/StatusBadge";
import Pagination from "@/components/common/Pagination";
import { staffApi } from "@/api/staffApi";
import {
  normalizeBookingList,
  normalizeStaffBooking,
  isUrgent,
  displayBookingStatus,
  actionConditionOf,
  urgentShortLabels,
} from "@/lib/staff-booking-data";
import { useStaffBookingActions } from "@/lib/use-staff-booking-actions";
import { bookingStatusLabels } from "@/lib/status-tones";
import { todayISO, formatDate, formatTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { STAFF_ASSETS } from "@/lib/staff-assets";
import { StaffBookingActions } from "@/components/staff/StaffBookingActions";
import { StaffCheckInModal } from "@/components/staff/StaffCheckInModal";
import { StaffRejectModal } from "@/components/staff/StaffRejectModal";
import { StaffBookingDetailModal } from "@/components/staff/StaffBookingDetailModal";

const STATUS_TABS = [
  "ALL",
  "PENDING",
  "CONFIRMED",
  "CHECKED_IN",
  "WASHING",
  "COMPLETED",
  "REJECTED",
  "NO_SHOW",
  "CANCELLED",
];

const tabLabels = { ALL: "Tất cả", ...bookingStatusLabels };

const DATE_RANGES = [
  { key: "TODAY", label: "Hôm nay" },
  { key: "TOMORROW", label: "Ngày mai" },
  { key: "WEEK", label: "Tuần này" },
];

function isoOf(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

// Khoảng ngày thật cho từng lựa chọn; CUSTOM dùng ngày người dùng chọn.
function dateRangeOf(key, customDate) {
  const today = new Date();
  if (key === "TOMORROW") {
    const t = new Date(today);
    t.setDate(t.getDate() + 1);
    const iso = isoOf(t);
    return [iso, iso];
  }
  if (key === "WEEK") {
    const day = today.getDay(); // 0 = CN
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((day + 6) % 7));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return [isoOf(monday), isoOf(sunday)];
  }
  if (key === "CUSTOM" && customDate) return [customDate, customDate];
  const iso = todayISO();
  return [iso, iso];
}

const KPI_CARDS = [
  { key: "total", label: "Tổng lịch hôm nay", icon: STAFF_ASSETS.kpi.calendar },
  { key: "pending", label: "Chờ xác nhận", icon: STAFF_ASSETS.kpi.hourglass },
  { key: "waitingCheckIn", label: "Chờ check-in", icon: STAFF_ASSETS.kpi.userCheck },
  { key: "washing", label: "Đang rửa", icon: STAFF_ASSETS.kpi.droplet },
  { key: "completed", label: "Hoàn tất", icon: STAFF_ASSETS.kpi.complete },
  { key: "needAction", label: "Cần xử lý", icon: STAFF_ASSETS.kpi.warning },
];

function ListSkeleton() {
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
      </div>
      <Skeleton className="h-28 rounded-2xl" />
      <Skeleton className="h-96 rounded-2xl" />
    </div>
  );
}

export default function StaffBookingListPage() {
  const [searchParams] = useSearchParams();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const [keyword, setKeyword] = useState("");
  const [tab, setTab] = useState(
    STATUS_TABS.includes(searchParams.get("status")) ? searchParams.get("status") : "ALL",
  );
  const [dateKey, setDateKey] = useState("TODAY");
  const [customDate, setCustomDate] = useState("");
  const [urgentOnly, setUrgentOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [checkInTarget, setCheckInTarget] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [detailTarget, setDetailTarget] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    staffApi
      .getAllBookings()
      .then((response) => {
        setBookings(normalizeBookingList(response).map(normalizeStaffBooking));
        setLastUpdated(new Date());
      })
      .catch((e) => {
        console.error("[StaffBookingList] load failed:", e);
        setError(e?.message || "Không thể tải danh sách lịch đặt.");
        setBookings([]);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const refreshOnFocus = () => { if (document.visibilityState === "visible") load(); };
    window.addEventListener("focus", load);
    document.addEventListener("visibilitychange", refreshOnFocus);
    return () => {
      window.removeEventListener("focus", load);
      document.removeEventListener("visibilitychange", refreshOnFocus);
    };
  }, [load]);

  const { busyId, handleNextAction, handleConfirmPayment, handleNoShow } = useStaffBookingActions(load);

  const [fromDate, toDate] = dateRangeOf(dateKey, customDate);

  // Scope theo khoảng ngày — KPI/tab count/bảng đều tính trên tập này.
  const scoped = useMemo(
    () => bookings
      .filter((b) => b.bookingDate >= fromDate && b.bookingDate <= toDate)
      // Lịch mới tạo lên đầu (id lớn hơn = tạo sau; BE không trả createdAt).
      .sort((a, b) => (Number(b.id) || 0) - (Number(a.id) || 0)),
    [bookings, fromDate, toDate],
  );

  const kpis = useMemo(() => {
    const by = (s) => scoped.filter((b) => b.bookingStatus === s).length;
    return {
      total: scoped.length,
      pending: by("PENDING"),
      waitingCheckIn: scoped.filter((b) => b.bookingStatus === "CONFIRMED" && b.paymentStatus === "PAID").length,
      washing: by("WASHING"),
      completed: by("COMPLETED"),
      needAction: scoped.filter((b) => isUrgent(b)).length,
    };
  }, [scoped]);

  const tabCounts = useMemo(
    () => Object.fromEntries(
      STATUS_TABS.map((key) => [
        key,
        key === "ALL" ? scoped.length : scoped.filter((b) => b.bookingStatus === key).length,
      ]),
    ),
    [scoped],
  );

  const visible = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return scoped.filter((b) => {
      if (tab !== "ALL" && b.bookingStatus !== tab) return false;
      if (urgentOnly && !isUrgent(b)) return false;
      if (kw && !`${b.code} ${b.customerName} ${b.phone} ${b.plate}`.toLowerCase().includes(kw)) return false;
      return true;
    });
  }, [scoped, tab, urgentOnly, keyword]);

  useEffect(() => { setPage(1); }, [tab, keyword, dateKey, customDate, urgentOnly, pageSize, bookings]);

  const paged = useMemo(() => {
    const start = (page - 1) * pageSize;
    return visible.slice(start, start + pageSize);
  }, [visible, page, pageSize]);

  const hasFilter = tab !== "ALL" || urgentOnly || keyword.trim() !== "";
  const clearFilters = () => { setTab("ALL"); setUrgentOnly(false); setKeyword(""); };

  const viewingLabel = fromDate === toDate
    ? `Đang xem: ${formatDate(fromDate)}`
    : `Đang xem: ${formatDate(fromDate)} – ${formatDate(toDate)}`;

  const updatedLabel = lastUpdated
    ? lastUpdated.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    : null;

  const actions = {
    onCheckIn: setCheckInTarget,
    onNextAction: handleNextAction,
    onConfirmPayment: handleConfirmPayment,
    onNoShow: handleNoShow,
    onReject: setRejectTarget,
    onDetail: setDetailTarget,
  };

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Vận hành hôm nay"
        title="Lịch hôm nay"
        description="Tra cứu và xử lý booking theo đúng vòng đời dịch vụ trong ngày."
        actions={
          <>
            {updatedLabel && (
              <span className="text-xs font-medium text-muted-foreground">Cập nhật lúc {updatedLabel}</span>
            )}
            <Button variant="outline" size="sm" onClick={load} disabled={loading}>
              <img
                src={STAFF_ASSETS.action.refresh}
                alt=""
                width={16}
                height={16}
                className={`rounded ${loading ? "animate-spin" : ""}`}
              />
              Tải lại
            </Button>
          </>
        }
      />

      {loading && !bookings.length ? (
        <ListSkeleton />
      ) : error && !bookings.length ? (
        <div className="rounded-2xl border border-critical/25 bg-critical-container p-8 text-center">
          <AlertTriangle className="mx-auto mb-3 text-critical" size={28} />
          <p className="text-sm font-bold text-critical">{error}</p>
          <Button size="sm" onClick={load} className="mt-4 bg-critical text-white hover:bg-critical/90">Thử lại</Button>
        </div>
      ) : (
        <>
          {/* Date filter + indicator ngày đang xem */}
          <section className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex gap-1 rounded-xl border border-border bg-surface p-1">
                {DATE_RANGES.map((r) => (
                  <button
                    key={r.key}
                    type="button"
                    onClick={() => setDateKey(r.key)}
                    className={cn(
                      "rounded-lg px-3 py-1.5 text-xs font-bold transition",
                      dateKey === r.key ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
              <input
                type="date"
                value={customDate}
                onChange={(e) => {
                  setCustomDate(e.target.value);
                  if (e.target.value) setDateKey("CUSTOM");
                }}
                aria-label="Chọn ngày"
                className={cn(
                  "h-9 rounded-xl border px-3 text-xs font-bold outline-none",
                  dateKey === "CUSTOM" ? "border-primary text-primary" : "border-border text-muted-foreground",
                )}
              />
            </div>
            <span className="rounded-full bg-primary-container px-3 py-1.5 text-xs font-bold text-primary-strong">
              {viewingLabel}
            </span>
          </section>

          {/* KPI — số thật theo khoảng ngày đang chọn */}
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {KPI_CARDS.map(({ key, label, icon }) => (
              <article key={key} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
                <img src={icon} alt="" width={40} height={40} className="rounded-xl" />
                <div>
                  <p className="text-xs font-semibold text-muted-foreground">{label}</p>
                  <b className="mt-0.5 block text-2xl font-extrabold text-foreground">{kpis[key]}</b>
                </div>
              </article>
            ))}
          </section>

          {/* Alert banner mỏng — chỉ hiện khi có booking cần xử lý */}
          {kpis.needAction > 0 && !urgentOnly && (
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-warning/40 bg-warning-container px-4 py-3">
              <p className="flex items-center gap-2 text-sm font-bold text-warning">
                <img src={STAFF_ASSETS.kpi.warning} alt="" width={22} height={22} className="rounded-md" />
                {kpis.needAction} booking cần xử lý ngay
              </p>
              <Button size="sm" onClick={() => setUrgentOnly(true)} className="bg-warning text-white hover:bg-warning/90">
                Xem nhanh
              </Button>
            </div>
          )}

          {/* Search + status tabs */}
          <section className="rounded-2xl border border-border bg-card p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <label className="flex h-10 flex-1 items-center gap-2 rounded-xl border border-border px-3 lg:max-w-md">
                <Search size={16} className="text-neutral-muted" />
                <input
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Tìm mã lịch, khách hàng, số điện thoại hoặc biển số..."
                  className="w-full bg-transparent text-sm outline-none"
                />
              </label>
              {urgentOnly && (
                <button
                  type="button"
                  onClick={() => setUrgentOnly(false)}
                  className="flex shrink-0 items-center gap-1.5 rounded-full bg-warning-container px-3 py-1.5 text-xs font-bold text-warning"
                  title="Bỏ lọc cần xử lý"
                >
                  Đang lọc: Cần xử lý
                  <img src={STAFF_ASSETS.action.close} alt="" width={14} height={14} className="rounded" />
                </button>
              )}
            </div>

            <div className="no-scrollbar mt-3 flex gap-1 overflow-x-auto border-t border-border pt-3">
              {STATUS_TABS.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setTab(key)}
                  className={cn(
                    "flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition",
                    tab === key
                      ? "bg-primary text-white"
                      : "bg-surface text-muted-foreground hover:text-foreground",
                  )}
                >
                  {tabLabels[key]}
                  <span
                    className={cn(
                      "grid h-4 min-w-4 place-items-center rounded-full px-1 text-xs font-bold",
                      tab === key ? "bg-card/25 text-white" : "bg-muted text-muted-foreground",
                    )}
                  >
                    {tabCounts[key]}
                  </span>
                </button>
              ))}
            </div>
          </section>

          {/* Table full-width */}
          <section className="rounded-2xl border border-border bg-card">
            {visible.length === 0 ? (
              <div className="flex flex-col items-center px-6 py-12 text-center">
                <img src={STAFF_ASSETS.illustration.emptyBookings} alt="" className="h-28 w-auto" />
                <p className="mt-3 text-sm font-semibold text-foreground">
                  {hasFilter
                    ? "Không có booking nào ở trạng thái này."
                    : "Chưa có lịch đặt nào trong ngày đang xem."}
                </p>
                <p className="mt-1 max-w-md text-xs leading-5 text-muted-foreground">
                  {hasFilter
                    ? "Thử thay đổi bộ lọc hoặc chọn trạng thái khác để xem danh sách."
                    : "Lịch mới của khách sẽ hiện tại đây — bấm \"Tải lại\" để cập nhật."}
                </p>
                {hasFilter && (
                  <Button size="sm" variant="outline" className="mt-4" onClick={clearFilters}>
                    Xóa bộ lọc
                  </Button>
                )}
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1100px] text-left text-xs">
                    <thead className="bg-surface font-semibold text-muted-foreground">
                      <tr>
                        <th className="p-4 font-semibold">Booking / Khách</th>
                        <th className="p-4 font-semibold">Xe</th>
                        <th className="p-4 font-semibold">Dịch vụ</th>
                        <th className="p-4 font-semibold">Khung giờ</th>
                        <th className="p-4 font-semibold">Trạng thái</th>
                        <th className="p-4 font-semibold">Thanh toán</th>
                        <th className="p-4 font-semibold">Điều kiện thao tác</th>
                        <th className="p-4 font-semibold">Cần xử lý</th>
                        <th className="w-[300px] p-4 text-right font-semibold">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {paged.map((b) => {
                        const urgentLabels = urgentShortLabels(b);
                        return (
                          <tr key={b.id} className="align-middle hover:bg-surface">
                            <td className="p-4">
                              <b className="text-primary">{b.code}</b>
                              <span className="mt-1 block font-semibold text-ink-soft">{b.customerName}</span>
                              <span className="block text-neutral-muted">{b.phone}</span>
                            </td>
                            <td className="p-4">
                              <b className="text-foreground">{b.plate}</b>
                              <span className="mt-1 block text-muted-foreground">{b.vehicle}</span>
                            </td>
                            <td className="max-w-[140px] truncate p-4 text-muted-foreground">{b.serviceName}</td>
                            <td className="p-4">
                              <b className="text-sm text-foreground">{formatTime(b.slotTime) || "--:--"}</b>
                              {fromDate !== toDate && (
                                <span className="mt-0.5 block text-muted-foreground">{formatDate(b.bookingDate)}</span>
                              )}
                            </td>
                            <td className="p-4">
                              <StatusBadge status={displayBookingStatus(b)} type="booking" size="sm" />
                            </td>
                            <td className="p-4">
                              <StatusBadge status={b.paymentStatus} type="payment" size="sm" />
                            </td>
                            <td className="p-4 font-semibold text-ink-soft">{actionConditionOf(b)}</td>
                            <td className="p-4">
                              {urgentLabels.length === 0 ? (
                                <span className="text-neutral-muted">—</span>
                              ) : (
                                urgentLabels.map((label) => (
                                  <span key={label} className="block font-bold leading-5 text-no-show">{label}</span>
                                ))
                              )}
                            </td>
                            <td className="p-4 pl-3">
                              <StaffBookingActions booking={b} busyId={busyId} {...actions} />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <Pagination
                  page={page}
                  pageSize={pageSize}
                  total={visible.length}
                  onPageChange={setPage}
                  onPageSizeChange={setPageSize}
                />
              </>
            )}
          </section>
        </>
      )}

      <StaffCheckInModal
        booking={checkInTarget}
        open={Boolean(checkInTarget)}
        onOpenChange={(open) => { if (!open) setCheckInTarget(null); }}
        onDone={load}
      />
      <StaffRejectModal
        booking={rejectTarget}
        open={Boolean(rejectTarget)}
        onOpenChange={(open) => { if (!open) setRejectTarget(null); }}
        onDone={load}
      />
      <StaffBookingDetailModal
        booking={detailTarget}
        open={Boolean(detailTarget)}
        onOpenChange={(open) => { if (!open) setDetailTarget(null); }}
      />
    </div>
  );
}
