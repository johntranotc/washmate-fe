import { useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/shared/StatusBadge";
import { staffApi } from "@/api/staffApi";
import { toast } from "@/components/ui/toast";
import { formatTime } from "@/lib/format";
import { STAFF_ASSETS } from "@/lib/staff-assets";

/**
 * Modal "Xác nhận check-in" — toàn bộ dữ liệu từ booking thật.
 * BE chỉ yêu cầu status = CONFIRMED để check-in (KHÔNG cần đã thanh toán) —
 * khách trả tiền mặt sau khi rửa, thanh toán chỉ bắt buộc ở bước Hoàn tất.
 * Submit gọi POST /bookings/{id}/check-in rồi báo onDone để refetch.
 */
export function StaffCheckInModal({ booking, open, onOpenChange, onDone }) {
  const [submitting, setSubmitting] = useState(false);

  if (!booking) return null;

  const paid = booking.paymentStatus === "PAID";
  const confirmed = booking.bookingStatus === "CONFIRMED";
  const canConfirm = confirmed && !submitting;

  const rows = [
    ["Mã booking", booking.code],
    ["Khách hàng", booking.customerName],
    ["Số điện thoại", booking.phone],
    ["Biển số", booking.plate],
    ["Gói dịch vụ", booking.serviceName],
    ["Garage", booking.garageName],
    ["Giờ hẹn", formatTime(booking.slotTime) || "--:--"],
  ];

  async function handleConfirm() {
    if (!canConfirm) return;
    setSubmitting(true);
    try {
      await staffApi.checkInBooking(booking.id);
      toast.success("Check-in thành công", { description: `${booking.code} · ${booking.plate}` });
      onOpenChange(false);
      onDone?.();
    } catch (e) {
      toast.error("Check-in thất bại", { description: e?.message || "Lỗi không xác định" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={(next) => { if (!submitting) onOpenChange(next); }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <img src={STAFF_ASSETS.action.checkIn} alt="" width={40} height={40} className="rounded-xl" />
            <div>
              <AlertDialogTitle>Xác nhận check-in</AlertDialogTitle>
              <AlertDialogDescription>
                Kiểm tra thông tin khách và xe trước khi tiếp nhận.
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>

        <dl className="mt-4 space-y-2 rounded-xl border border-border bg-surface p-4">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-baseline justify-between gap-4 text-sm">
              <dt className="shrink-0 text-muted-foreground">{label}</dt>
              <dd className="text-right font-bold text-foreground">{value || "—"}</dd>
            </div>
          ))}
          <div className="flex items-center justify-between gap-4 text-sm">
            <dt className="text-muted-foreground">Thanh toán</dt>
            <dd><StatusBadge status={booking.paymentStatus} type="payment" size="sm" /></dd>
          </div>
        </dl>

        {!paid && confirmed && (
          <p className="mt-3 text-xs text-muted-foreground">
            Khách chưa thanh toán — vẫn check-in được, sẽ thu tiền khi hoàn tất dịch vụ.
          </p>
        )}
        {!confirmed && (
          <p className="mt-3 text-xs font-semibold text-warning">
            Chỉ check-in được booking ở trạng thái "Đã xác nhận".
          </p>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={submitting}>Hủy</AlertDialogCancel>
          <Button size="lg" disabled={!canConfirm} onClick={handleConfirm}>
            {submitting ? "Đang check-in..." : "Xác nhận check-in"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
