import { useCallback, useEffect, useMemo, useState } from "react";
import { Search, AlertTriangle } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import StatusBadge from "@/components/shared/StatusBadge";
import { staffApi } from "@/api/staffApi";
import { userApi } from "@/api/userApi";
import {
  normalizeBookingList,
  normalizeStaffBooking,
  getNextStaffAction,
  isUrgent,
  isPaymentInvalid,
  displayBookingStatus,
} from "@/lib/staff-booking-data";
import { useStaffBookingActions } from "@/lib/use-staff-booking-actions";
import { bookingStatusLabels } from "@/lib/status-tones";
import { formatDate, formatTime, formatMoney } from "@/lib/format";
import { STAFF_ASSETS } from "@/lib/staff-assets";
import { StaffBookingActions } from "@/components/staff/StaffBookingActions";
import { StaffCheckInModal } from "@/components/staff/StaffCheckInModal";
import { StaffRejectModal } from "@/components/staff/StaffRejectModal";
import { StaffBookingDetailModal } from "@/components/staff/StaffBookingDetailModal";

const STATUS_OPTIONS = [
  "PENDING",
  "CONFIRMED",
  "CHECKED_IN",
  "WASHING",
  "COMPLETED",
  "REJECTED",
  "NO_SHOW",
  "CANCELLED",
];

const HINT_CHIPS = ["Mã booking", "Biển số xe", "Số điện thoại", "Tên khách hàng"];

const CLOSED_REASONS = {
  COMPLETED: "Booking đã hoàn tất",
  CANCELLED: "Booking đã hủy",
  REJECTED: "Gara đã từ chối",
  NO_SHOW: "Khách không đến",
};

/**
 * Lý do đủ/không đủ điều kiện xử lý — suy từ status/payment/garage scope thật,
 * nhất quán với getNextStaffAction (không bao giờ mâu thuẫn với nút hành động).
 */
function workflowConditionOf(booking, inScope) {
  if (inScope === false) return { eligible: false, reason: "Sai garage — ngoài phạm vi xử lý" };
  if (CLOSED_REASONS[booking.bookingStatus]) {
    return { eligible: false, reason: CLOSED_REASONS[booking.bookingStatus] };
  }
  if (booking.paymentStatus !== "PAID") {
    return { eligible: false, reason: "Thanh toán chưa hợp lệ" };
  }
  const action = getNextStaffAction(booking);
  if (action?.enabled) {
    return { eligible: true, reason: `Đủ điều kiện: ${action.label}` };
  }
  return { eligible: false, reason: action?.disabledHint || "Chưa đủ điều kiện xử lý" };
}

function attentionOf(booking, inScope) {
  if (inScope === false) return "Ngoài phạm vi";
  if (isPaymentInvalid(booking)) return "Payment bất thường";
  if (["PENDING", "CONFIRMED"].includes(booking.bookingStatus) && booking.paymentStatus !== "PAID") {
    return "Cần chú ý";
  }
  if (isUrgent(booking)) return "Cần chú ý";
  return null;
}

function ResultSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-40 rounded-2xl" />)}
    </div>
  );
}

