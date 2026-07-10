import { useEffect } from "react";
import { CalendarClock, Car, Droplets, MapPin, ShieldCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatBookingDate, formatMoney, paymentMethodLabels } from "@/lib/customer-booking-data";

function Line({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-2.5 text-sm">
      <Icon size={15} className="shrink-0 text-muted-foreground" />
      <span className="text-muted-foreground">{label}</span>
      <span className="ml-auto truncate font-semibold">{value}</span>
    </div>
  );
}

/**
 * Modal xác nhận trước khi sang cổng thanh toán THẬT (/khach-hang/thanh-toan/:id).
 * Không tự set trạng thái đã thanh toán — chỉ điều hướng, cổng thật xử lý.
 * Props: booking (null = đóng), onClose, onContinue.
 */
export function PaymentConfirmDialog({ booking, onClose, onContinue }) {
  const open = Boolean(booking);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const method = booking.payment?.method ? paymentMethodLabels[booking.payment.method] || booking.payment.method : "";
  const retry = booking.paymentStatus === "FAILED";

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <button type="button" aria-label="Đóng" onClick={onClose} className="wm-drawer-backdrop absolute inset-0 bg-foreground/40" />
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-floating" role="dialog" aria-modal="true" aria-label="Xác nhận thanh toán">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
              <ShieldCheck size={20} />
            </span>
            <div>
              <h2 className="text-lg font-extrabold">Xác nhận thanh toán</h2>
              <p className="text-xs text-muted-foreground">Kiểm tra thông tin trước khi tiếp tục.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="grid size-9 place-items-center rounded-xl border border-border text-muted-foreground transition hover:bg-surface"
          >
            <X size={18} />
          </button>
        </div>

        <div className="rounded-2xl border border-border p-4">
          <div className="flex flex-wrap items-center gap-2">
            <strong className="text-base">{booking.serviceName}</strong>
            <StatusBadge status={booking.bookingStatus} size="sm" />
            {booking.paymentStatus && <StatusBadge status={booking.paymentStatus} type="payment" size="sm" />}
          </div>
          <div className="mt-3 grid gap-2">
            <Line icon={Car} label="Xe" value={`${booking.vehicle} · ${booking.plate}`} />
            <Line icon={MapPin} label="Chi nhánh" value={booking.garageName} />
            <Line
              icon={CalendarClock}
              label="Thời gian"
              value={`${formatBookingDate(booking.bookingDate)}${booking.slotTime ? ` · ${booking.slotTime}` : ""}`}
            />
            {method && <Line icon={Droplets} label="Phương thức" value={method} />}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between rounded-2xl bg-surface p-4">
          <span className="font-bold">Số tiền cần thanh toán</span>
          <strong className="text-xl text-primary">{formatMoney(booking.finalAmount)}</strong>
        </div>

        <div className="mt-5 flex gap-3">
          <Button variant="outline" size="lg" className="flex-1" onClick={onClose}>
            Để sau
          </Button>
          <Button size="lg" className="flex-1 shadow-cta" onClick={() => onContinue(booking)}>
            {retry ? "Thanh toán lại" : "Tiếp tục thanh toán"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default PaymentConfirmDialog;
