import StatusBadge from "@/components/shared/StatusBadge";
import { StaffBookingActions } from "@/components/staff/StaffBookingActions";
import {
  minutesUntilSlot,
  isPaymentInvalid,
  displayBookingStatus,
  NO_SHOW_GRACE_MINUTES,
} from "@/lib/staff-booking-data";
import { formatTime } from "@/lib/format";
import { STAFF_ASSETS } from "@/lib/staff-assets";

// Ghi chú vận hành cho từng item — suy ra từ dữ liệu thời gian/payment thật.
function urgentNotes(booking) {
  const notes = [];
  const m = minutesUntilSlot(booking);
  if (typeof m === "number" && m < 0) {
    const late = Math.abs(m);
    const untilNoShow = NO_SHOW_GRACE_MINUTES - late;
    if (booking.bookingStatus === "CONFIRMED" && untilNoShow > 0) {
      notes.push(`Quá ${late} phút · còn ${untilNoShow} phút trước No-show`);
    } else {
      notes.push(`Quá ${late} phút`);
    }
  }
  if (isPaymentInvalid(booking)) {
    notes.push(
      booking.paymentStatus === "FAILED"
        ? "Thanh toán thất bại, cần khách thanh toán lại trước khi check-in."
        : "Thanh toán đã bị hủy, cần gửi lại link trước khi check-in.",
    );
  }
  return notes;
}

/**
 * "Cần xử lý ngay" — booking quá giờ hẹn hoặc thanh toán bị hủy/thất bại
 * (PENDING/CONFIRMED). Dữ liệu thật từ danh sách chung; không render khi trống.
 */
export function StaffQueueUrgent({ bookings = [], busyId, actions }) {
  if (bookings.length === 0) return null;

  return (
    <section className="rounded-2xl border border-warning/40 bg-card p-5">
      <div className="flex items-center gap-2">
        <img src={STAFF_ASSETS.kpi.warning} alt="" width={28} height={28} className="rounded-lg" />
        <h2 className="text-lg font-bold text-foreground">Cần xử lý ngay</h2>
        <span className="grid h-5 min-w-5 place-items-center rounded-full bg-warning px-1 text-xs font-extrabold text-white">
          {bookings.length}
        </span>
      </div>

      <div className="mt-4 space-y-2.5">
        {bookings.map((b) => (
          <div
            key={b.id}
            className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 xl:flex-row xl:items-center"
          >
            <div className="w-14 shrink-0 text-center">
              <p className="text-sm font-extrabold text-foreground">{formatTime(b.slotTime) || "--:--"}</p>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <b className="text-sm text-primary">{b.code}</b>
                <span className="text-sm font-bold text-foreground">{b.customerName}</span>
                <span className="text-xs text-muted-foreground">{b.phone}</span>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {b.plate} · {b.serviceName}
                {b.note ? ` · ${b.note}` : ""}
              </p>
              {urgentNotes(b).map((note) => (
                <p key={note} className="mt-1 text-xs font-bold leading-5 text-no-show">{note}</p>
              ))}
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-1.5">
              <StatusBadge status={displayBookingStatus(b)} type="booking" size="sm" />
              <StatusBadge status={b.paymentStatus} type="payment" size="sm" />
            </div>
            <StaffBookingActions booking={b} busyId={busyId} {...actions} />
          </div>
        ))}
      </div>
    </section>
  );
}
