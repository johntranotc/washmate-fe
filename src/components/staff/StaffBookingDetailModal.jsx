import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import StatusBadge from "@/components/shared/StatusBadge";
import { actionConditionOf, urgentShortLabels } from "@/lib/staff-booking-data";
import { formatDate, formatTime, formatMoney } from "@/lib/format";

const PAYMENT_METHOD_LABELS = {
  CASH: "Tiền mặt",
  VNPAY: "VNPay",
  MOMO: "MoMo",
  BANK_TRANSFER: "Chuyển khoản",
  CARD: "Thẻ",
};

/**
 * Modal "Chi tiết booking" — hiển thị read-only từ dữ liệu booking thật đã fetch.
 * `inScope` (tùy chọn): booking có thuộc garage staff phụ trách không — tính từ
 * garageIds thật của tài khoản; không truyền thì ẩn dòng phạm vi.
 * BE chưa có API lịch sử thao tác và không expose nhân viên phụ trách/khoang
 * trong BookingResponse → các phần đó để ghi chú rõ, không fake log.
 */
export function StaffBookingDetailModal({ booking, open, onOpenChange, inScope }) {
  if (!booking) return null;

  const urgentLabels = urgentShortLabels(booking);
  const rows = [
    ["Mã booking", booking.code],
    ["Khách hàng", booking.customerName],
    ["Số điện thoại", booking.phone],
    ["Xe", booking.vehicle],
    ["Biển số", booking.plate],
    ["Gói dịch vụ", booking.serviceName],
    ["Garage", booking.garageName],
    ["Ngày hẹn", formatDate(booking.bookingDate)],
    ["Giờ hẹn", formatTime(booking.slotTime) || "--:--"],
    ...(booking.finalAmount > 0 ? [["Số tiền", formatMoney(booking.finalAmount)]] : []),
    ...(booking.paymentMethod
      ? [["Phương thức", PAYMENT_METHOD_LABELS[booking.paymentMethod] || booking.paymentMethod]]
      : []),
    ["Điều kiện thao tác", actionConditionOf(booking)],
    ...(urgentLabels.length ? [["Cần xử lý", urgentLabels.join(" · ")]] : []),
    ...(typeof inScope === "boolean"
      ? [["Phạm vi xử lý", inScope ? "Đúng garage" : "Không thuộc garage được phân công"]]
      : []),
  ];

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-h-[85vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle>Chi tiết booking</AlertDialogTitle>
          <AlertDialogDescription>{booking.code}</AlertDialogDescription>
        </AlertDialogHeader>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <StatusBadge status={booking.bookingStatus} type="booking" size="md" />
          <StatusBadge status={booking.paymentStatus} type="payment" size="md" />
        </div>

        <dl className="mt-4 space-y-2 rounded-xl border border-border bg-surface p-4">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-baseline justify-between gap-4 text-sm">
              <dt className="shrink-0 text-muted-foreground">{label}</dt>
              <dd className="text-right font-bold text-foreground">{value || "—"}</dd>
            </div>
          ))}
        </dl>

        {booking.note && (
          <div className="mt-3 rounded-xl border border-border bg-surface p-4">
            <p className="text-xs font-bold text-foreground">Ghi chú</p>
            <p className="mt-1 text-sm text-muted-foreground">{booking.note}</p>
          </div>
        )}

        {booking.rejectionReason && (
          <div className="mt-3 rounded-xl border border-critical/25 bg-critical-container p-4">
            <p className="text-xs font-bold text-critical">Lý do từ chối</p>
            <p className="mt-1 text-sm text-critical">{booking.rejectionReason}</p>
          </div>
        )}

        {/* BE chưa có API lịch sử thao tác — để trống rõ ràng, không fake log */}
        <div className="mt-3 rounded-xl border border-dashed border-border p-4">
          <p className="text-xs font-bold text-foreground">Lịch sử thao tác</p>
          <p className="mt-1 text-xs text-neutral-muted">Tính năng đang được hoàn thiện.</p>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Đóng</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
