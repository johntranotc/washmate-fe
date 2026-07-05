import { useCallback, useEffect, useMemo, useState } from "react";
import PageHeader from "@/components/shared/PageHeader";
import { AlertTriangle } from "lucide-react";
import { staffApi } from "@/api/staffApi";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  normalizeBookingList,
  normalizeStaffBooking,
  isUrgent,
} from "@/lib/staff-booking-data";
import { useStaffBookingActions } from "@/lib/use-staff-booking-actions";
import { todayISO } from "@/lib/format";
import { STAFF_ASSETS } from "@/lib/staff-assets";
import { StaffQueueFilters, QUEUE_TABS } from "@/components/staff/StaffQueueFilters";
import { StaffQueueUrgent } from "@/components/staff/StaffQueueUrgent";
import { StaffQueueTable } from "@/components/staff/StaffQueueTable";
import { StaffQueueClosedSection } from "@/components/staff/StaffQueueClosedSection";
import { StaffCheckInModal } from "@/components/staff/StaffCheckInModal";
import { StaffRejectModal } from "@/components/staff/StaffRejectModal";
import { StaffBookingDetailModal } from "@/components/staff/StaffBookingDetailModal";

function isoOf(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

// Khoảng ngày cho filter phụ: Hôm nay / Ngày mai / Tuần này (Thứ 2 → Chủ nhật).
function dateRangeOf(key) {
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
  const iso = todayISO();
  return [iso, iso];
}

const TABLE_TITLES = { TODAY: "Hàng đợi hôm nay", TOMORROW: "Hàng đợi ngày mai", WEEK: "Hàng đợi tuần này" };

const KPI_CARDS = [
  { key: "pending", label: "Chờ xác nhận", icon: STAFF_ASSETS.kpi.hourglass },
  { key: "unpaid", label: "Chờ thanh toán", icon: STAFF_ASSETS.status.unpaid },
  { key: "waitingCheckIn", label: "Chờ check-in", icon: STAFF_ASSETS.kpi.userCheck },
  { key: "washing", label: "Đang rửa", icon: STAFF_ASSETS.kpi.droplet },
  { key: "needAction", label: "Cần xử lý", icon: STAFF_ASSETS.kpi.warning },
];

function QueueSkeleton() {
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
      </div>
      <Skeleton className="h-28 rounded-2xl" />
      <Skeleton className="h-96 rounded-2xl" />
    </div>
  );
}

export default function StaffQueuePage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const [keyword, setKeyword] = useState("");
  const [dateKey, setDateKey] = useState("TODAY");
  const [tab, setTab] = useState("ALL");

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
        console.error("[StaffQueue] load failed:", e);
        setError(e?.message || "Không thể tải danh sách lịch đặt.");
        setBookings([]);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  // Quay lại tab trình duyệt → làm mới dữ liệu (pattern sẵn có, không polling).
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

  // Scope theo khoảng ngày + từ khóa — mọi section/count đều tính trên tập này.
  const scoped = useMemo(() => {
    const [from, to] = dateRangeOf(dateKey);
    const kw = keyword.trim().toLowerCase();
    return bookings
      .filter((b) => b.bookingDate >= from && b.bookingDate <= to)
      .filter((b) => !kw || `${b.code} ${b.customerName} ${b.phone} ${b.plate}`.toLowerCase().includes(kw))
      .sort((a, b) =>
        (a.bookingDate || "").localeCompare(b.bookingDate || "") ||
        (a.slotTime || "99:99").localeCompare(b.slotTime || "99:99"));
  }, [bookings, dateKey, keyword]);

  const counts = useMemo(
    () => Object.fromEntries(QUEUE_TABS.map((t) => [t.key, scoped.filter(t.match).length])),
    [scoped],
  );

  const kpis = useMemo(() => ({
    pending: counts.PENDING ?? 0,
    unpaid: counts.UNPAID ?? 0,
    waitingCheckIn: counts.CONFIRMED ?? 0,
    washing: counts.WASHING ?? 0,
    needAction: counts.NEED_ACTION ?? 0,
  }), [counts]);

  const urgent = useMemo(() => scoped.filter((b) => isUrgent(b)), [scoped]);

  const matcher = QUEUE_TABS.find((t) => t.key === tab)?.match || (() => true);
  // Booking đã nằm ở "Cần xử lý ngay" không lặp lại trong bảng chính;
  // đếm riêng để empty state giải thích rõ khi tab đang lọc trống.
  const { tableItems, urgentMatchingCount } = useMemo(() => {
    let matched = scoped.filter(matcher);
    // Tab "Tất cả": lịch Từ chối/Hủy nằm ở section collapse phía dưới, không lặp trong bảng.
    if (tab === "ALL") matched = matched.filter((b) => !["REJECTED", "CANCELLED"].includes(b.bookingStatus));
    return {
      tableItems: matched.filter((b) => !isUrgent(b)),
      urgentMatchingCount: matched.filter((b) => isUrgent(b)).length,
    };
  }, [scoped, matcher, tab]);

  const rejected = useMemo(() => scoped.filter((b) => b.bookingStatus === "REJECTED"), [scoped]);
  const cancelled = useMemo(() => scoped.filter((b) => b.bookingStatus === "CANCELLED"), [scoped]);

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
    <div className="space-y-5">
      <PageHeader
        eyebrow="Khu vực vận hành"
        title="Hàng đợi"
        description="Xử lý booking theo trạng thái vận hành trong ngày."
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
        <QueueSkeleton />
      ) : error && !bookings.length ? (
        <div className="rounded-2xl border border-critical/25 bg-critical-container p-8 text-center">
          <AlertTriangle className="mx-auto mb-3 text-critical" size={28} />
          <p className="text-sm font-bold text-critical">{error}</p>
          <Button size="sm" onClick={load} className="mt-4 bg-critical text-white hover:bg-critical/90">Thử lại</Button>
        </div>
      ) : (
        <>
          {/* KPI gọn — số thật trong khoảng ngày đang chọn */}
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {KPI_CARDS.map(({ key, label, icon }) => (
              <article key={key} className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4">
                <img src={icon} alt="" width={40} height={40} className="rounded-xl" />
                <div>
                  <p className="text-xs font-semibold text-muted-foreground">{label}</p>
                  <b className="mt-0.5 block text-2xl font-extrabold text-foreground">{kpis[key]}</b>
                </div>
              </article>
            ))}
          </section>

          <StaffQueueFilters
            keyword={keyword}
            onKeyword={setKeyword}
            dateKey={dateKey}
            onDateKey={setDateKey}
            tab={tab}
            onTab={setTab}
            counts={counts}
          />

          <StaffQueueUrgent bookings={urgent} busyId={busyId} actions={actions} />

          <StaffQueueTable
            title={TABLE_TITLES[dateKey]}
            filterLabel={tab === "ALL" ? null : QUEUE_TABS.find((t) => t.key === tab)?.label}
            bookings={tableItems}
            urgentMatchingCount={urgentMatchingCount}
            onClearFilter={() => setTab("ALL")}
            busyId={busyId}
            actions={actions}
            showDate={dateKey === "WEEK"}
          />

          {tab === "ALL" && (
            <>
              <StaffQueueClosedSection title="Lịch bị từ chối" bookings={rejected} onDetail={setDetailTarget} />
              <StaffQueueClosedSection title="Lịch khách hủy" bookings={cancelled} onDetail={setDetailTarget} />
            </>
          )}
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
