import { Button } from "@/components/ui/button";
import { getNextStaffAction, canMarkNoShow, isPaymentInvalid } from "@/lib/staff-booking-data";
import { STAFF_ASSETS } from "@/lib/staff-assets";

const ACTION_ICONS = {
  confirmBooking: STAFF_ASSETS.action.checkIn,
  checkInBooking: STAFF_ASSETS.action.checkIn,
  startWashing: STAFF_ASSETS.action.startWash,
  completeBooking: STAFF_ASSETS.action.completeService,
};

/**
 * Cụm nút thao tác cho một booking, render đúng theo status/payment thật:
 *   PENDING              → Xác nhận · Từ chối
 *   CONFIRMED (PAID)     → Check-in (modal)
 *   Payment PENDING      → Xác nhận thanh toán (thu trực tiếp, POST /payments/{id}/confirm)
 *   Payment hủy/thất bại → "Gửi lại link" disabled (BE chỉ cho khách tạo link, payment
 *                          phải PENDING) + nút check-in disabled "Không thể check-in"
 *   CHECKED_IN           → Bắt đầu rửa
 *   WASHING (PAID)       → Hoàn tất
 *   Quá grace period     → No-show (chỉ CONFIRMED, đúng ràng buộc BE)
 *   Trạng thái đóng      → chỉ "Chi tiết"
 * "Chi tiết" luôn có. Gọi khách hiển thị khi có SĐT thật.
 */
export function StaffBookingActions({
  booking,
  busyId,
  onCheckIn,
  onNextAction,
  onConfirmPayment,
  onReject,
  onNoShow,
  onDetail,
}) {
  const action = getNextStaffAction(booking);
  const busy = String(busyId) === String(booking.id);
  const hasPhone = booking.phone && booking.phone !== "Chưa cập nhật";
  const paymentPending =
    booking.paymentStatus === "PENDING" &&
    booking.paymentId &&
    ["PENDING", "CONFIRMED"].includes(booking.bookingStatus);
  const paymentInvalid = isPaymentInvalid(booking);

  // Nút bước kế tiếp: check-in bị chặn thanh toán → label rõ "Không thể check-in".
  const nextDisabled = action && !action.enabled;
  const nextLabel =
    nextDisabled && action.api === "checkInBooking" ? "Không thể check-in" : action?.label;
  const nextHint = nextDisabled ? "Chờ thanh toán" : null;

  return (
    <div className="flex flex-wrap items-center justify-end gap-1.5">
      {hasPhone && (
        <a
          href={`tel:${booking.phone}`}
          aria-label={`Gọi ${booking.customerName}`}
          title={`Gọi ${booking.phone}`}
          className="inline-grid h-8 w-8 place-items-center rounded-lg border border-border hover:bg-primary-container"
        >
          <img src={STAFF_ASSETS.action.phone} alt="" width={18} height={18} className="rounded" />
        </a>
      )}

      {paymentPending && (
        <Button
          size="sm"
          variant="outline"
          disabled={busy}
          onClick={() => onConfirmPayment?.(booking)}
          title="Xác nhận khách đã thanh toán (thu trực tiếp)"
        >
          <img src={STAFF_ASSETS.action.paymentReminder} alt="" width={16} height={16} className="rounded" />
          Xác nhận thanh toán
        </Button>
      )}

      {paymentInvalid && (
        // Chưa nối được: BE chỉ cho phép khách hàng tự tạo link khi payment còn PENDING.
        <span className="inline-flex flex-col items-end">
          <Button size="sm" variant="outline" disabled title="Tính năng đang được hoàn thiện">
            <img src={STAFF_ASSETS.action.paymentReminder} alt="" width={16} height={16} className="rounded" />
            Gửi lại link
          </Button>
          <span className="mt-0.5 text-xs font-medium text-muted-foreground">Link thanh toán</span>
        </span>
      )}

      {action && (
        <span className="inline-flex flex-col items-end">
          <Button
            size="sm"
            disabled={nextDisabled || busy}
            onClick={() =>
              action.api === "checkInBooking" ? onCheckIn?.(booking) : onNextAction?.(booking, action)
            }
          >
            {ACTION_ICONS[action.api] && (
              <img src={ACTION_ICONS[action.api]} alt="" width={16} height={16} className="rounded" />
            )}
            {busy ? "..." : nextLabel}
          </Button>
          {nextHint && (
            <span className="mt-0.5 text-xs font-semibold text-warning">{nextHint}</span>
          )}
        </span>
      )}

      {booking.bookingStatus === "PENDING" && (
        <Button size="sm" variant="destructive" disabled={busy} onClick={() => onReject?.(booking)}>
          Từ chối
        </Button>
      )}

      {canMarkNoShow(booking) && (
        <Button size="sm" variant="destructive" disabled={busy} onClick={() => onNoShow?.(booking)}>
          No-show
        </Button>
      )}

      <Button size="sm" variant="outline" onClick={() => onDetail?.(booking)}>
        Chi tiết
      </Button>
    </div>
  );
}
