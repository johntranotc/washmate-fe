import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  CalendarClock,
  Car,
  CreditCard,
  Droplets,
  MapPin,
  NotebookText,
  Receipt,
  RotateCcw,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatBookingDate, formatMoney, paymentMethodLabels } from "@/lib/customer-booking-data";
import { deriveBookingActions } from "@/lib/customer-booking-status";

const EMPTY = "—";

function Row({ icon: Icon, label, value }) {
  return (
    <div className="flex gap-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
        <Icon size={16} />
      </span>
      <div className="min-w-0">
        <dt className="text-xs font-semibold text-muted-foreground">{label}</dt>
        <dd className="mt-0.5 font-bold break-words">{value || EMPTY}</dd>
      </div>
    </div>
  );
}

/**
 * Drawer xem nhanh một booking. Dữ liệu lấy từ chính booking đã chuẩn hoá (getMyBookings),
 * không gọi thêm API. Thông tin sâu (timeline, hóa đơn) mở ở trang chi tiết đầy đủ.
 * Props: booking (null = đóng), onClose.
 */
export function BookingQuickView({ booking, onClose }) {
  const open = Boolean(booking);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  const actions = deriveBookingActions(booking);
  const methodLabel = booking.payment?.method
    ? paymentMethodLabels[booking.payment.method] || booking.payment.method
    : "";

  return (
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label="Chi tiết nhanh lịch đặt">
      <button
        type="button"
        aria-label="Đóng"
        onClick={onClose}
        className="wm-drawer-backdrop absolute inset-0 bg-foreground/40"
      />
      <aside className="wm-drawer-panel absolute inset-y-0 right-0 flex w-[min(30rem,100vw)] flex-col bg-card shadow-floating">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-border p-5">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-muted-foreground">Mã lịch đặt</p>
            <h2 className="truncate text-lg font-extrabold">{booking.code}</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              <StatusBadge status={booking.bookingStatus} />
              {booking.paymentStatus && (
                <StatusBadge status={booking.paymentStatus} type="payment" />
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="grid size-9 shrink-0 place-items-center rounded-xl border border-border text-muted-foreground transition hover:bg-surface"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          <dl className="grid gap-4">
            <Row icon={Droplets} label="Dịch vụ" value={booking.serviceName} />
            <Row icon={Car} label="Xe / Biển số" value={`${booking.vehicle} · ${booking.plate}`} />
            <Row icon={MapPin} label="Chi nhánh" value={booking.garageName} />
            <Row icon={MapPin} label="Địa chỉ" value={booking.garageAddress} />
            <Row
              icon={CalendarClock}
              label="Thời gian"
              value={`${formatBookingDate(booking.bookingDate)}${
                booking.slotTime ? ` · ${booking.slotTime}` : ""
              }${booking.endTime ? ` - ${booking.endTime}` : ""}`}
            />
            <Row icon={CreditCard} label="Phương thức thanh toán" value={methodLabel} />
            <Row icon={NotebookText} label="Ghi chú" value={booking.note} />
          </dl>

          {/* Tổng tiền */}
          <div className="mt-5 rounded-2xl bg-surface p-4">
            {booking.discount > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Giảm giá</span>
                <span className="font-semibold text-success">-{formatMoney(booking.discount)}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="font-bold">Tổng thanh toán</span>
              <strong className="text-xl text-primary">{formatMoney(booking.finalAmount)}</strong>
            </div>
          </div>

          {actions.awaitingConfirm && (
            <p className="mt-4 rounded-xl bg-warning-container px-3 py-2 text-xs font-semibold text-warning">
              Vui lòng chờ gara xác nhận trước khi thanh toán.
            </p>
          )}
          {actions.rejected && (
            <p className="mt-4 rounded-xl bg-critical-container px-3 py-2 text-xs font-semibold text-critical">
              Gara đã từ chối lịch này.
            </p>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex flex-col gap-2 border-t border-border p-5">
          {actions.pay && (
            <Button size="lg" className="w-full shadow-cta" render={<Link to={`/khach-hang/thanh-toan/${booking.id}`} />}>
              <CreditCard size={18} /> Thanh toán ngay
            </Button>
          )}
          {actions.invoice && (
            <Button
              variant="outline"
              size="lg"
              className="w-full"
              render={<Link to={`/khach-hang/thanh-toan/${booking.id}/hoa-don`} />}
            >
              <Receipt size={18} /> Xem hóa đơn
            </Button>
          )}
          {actions.rebook && (
            <Button variant="outline" size="lg" className="w-full" render={<Link to="/khach-hang/dat-lich-moi" />}>
              <RotateCcw size={18} /> Đặt lại
            </Button>
          )}
          <Button
            variant="ghost"
            size="lg"
            className="w-full"
            render={<Link to={`/khach-hang/lich-dat/${booking.id}`} />}
          >
            Xem chi tiết đầy đủ
          </Button>
        </div>
      </aside>
    </div>
  );
}

export default BookingQuickView;
