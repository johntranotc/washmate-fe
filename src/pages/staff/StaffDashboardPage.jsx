import { useCallback, useEffect, useMemo, useState } from "react";
import PageHeader from "@/components/shared/PageHeader";
import { AlertTriangle, CalendarClock } from "lucide-react";
import { staffApi } from "@/api/staffApi";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useStaffBookingActions } from "@/lib/use-staff-booking-actions";
import {
  normalizeBookingList,
  normalizeStaffBooking,
  isOverdue,
  minutesUntilSlot,
} from "@/lib/staff-booking-data";
import { todayISO } from "@/lib/format";
import { STAFF_ASSETS } from "@/lib/staff-assets";
import { StaffKpiCards } from "@/components/staff/StaffKpiCards";
import { StaffNextTasks } from "@/components/staff/StaffNextTasks";
import { StaffCheckInModal } from "@/components/staff/StaffCheckInModal";
import { StaffQuickActions } from "@/components/staff/StaffQuickActions";
import { StaffUpcomingCustomers } from "@/components/staff/StaffUpcomingCustomers";
import { StaffRulesCard } from "@/components/staff/StaffRulesCard";
import { StaffIncidentCard } from "@/components/staff/StaffIncidentCard";
import { StaffBookingTable } from "@/components/staff/StaffBookingTable";

const ACTIONABLE = ["PENDING", "CONFIRMED", "CHECKED_IN", "WASHING"];

// Ưu tiên "Việc cần làm tiếp theo": quá giờ → chưa thanh toán → chờ check-in →
// đã check-in → đang rửa; trong cùng nhóm xếp theo giờ hẹn.
function taskPriority(b) {
  if (isOverdue(b)) return 0;
  if (["PENDING", "CONFIRMED"].includes(b.bookingStatus) && b.paymentStatus !== "PAID") return 1;
  if (b.bookingStatus === "CONFIRMED") return 2;
  if (b.bookingStatus === "CHECKED_IN") return 3;
  return 4; // WASHING
}

function readName() {
  try {
    const u = JSON.parse(sessionStorage.getItem("currentUser") || localStorage.getItem("currentUser") || "{}");
    return u?.fullName || u?.name || "bạn";
  } catch {
    return "bạn";
  }
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-36 rounded-2xl" />
        ))}
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
        <div className="space-y-5">
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-80 rounded-2xl" />
        </div>
        <div className="space-y-5">
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-56 rounded-2xl" />
          <Skeleton className="h-40 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

export default function StaffDashboardPage() {
  const [allBookings, setAllBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [checkInBooking, setCheckInBooking] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    staffApi
      .getAllBookings()
      .then((data) => {
        setAllBookings(normalizeBookingList(data).map(normalizeStaffBooking));
        setLastUpdated(new Date());
      })
      .catch((e) => {
        console.error("Failed to load bookings:", e);
        setError(e?.message || "Không thể tải danh sách lịch đặt.");
        setAllBookings([]);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const today = todayISO();
  const todayBookings = useMemo(
    () => allBookings.filter((b) => b.bookingDate === today),
    [allBookings, today],
  );

  const kpis = useMemo(() => {
    const by = (s) => todayBookings.filter((b) => b.bookingStatus === s).length;
    return {
      total: todayBookings.length,
      waitingCheckIn: by("CONFIRMED"),
      checkedIn: by("CHECKED_IN"),
      washing: by("WASHING"),
      completed: by("COMPLETED"),
      needAction: todayBookings.filter((b) => isOverdue(b)).length,
    };
  }, [todayBookings]);

  const nextTasks = useMemo(
    () => todayBookings
      .filter((b) => ACTIONABLE.includes(b.bookingStatus))
      .sort((a, b) =>
        taskPriority(a) - taskPriority(b) ||
        (a.slotTime || "99:99").localeCompare(b.slotTime || "99:99"))
      .slice(0, 6),
    [todayBookings],
  );

  const upcoming = useMemo(
    () => todayBookings
      .filter((b) => {
        if (!["PENDING", "CONFIRMED"].includes(b.bookingStatus)) return false;
        const m = minutesUntilSlot(b);
        return typeof m === "number" && m >= 0;
      })
      .sort((a, b) => (a.slotTime || "99:99").localeCompare(b.slotTime || "99:99"))
      .slice(0, 5),
    [todayBookings],
  );

  const { busyId, handleNextAction, handleConfirmPayment, handleNoShow } = useStaffBookingActions(load);

  const dateLabel = new Date().toLocaleDateString("vi-VN", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" });
  const updatedLabel = lastUpdated
    ? lastUpdated.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    : null;

  return (
    <div className="space-y-6">
      {/* Hero chào ca làm — nền banner gốc staff-overview-hero-bg */}
      <div
        className="rounded-3xl border border-border bg-card p-5 sm:p-6"
        style={{
          backgroundImage: `url(${STAFF_ASSETS.banner.hero})`,
          backgroundSize: "cover",
          backgroundPosition: "right center",
        }}
      >
        <PageHeader
          className="mb-0"
          eyebrow="Trung tâm vận hành"
          title={`Xin chào, ${readName()}!`}
          description={`Hôm nay là ${dateLabel}. Hãy cùng hoàn thành các công việc trong ngày.`}
          actions={
            <>
              <span className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-xs font-bold text-muted-foreground">
                <CalendarClock size={14} /> Hôm nay
              </span>
              <Button variant="outline" size="sm" onClick={load} disabled={loading}>
                <img
                  src={STAFF_ASSETS.action.refresh}
                  alt=""
                  width={16}
                  height={16}
                  className={`rounded ${loading ? "animate-spin" : ""}`}
                />
                Làm mới
              </Button>
              {updatedLabel && (
                <span className="text-xs font-medium text-muted-foreground">Cập nhật lúc {updatedLabel}</span>
              )}
            </>
          }
        />
      </div>

      {loading && !allBookings.length ? (
        <DashboardSkeleton />
      ) : error && !allBookings.length ? (
        <div className="rounded-2xl border border-critical/25 bg-critical-container p-8 text-center">
          <AlertTriangle className="mx-auto mb-3 text-critical" size={28} />
          <p className="text-sm font-bold text-critical">{error}</p>
          <Button size="sm" onClick={load} className="mt-4 bg-critical text-white hover:bg-critical/90">Thử lại</Button>
        </div>
      ) : (
        <>
          <StaffKpiCards {...kpis} />

          <div className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
            <div className="space-y-5">
              <StaffNextTasks
                tasks={nextTasks}
                busyId={busyId}
                onCheckIn={setCheckInBooking}
                onAction={handleNextAction}
                onConfirmPayment={handleConfirmPayment}
                onNoShow={handleNoShow}
              />
              <StaffBookingTable bookings={todayBookings} />
            </div>
            <div className="space-y-5">
              <StaffQuickActions />
              <StaffUpcomingCustomers bookings={upcoming} />
              <StaffRulesCard />
              <StaffIncidentCard />
            </div>
          </div>
        </>
      )}

      <StaffCheckInModal
        booking={checkInBooking}
        open={Boolean(checkInBooking)}
        onOpenChange={(open) => { if (!open) setCheckInBooking(null); }}
        onDone={load}
      />
    </div>
  );
}
