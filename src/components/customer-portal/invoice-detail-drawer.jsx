import { useEffect } from "react";
import { Link } from "react-router-dom";
import { CalendarClock, Car, CreditCard, Droplets, FileText, MapPin, Receipt, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  formatBookingDate,
  formatMoney,
  invoiceStatusLabels,
  paymentMethodLabels,
} from "@/lib/customer-booking-data";
import { invoiceCodeOf } from "@/lib/customer-payment-data";

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
 * Drawer chi tiết hóa đơn. Dữ liệu từ booking đã chuẩn hoá (payment + invoice) — không gọi thêm API.
 * Tải/in hóa đơn nằm ở trang hóa đơn đầy đủ (không có file PDF từ hệ thống nên không dựng nút tải giả ở đây).
 * Props: booking (null = đóng), onClose.
 */
export function InvoiceDetailDrawer({ booking, onClose }) {
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

  const invoiceCode = invoiceCodeOf(booking);
  const invoiceStatus = booking.invoice?.status || booking.invoice?.invoiceStatus || "";
  const method = booking.payment?.method ? paymentMethodLabels[booking.payment.method] || booking.payment.method : "";
  const paidAt = booking.payment?.paidAt || booking.payment?.paymentDate || "";
  const issuedAt = booking.invoice?.issuedAt || "";

  return (
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label="Chi tiết hóa đơn">
      <button type="button" aria-label="Đóng" onClick={onClose} className="wm-drawer-backdrop absolute inset-0 bg-foreground/40" />
      <aside className="wm-drawer-panel absolute inset-y-0 right-0 flex w-[min(30rem,100vw)] flex-col bg-card shadow-floating">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-border p-5">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-muted-foreground">
              {invoiceCode ? "Mã hóa đơn" : "Mã lịch đặt"}
            </p>
            <h2 className="truncate text-lg font-extrabold">{invoiceCode || booking.code}</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              <StatusBadge status={booking.bookingStatus} />
              {booking.paymentStatus && <StatusBadge status={booking.paymentStatus} type="payment" />}
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
          <h3 className="text-sm font-extrabold text-muted-foreground">Thông tin hóa đơn</h3>
          <dl className="mt-3 grid gap-4">
            <Row icon={Receipt} label="Mã hóa đơn" value={invoiceCode || "Chưa có mã hóa đơn"} />
            <Row icon={FileText} label="Mã lịch đặt" value={booking.code} />
            <Row icon={CalendarClock} label="Ngày phát hành" value={issuedAt ? formatBookingDate(issuedAt) : ""} />
            <Row
              icon={FileText}
              label="Trạng thái hóa đơn"
              value={invoiceStatus ? invoiceStatusLabels[invoiceStatus] || invoiceStatus : ""}
            />
          </dl>

          <h3 className="mt-6 text-sm font-extrabold text-muted-foreground">Thông tin dịch vụ</h3>
          <dl className="mt-3 grid gap-4">
            <Row icon={Droplets} label="Dịch vụ" value={booking.serviceName} />
            <Row icon={MapPin} label="Chi nhánh" value={booking.garageName} />
            <Row
              icon={CalendarClock}
              label="Thời gian"
              value={`${formatBookingDate(booking.bookingDate)}${booking.slotTime ? ` · ${booking.slotTime}` : ""}`}
            />
            <Row icon={Car} label="Xe / Biển số" value={`${booking.vehicle} · ${booking.plate}`} />
          </dl>

          <h3 className="mt-6 text-sm font-extrabold text-muted-foreground">Chi tiết thanh toán</h3>
          <div className="mt-3 rounded-2xl bg-surface p-4">
            <div className="flex items-center justify-between py-1 text-sm">
              <span className="text-muted-foreground">Tạm tính</span>
              <span className="font-semibold">{formatMoney(booking.amount)}</span>
            </div>
            {booking.discount > 0 && (
              <div className="flex items-center justify-between py-1 text-sm">
                <span className="text-muted-foreground">Giảm giá</span>
                <span className="font-semibold text-success">-{formatMoney(booking.discount)}</span>
              </div>
            )}
            <div className="mt-1 flex items-center justify-between border-t border-border pt-2">
              <span className="font-bold">Tổng thanh toán</span>
              <strong className="text-xl text-primary">{formatMoney(booking.finalAmount)}</strong>
            </div>
          </div>
          <dl className="mt-3 grid grid-cols-2 gap-4">
            <Row icon={CreditCard} label="Phương thức" value={method} />
            <Row icon={CalendarClock} label="Thời gian thanh toán" value={paidAt ? formatBookingDate(paidAt) : ""} />
          </dl>
        </div>

        {/* Footer */}
        <div className="flex flex-col gap-2 border-t border-border p-5">
          {invoiceCode || booking.paymentStatus === "PAID" ? (
            <Button size="lg" className="w-full shadow-cta" render={<Link to={`/khach-hang/thanh-toan/${booking.id}/hoa-don`} />}>
              <Receipt size={18} /> Xem hóa đơn đầy đủ
            </Button>
          ) : null}
          <Button variant="outline" size="lg" className="w-full" render={<Link to={`/khach-hang/lich-dat/${booking.id}`} />}>
            Xem lịch đặt liên quan
          </Button>
        </div>
      </aside>
    </div>
  );
}

export default InvoiceDetailDrawer;
