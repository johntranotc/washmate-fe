import { CreditCard } from "lucide-react";
import { Link } from "react-router-dom";
import { StatusBadge } from "./BookingStatusBadge";

export function PaymentStatusCard({ booking }) {
  const status = booking.paymentStatus || "PENDING";
  const paymentPath = `/khach-hang/thanh-toan/${booking.id}`;
  const invoicePath = `/khach-hang/thanh-toan/${booking.id}/hoa-don`;
  const action =
    status === "PAID"
      ? { label: "Xem hóa đơn", path: invoicePath }
      : ["FAILED", "CANCELLED"].includes(status)
        ? { label: "Thử thanh toán lại", path: paymentPath }
        : { label: "Tiếp tục thanh toán", path: paymentPath };

  return (
    <aside className="rounded-3xl border border-[var(--border-soft)] bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <span className="grid size-12 place-items-center rounded-2xl bg-[var(--brand-blue)]/10 text-[var(--brand-blue)]"><CreditCard /></span>
        <StatusBadge status={status} type="payment" />
      </div>
      <h2 className="mt-5 text-lg font-extrabold">Trạng thái thanh toán</h2>
      <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
        {status === "PAID"
          ? "Thanh toán đã hoàn tất và lịch đặt đã được xác nhận."
          : status === "FAILED"
            ? "Giao dịch chưa thành công. Bạn có thể thử lại."
            : status === "CANCELLED"
              ? "Thanh toán đã bị hủy. Lịch vẫn đang chờ thanh toán."
              : "Hoàn tất thanh toán để xác nhận lịch đặt."}
      </p>
      <Link to={action.path} className="mt-6 block rounded-2xl bg-[var(--brand-blue)] px-4 py-3 text-center text-sm font-bold text-white">
        {action.label}
      </Link>
    </aside>
  );
}
