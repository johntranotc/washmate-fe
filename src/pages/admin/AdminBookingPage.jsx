import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarDays, CalendarCheck2, Car, CheckCircle2, Clock3, Search,
  AlertTriangle, RefreshCw, Download,
} from "lucide-react";
import PageContainer from "@/components/shared/PageContainer";
import PageHeader from "@/components/shared/PageHeader";
import StatusBadge from "@/components/shared/StatusBadge";
import Pagination from "../../components/common/Pagination";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { adminApi } from "../../api/adminApi";
import { garageApi } from "../../api/garageApi";
import {
  normalizeBookingList,
  normalizeStaffBooking,
  isOverdue,
  isPaymentInvalid,
  isUrgent,
  minutesUntilSlot,
} from "../../lib/staff-booking-data";
import { useStaffBookingActions } from "../../lib/use-staff-booking-actions";
import { bookingStatusLabels, paymentStatusLabels } from "../../lib/status-tones";
import { todayISO, formatDate, formatTime, formatNumber, friendlyName } from "../../lib/format";
import { cn } from "@/lib/utils";
import { NeedActionTodayCard } from "../../components/admin/dashboard/NeedActionTodayCard";
import { StaffBookingActions } from "../../components/staff/StaffBookingActions";
import { StaffCheckInModal } from "../../components/staff/StaffCheckInModal";
import { StaffRejectModal } from "../../components/staff/StaffRejectModal";
import { StaffBookingDetailModal } from "../../components/staff/StaffBookingDetailModal";

const SERVING_STATUSES = ["CHECKED_IN", "WASHING"];

const STATUS_TABS = [
  { key: "ALL", label: "Tất cả", match: () => true },
  { key: "PENDING", label: "Chờ xác nhận", match: (b) => b.bookingStatus === "PENDING" },
  { key: "CONFIRMED", label: "Đã xác nhận", match: (b) => b.bookingStatus === "CONFIRMED" },
  { key: "CHECKED_IN", label: "Đã check-in", match: (b) => b.bookingStatus === "CHECKED_IN" },
  { key: "WASHING", label: "Đang rửa", match: (b) => b.bookingStatus === "WASHING" },
  { key: "COMPLETED", label: "Hoàn tất", match: (b) => b.bookingStatus === "COMPLETED" },
  { key: "NEED_ACTION", label: "Cần xử lý", match: (b) => isUrgent(b) },
  { key: "NO_SHOW", label: "Không đến", match: (b) => b.bookingStatus === "NO_SHOW" },
  { key: "CANCELLED", label: "Đã hủy", match: (b) => ["CANCELLED", "REJECTED"].includes(b.bookingStatus) },
];

const PAYMENT_OPTIONS = ["PAID", "PENDING", "FAILED", "CANCELLED", "REFUNDED"];

const DATE_RANGES = [
  { key: "today", label: "Hôm nay" },
  { key: "week", label: "7 ngày qua" },
  { key: "month", label: "Tháng này" },
  { key: "all", label: "Toàn bộ" },
];

function isoAddDays(iso, delta) {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + delta);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// Nhãn NGẮN cho cột "Cần xử lý" — suy từ status/payment/thời gian thật.
function attentionLabelOf(b) {
  const m = minutesUntilSlot(b);
  if (isOverdue(b) && typeof m === "number") return `Quá giờ ${Math.abs(m)} phút`;
  if (b.paymentStatus === "FAILED") return "Cần đối soát";
  if (isPaymentInvalid(b)) return "Nhắc thanh toán";
  if (b.bookingStatus === "PENDING") return b.paymentStatus === "PAID" ? "Cần admin xác nhận" : "Nhắc thanh toán";
  if (b.bookingStatus === "CONFIRMED" && b.paymentStatus !== "PAID") return "Nhắc thanh toán";
  return null;
}

function BookingsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
        {Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
      </div>
      <Skeleton className="h-32 rounded-2xl" />
      <Skeleton className="h-24 rounded-2xl" />
      <Skeleton className="h-96 rounded-2xl" />
    </div>
  );
}