export default function StaffBookingSearchPage() {
  const [bookings, setBookings] = useState([]);
  const [garageIds, setGarageIds] = useState(null); // null = chưa biết scope
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [checkInTarget, setCheckInTarget] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [detailTarget, setDetailTarget] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    staffApi
      .getAllBookings()
      .then((data) => {
        setBookings(normalizeBookingList(data).map(normalizeStaffBooking));
        setLastUpdated(new Date());
      })
      .catch((e) => {
        console.error("[StaffBookingSearch] load failed:", e);
        setError(e?.message || "Không thể tải danh sách booking.");
        setBookings([]);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  // Garage scope thật từ tài khoản đang đăng nhập (/users/me → garageIds).
  useEffect(() => {
    let mounted = true;
    userApi
      .getMe()
      .then((me) => { if (mounted) setGarageIds(me?.garageIds || []); })
      .catch(() => {}); // không chặn trang; scope giữ null = không hiển thị cảnh báo sai
    return () => { mounted = false; };
  }, []);

  const { busyId, handleNextAction, handleConfirmPayment, handleNoShow } = useStaffBookingActions(load);

  // null = chưa xác định (không kết luận sai garage khi thiếu dữ liệu scope)
  const inScopeOf = useCallback((booking) => {
    if (!Array.isArray(garageIds) || garageIds.length === 0) return null;
    if (booking.garageId == null) return null;
    return garageIds.some((id) => String(id) === String(booking.garageId));
  }, [garageIds]);

  const results = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return bookings
      .filter((b) => {
        if (statusFilter !== "ALL" && b.bookingStatus !== statusFilter) return false;
        if (!kw) return true;
        return `${b.code} ${b.customerName} ${b.phone} ${b.plate}`.toLowerCase().includes(kw);
      })
      // Lịch hẹn mới nhất lên đầu: sắp theo ngày + giờ hẹn giảm dần, cùng thời điểm thì id lớn (tạo sau) trước.
      .sort((a, b) => {
        const ka = `${a.bookingDate || ""}T${a.slotTime || "00:00"}`;
        const kb = `${b.bookingDate || ""}T${b.slotTime || "00:00"}`;
        if (ka !== kb) return kb.localeCompare(ka);
        return (Number(b.id) || 0) - (Number(a.id) || 0);
      });
  }, [bookings, keyword, statusFilter]);

  const summary = useMemo(() => {
    let eligible = 0;
    let attention = 0;
    results.forEach((b) => {
      const scope = inScopeOf(b);
      if (workflowConditionOf(b, scope).eligible) eligible += 1;
      if (attentionOf(b, scope)) attention += 1;
    });
    return { found: results.length, eligible, attention };
  }, [results, inScopeOf]);

  const hasFilter = keyword.trim() !== "" || statusFilter !== "ALL";
  const clearSearch = () => { setKeyword(""); setStatusFilter("ALL"); };

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

  const SUMMARY_PILLS = [
    { key: "found", label: "Kết quả tìm thấy", icon: STAFF_ASSETS.nav.search, tone: "text-foreground" },
    { key: "eligible", label: "Đủ điều kiện xử lý", icon: STAFF_ASSETS.status.paid, tone: "text-success" },
    { key: "attention", label: "Cần chú ý", icon: STAFF_ASSETS.kpi.warning, tone: "text-warning" },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Vận hành hôm nay"
        title="Tra cứu booking"
        description="Nhân viên tra cứu booking bằng mã đặt lịch, biển số xe hoặc số điện thoại."
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

      {/* Info banner mỏng */}
      <div className="flex items-center gap-2 rounded-xl border border-primary/20 bg-primary-container px-4 py-2.5">
        <img src={STAFF_ASSETS.action.info} alt="" width={18} height={18} className="shrink-0 rounded" />
        <p className="text-xs font-semibold text-primary-strong">
          Chỉ xử lý quy trình khi lịch hẹn đã xác nhận và thanh toán hợp lệ.
        </p>
      </div>

      {/* Search panel */}
      <section className="rounded-2xl border border-border bg-card p-5">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <label className="text-xs font-bold text-foreground" htmlFor="staff-search-keyword">
              Từ khóa tra cứu
            </label>
            <div className="mt-1.5 flex h-11 items-center gap-2 rounded-xl border border-input px-3 focus-within:border-ring">
              <Search size={16} className="shrink-0 text-neutral-muted" />
              <input
                id="staff-search-keyword"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Nhập mã booking, biển số xe, số điện thoại hoặc tên khách hàng"
                className="w-full bg-transparent text-sm outline-none"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-foreground" htmlFor="staff-search-status">
              Lọc theo trạng thái
            </label>
            <select
              id="staff-search-status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="mt-1.5 h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-ring"
            >
              <option value="ALL">Tất cả trạng thái</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{bookingStatusLabels[s]}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-muted-foreground">Tra cứu theo:</span>
          {HINT_CHIPS.map((chip) => (
            <span key={chip} className="rounded-full bg-surface px-2.5 py-1 text-xs font-semibold text-muted-foreground">
              {chip}
            </span>
          ))}
        </div>

        {/* Summary — 3 pill, số thật từ kết quả đang lọc */}
        <div className="mt-4 grid grid-cols-1 gap-3 border-t border-border pt-4 sm:grid-cols-3">
          {SUMMARY_PILLS.map(({ key, label, icon, tone }) => (
            <div key={key} className="flex items-center gap-3 rounded-xl bg-surface px-4 py-3">
              <img src={icon} alt="" width={32} height={32} className="rounded-lg" />
              <div>
                <p className="text-xs font-semibold text-muted-foreground">{label}</p>
                <b className={`block text-xl font-extrabold ${tone}`}>{summary[key]}</b>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Kết quả */}
      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-bold text-foreground">Kết quả booking</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Tìm thấy {results.length} booking phù hợp.
          </p>
        </div>

        {loading && !bookings.length ? (
          <ResultSkeleton />
        ) : error && !bookings.length ? (
          <div className="rounded-2xl border border-critical/25 bg-critical-container p-8 text-center">
            <AlertTriangle className="mx-auto mb-3 text-critical" size={28} />
            <p className="text-sm font-bold text-critical">{error}</p>
            <Button size="sm" onClick={load} className="mt-4 bg-critical text-white hover:bg-critical/90">Thử lại</Button>
          </div>
        ) : results.length === 0 ? (
          <div className="flex flex-col items-center rounded-2xl border border-border bg-card px-6 py-12 text-center">
            <img src={STAFF_ASSETS.illustration.emptyBookings} alt="" className="h-28 w-auto" />
            <p className="mt-3 text-sm font-semibold text-foreground">Không tìm thấy booking phù hợp.</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Kiểm tra lại mã booking, biển số hoặc số điện thoại.
            </p>
            {hasFilter && (
              <Button size="sm" variant="outline" className="mt-4" onClick={clearSearch}>
                Xóa tìm kiếm
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {results.map((b) => {
              const scope = inScopeOf(b);
              const condition = workflowConditionOf(b, scope);
              const attention = attentionOf(b, scope);
              return (
                <article key={b.id} className="rounded-2xl border border-border bg-card p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-extrabold text-primary">{b.code}</h3>
                    <StatusBadge status={displayBookingStatus(b)} type="booking" size="sm" />
                    <StatusBadge status={b.paymentStatus} type="payment" size="sm" />
                    {attention && (
                      <span className="rounded-full bg-warning-container px-2.5 py-0.5 text-xs font-bold text-warning">
                        {attention}
                      </span>
                    )}
                  </div>

                  {/* Cột 2/3/4 cố định bề rộng để mọi card thẳng hàng nhau */}
                  <div className="mt-3 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_13rem_14rem_16rem]">
                    <div className="text-xs">
                      <p className="text-sm font-bold text-foreground">{b.customerName}</p>
                      <p className="mt-0.5 text-muted-foreground">SĐT: {b.phone}</p>
                      <p className="mt-0.5 text-muted-foreground">
                        Xe: <b className="text-foreground">{b.plate}</b> · {b.vehicle}
                      </p>
                    </div>

                    <div className="text-xs">
                      <p className="text-muted-foreground">Lịch hẹn</p>
                      <p className="mt-0.5 font-bold text-foreground">
                        {formatDate(b.bookingDate)} · {formatTime(b.slotTime) || "--:--"}
                      </p>
                      <p className="mt-0.5 text-muted-foreground">{b.garageName}</p>
                      <p className="mt-0.5 truncate text-muted-foreground">{b.serviceName}</p>
                    </div>

                    <div className="text-xs">
                      <p className="text-muted-foreground">Thanh toán</p>
                      {b.finalAmount > 0 && (
                        <p className="mt-0.5 font-bold text-foreground">{formatMoney(b.finalAmount)}</p>
                      )}
                      <p
                        className={`mt-1.5 font-bold ${condition.eligible ? "text-success" : "text-warning"}`}
                      >
                        {condition.eligible ? "Đủ điều kiện xử lý" : "Chưa đủ điều kiện xử lý"}
                      </p>
                      <p className="mt-0.5 text-muted-foreground">{condition.reason}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 lg:justify-end">
                      {scope === false ? (
                        <div className="flex flex-col items-end gap-1.5">
                          <Button size="sm" variant="outline" disabled title="Booking không thuộc garage bạn phụ trách" className="h-8 px-2.5 text-xs font-semibold">
                            Ngoài phạm vi xử lý
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setDetailTarget(b)} className="h-8 px-2.5 text-xs font-semibold">
                            Chi tiết
                          </Button>
                        </div>
                      ) : (
                        <StaffBookingActions booking={b} busyId={busyId} {...actions} />
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

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
        inScope={detailTarget ? inScopeOf(detailTarget) ?? undefined : undefined}
      />
    </div>
  );
}