export default function AdminBookingPage() {
  const [garages, setGarages] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Filter phạm vi trang (header): chi nhánh + khoảng thời gian nhanh
  const [garageId, setGarageId] = useState("all");
  const [rangeKey, setRangeKey] = useState("month");
  // Filter bảng: search + trạng thái + thanh toán + khoảng ngày tùy chỉnh
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [paymentFilter, setPaymentFilter] = useState("ALL");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [tab, setTab] = useState("ALL");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [checkInTarget, setCheckInTarget] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [detailTarget, setDetailTarget] = useState(null);

  // Khoảng ngày gửi lên BE (filter thật của GET /api/bookings)
  const { fromDate, toDate } = useMemo(() => {
    if (customFrom || customTo) {
      const f = customFrom || customTo;
      const t = customTo || customFrom;
      return f <= t ? { fromDate: f, toDate: t } : { fromDate: t, toDate: f };
    }
    const today = todayISO();
    if (rangeKey === "today") return { fromDate: today, toDate: today };
    if (rangeKey === "week") return { fromDate: isoAddDays(today, -6), toDate: today };
    if (rangeKey === "month") return { fromDate: `${today.slice(0, 8)}01`, toDate: today };
    return { fromDate: "", toDate: "" }; // Toàn bộ
  }, [rangeKey, customFrom, customTo]);

  useEffect(() => {
    garageApi.getAll()
      .then((d) => setGarages(Array.isArray(d) ? d : []))
      .catch(() => setGarages([]));
  }, []);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    const params = { size: 1000, sort: "id,desc" };
    if (garageId !== "all") params.garageId = garageId;
    if (fromDate) params.fromDate = fromDate;
    if (toDate) params.toDate = toDate;
    adminApi.getBookings(params)
      .then((res) => {
        setBookings(normalizeBookingList(res).map(normalizeStaffBooking));
        setLastUpdated(new Date());
      })
      .catch((e) => {
        console.error("[AdminBookings] load failed:", e);
        setError(e?.message || "Không thể tải danh sách lịch hẹn.");
        setBookings([]);
      })
      .finally(() => setLoading(false));
  }, [garageId, fromDate, toDate]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [keyword, statusFilter, paymentFilter, tab, pageSize, bookings]);

  const { busyId, handleNextAction, handleConfirmPayment, handleNoShow } = useStaffBookingActions(load);

  // Scope sau search + dropdown (trước tab) — tab count tính trên tập này.
  const scoped = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return bookings.filter((b) => {
      if (statusFilter !== "ALL" && b.bookingStatus !== statusFilter) return false;
      if (paymentFilter !== "ALL" && b.paymentStatus !== paymentFilter) return false;
      if (kw && !`${b.code} ${b.customerName} ${b.phone} ${b.plate}`.toLowerCase().includes(kw)) return false;
      return true;
    });
  }, [bookings, keyword, statusFilter, paymentFilter]);

  const tabCounts = useMemo(
    () => Object.fromEntries(STATUS_TABS.map((t) => [t.key, scoped.filter(t.match).length])),
    [scoped],
  );

  const matcher = STATUS_TABS.find((t) => t.key === tab)?.match || (() => true);
  const filtered = useMemo(
    () => scoped
      .filter(matcher)
      .sort((a, b) =>
        (b.bookingDate || "").localeCompare(a.bookingDate || "") ||
        (a.slotTime || "99:99").localeCompare(b.slotTime || "99:99")),
    [scoped, matcher],
  );
  const paged = useMemo(
    () => filtered.slice((page - 1) * pageSize, page * pageSize),
    [filtered, page, pageSize],
  );

  // KPI theo phạm vi header (chi nhánh + khoảng thời gian)
  const kpis = useMemo(() => {
    const by = (s) => bookings.filter((b) => b.bookingStatus === s).length;
    return {
      total: bookings.length,
      pending: by("PENDING"),
      confirmed: by("CONFIRMED"),
      serving: bookings.filter((b) => SERVING_STATUSES.includes(b.bookingStatus)).length,
      needAction: bookings.filter((b) => isUrgent(b)).length,
      completed: by("COMPLETED"),
    };
  }, [bookings]);

  const KPI_CARDS = [
    { key: "total", label: "Tổng lịch hẹn", Icon: CalendarDays, tone: "text-primary bg-primary-container" },
    { key: "pending", label: "Chờ xác nhận", Icon: Clock3, tone: "text-warning bg-warning-container" },
    { key: "confirmed", label: "Đã xác nhận", Icon: CalendarCheck2, tone: "text-primary-strong bg-primary-container" },
    { key: "serving", label: "Xe đang phục vụ", Icon: Car, tone: "text-accent-violet bg-accent-violet/10" },
    { key: "needAction", label: "Cần xử lý", Icon: AlertTriangle, tone: "text-no-show bg-no-show-container" },
    { key: "completed", label: "Hoàn tất", Icon: CheckCircle2, tone: "text-success bg-success-container" },
  ];

  // "Cần xử lý ngay" — trong phạm vi filter header; click để lọc danh sách bên dưới.
  const needActionCounts = useMemo(() => ({
    pending: kpis.pending,
    overdue: bookings.filter((b) => isOverdue(b)).length,
    failedPayments: bookings.filter((b) => b.paymentStatus === "FAILED").length,
    refunded: bookings.filter((b) => b.paymentStatus === "REFUNDED").length,
  }), [bookings, kpis.pending]);

  const handleNeedActionClick = (key) => {
    setStatusFilter("ALL");
    setPaymentFilter("ALL");
    if (key === "pending") setTab("PENDING");
    else if (key === "overdue") setTab("NEED_ACTION");
    else if (key === "failed") { setTab("ALL"); setPaymentFilter("FAILED"); }
    else if (key === "refunded") { setTab("ALL"); setPaymentFilter("REFUNDED"); }
  };

  const hasFilter = keyword.trim() !== "" || statusFilter !== "ALL" || paymentFilter !== "ALL" || tab !== "ALL" || customFrom || customTo;
  const clearFilters = () => {
    setKeyword(""); setStatusFilter("ALL"); setPaymentFilter("ALL"); setTab("ALL");
    setCustomFrom(""); setCustomTo("");
  };

  const actions = {
    onCheckIn: setCheckInTarget,
    onNextAction: handleNextAction,
    onConfirmPayment: handleConfirmPayment,
    onNoShow: handleNoShow,
    onReject: setRejectTarget,
    onDetail: setDetailTarget,
  };

  const updatedLabel = lastUpdated
    ? lastUpdated.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    : null;

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Quản trị hệ thống"
        title="Lịch hẹn"
        description="Theo dõi và quản lý toàn bộ lịch đặt rửa xe trong hệ thống."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={garageId}
              onChange={(e) => setGarageId(e.target.value)}
              className="h-10 rounded-xl border border-input bg-background px-3 text-xs font-bold text-foreground outline-none focus:border-ring"
              aria-label="Chọn chi nhánh"
            >
              <option value="all">Tất cả chi nhánh</option>
              {garages.map((g) => (
                <option key={g.id ?? g.garageId} value={g.id ?? g.garageId}>
                  {friendlyName(g.name ?? g.garageName, "Chi nhánh chưa cập nhật")}
                </option>
              ))}
            </select>
            <select
              value={rangeKey}
              onChange={(e) => { setRangeKey(e.target.value); setCustomFrom(""); setCustomTo(""); }}
              className="h-10 rounded-xl border border-input bg-background px-3 text-xs font-bold text-foreground outline-none focus:border-ring"
              aria-label="Chọn khoảng thời gian"
            >
              {DATE_RANGES.map((r) => <option key={r.key} value={r.key}>{r.label}</option>)}
            </select>
            <Button variant="outline" size="sm" onClick={load} disabled={loading}>
              <RefreshCw className={loading ? "animate-spin" : ""} /> Tải lại
            </Button>
            {updatedLabel && (
              <span className="text-xs font-medium text-muted-foreground">Cập nhật lúc {updatedLabel}</span>
            )}
          </div>
        }
      />

      {loading && !bookings.length ? (
        <BookingsSkeleton />
      ) : error && !bookings.length ? (
        <div className="rounded-2xl border border-critical/25 bg-critical-container p-8 text-center">
          <AlertTriangle className="mx-auto mb-3 text-critical" size={28} />
          <p className="text-sm font-bold text-critical">{error}</p>
          <Button size="sm" onClick={load} className="mt-4 bg-critical text-white hover:bg-critical/90">Thử lại</Button>
        </div>
      ) : (
        <>
          {/* KPI — số thật trong phạm vi chi nhánh + khoảng thời gian đang chọn */}
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
            {KPI_CARDS.map(({ key, label, Icon, tone }) => (
              <article key={key} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
                <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${tone}`}>
                  <Icon size={18} />
                </span>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground">{label}</p>
                  <b className="mt-0.5 block text-xl font-semibold text-foreground">{formatNumber(kpis[key])}</b>
                </div>
              </article>
            ))}
          </section>

          <NeedActionTodayCard
            title="Cần xử lý ngay"
            {...needActionCounts}
            onItemClick={handleNeedActionClick}
          />

          {/* Filter bảng: search + trạng thái + thanh toán + khoảng ngày (chi nhánh đã có ở header) */}
          <section className="rounded-2xl border border-border bg-card p-4">
            <div className="flex flex-wrap items-center gap-3">
              <label className="flex h-10 min-w-[220px] flex-1 items-center gap-2 rounded-xl border border-border px-3 lg:max-w-sm">
                <Search size={16} className="text-neutral-muted" />
                <input
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Tìm mã lịch, khách, SĐT, biển số..."
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
                {["PENDING", "CONFIRMED", "CHECKED_IN", "WASHING", "COMPLETED", "REJECTED", "NO_SHOW", "CANCELLED"].map((s) => (
                  <option key={s} value={s}>{bookingStatusLabels[s]}</option>
                ))}
              </select>
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="h-10 rounded-xl border border-input bg-background px-3 text-xs font-bold outline-none focus:border-ring"
                aria-label="Lọc thanh toán"
              >
                <option value="ALL">Tất cả thanh toán</option>
                {PAYMENT_OPTIONS.map((s) => <option key={s} value={s}>{paymentStatusLabels[s]}</option>)}
              </select>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={customFrom}
                  onChange={(e) => setCustomFrom(e.target.value)}
                  className="h-10 rounded-xl border border-input px-2.5 text-xs font-bold text-muted-foreground outline-none"
                  aria-label="Từ ngày"
                />
                <span className="text-xs text-neutral-muted">→</span>
                <input
                  type="date"
                  value={customTo}
                  min={customFrom || undefined}
                  onChange={(e) => setCustomTo(e.target.value)}
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

            {/* Status tabs — count thật trong phạm vi đang lọc */}
            <div className="no-scrollbar mt-3 flex gap-1 overflow-x-auto border-t border-border pt-3">
              {STATUS_TABS.map((t) => (
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

          {/* Bảng danh sách */}
          <section className="rounded-2xl border border-border bg-card">
            <div className="flex flex-wrap items-center justify-between gap-3 p-5 pb-3">
              <div>
                <h2 className="text-lg font-bold text-foreground">Danh sách lịch hẹn</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Hiển thị {paged.length} / {filtered.length} lịch hẹn
                </p>
              </div>
              {/* BE chưa có API export — nút disabled, không tạo file giả */}
              <Button variant="outline" size="sm" disabled title="Tính năng đang được hoàn thiện">
                <Download /> Xuất dữ liệu
              </Button>
            </div>

            {filtered.length === 0 ? (
              <div className="px-6 py-14 text-center">
                <CalendarDays size={40} className="mx-auto text-border" />
                <p className="mt-3 text-sm font-semibold text-foreground">Không có lịch hẹn phù hợp.</p>
                <p className="mt-1 text-xs text-muted-foreground">Thử thay đổi bộ lọc hoặc khoảng ngày.</p>
                {hasFilter && (
                  <Button size="sm" variant="outline" className="mt-4" onClick={clearFilters}>
                    Xóa bộ lọc
                  </Button>
                )}
              </div>
            ) : (
              <>
                <div className="overflow-x-auto px-5">
                  <table className="w-full min-w-[1150px] text-left text-xs">
                    <thead>
                      <tr className="border-b border-border font-semibold text-neutral-muted">
                        <th className="py-3 pr-3 font-semibold">Booking / Khách</th>
                        <th className="py-3 pr-3 font-semibold">Xe</th>
                        <th className="py-3 pr-3 font-semibold">Dịch vụ</th>
                        <th className="py-3 pr-3 font-semibold">Chi nhánh</th>
                        <th className="py-3 pr-3 font-semibold">Giờ hẹn</th>
                        <th className="py-3 pr-3 font-semibold">Trạng thái</th>
                        <th className="py-3 pr-3 font-semibold">Thanh toán</th>
                        <th className="py-3 pr-3 font-semibold">Cần xử lý</th>
                        <th className="w-[300px] py-3 text-right font-semibold">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface">
                      {paged.map((b) => {
                        const attention = attentionLabelOf(b);
                        return (
                          <tr key={b.id} className="align-middle hover:bg-surface">
                            <td className="min-w-[190px] py-3 pr-3 text-left">
                              <button
                                type="button"
                                onClick={() => setDetailTarget(b)}
                                className="block whitespace-nowrap text-left font-bold text-primary hover:underline"
                              >
                                {b.code || `#${b.id}`}
                              </button>
                              <p className="mt-0.5 text-left font-semibold text-ink-soft">
                                {friendlyName(b.customerName, "Khách hàng chưa cập nhật")}
                              </p>
                              <p className="text-left text-neutral-muted">{b.phone}</p>
                            </td>
                            <td className="py-3 pr-3">
                              <b className="text-foreground">{b.plate}</b>
                              <p className="mt-0.5 text-muted-foreground">{b.vehicle}</p>
                            </td>
                            <td className="max-w-[130px] truncate py-3 pr-3 text-muted-foreground">
                              {friendlyName(b.serviceName, "Dịch vụ chưa cập nhật")}
                            </td>
                            <td className="max-w-[130px] truncate py-3 pr-3 text-muted-foreground">
                              {friendlyName(b.garageName, "Chi nhánh chưa cập nhật")}
                            </td>
                            <td className="py-3 pr-3">
                              <b className="text-sm text-foreground">{formatTime(b.slotTime) || "--:--"}</b>
                              <p className="mt-0.5 text-muted-foreground">{formatDate(b.bookingDate)}</p>
                            </td>
                            <td className="py-3 pr-3"><StatusBadge status={b.bookingStatus} type="booking" size="sm" /></td>
                            <td className="py-3 pr-3"><StatusBadge status={b.paymentStatus} type="payment" size="sm" /></td>
                            <td className="py-3 pr-3">
                              {attention ? (
                                <span className="font-bold leading-5 text-no-show">{attention}</span>
                              ) : (
                                <span className="text-neutral-muted">—</span>
                              )}
                            </td>
                            <td className="py-3 pl-3">
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
                  total={filtered.length}
                  onPageChange={setPage}
                  onPageSizeChange={setPageSize}
                />
                <div className="flex flex-col gap-1 border-t border-border px-5 py-3 text-xs text-neutral-muted sm:flex-row sm:items-center sm:justify-between">
                  <span>Nhấp "Chi tiết" để xem thông tin đầy đủ trong ngăn trượt.</span>
                  <span>Các thao tác quan trọng yêu cầu xác nhận.</span>
                </div>
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
    </PageContainer>
  );
}
