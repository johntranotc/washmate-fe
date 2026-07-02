import { Clock, CreditCard, XCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { StatusBadge } from "./BookingStatusBadge";

export function PaymentStatusCard({ booking }) {
  const bookingStatus = booking.bookingStatus;
  const status = booking.paymentStatus || "PENDING";
  const paymentPath = `/khach-hang/thanh-toan/${booking.id}`;
  const invoicePath = `/khach-hang/thanh-toan/${booking.id}/hoa-don`;

  if (bookingStatus === "PENDING") {
    return (
      <aside className="rounded-2xl border border-orange-200 bg-orange-50 p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <span className="grid size-12 place-items-center rounded-2xl bg-orange-100 text-orange-600"><Clock size={22} /></span>
        </div>
        <h2 className="mt-5 text-lg font-extrabold text-orange-800">Chờ gara xác nhận</h2>
        <p className="mt-2 text-sm leading-6 text-orange-700">
          Lịch đặt đang chờ gara xác nhận. Bạn chỉ có thể thanh toán sau khi gara xác nhận lịch.
        </p>
        <div className="mt-4 rounded-2xl border border-orange-200 bg-white px-4 py-3 text-xs text-orange-700 font-semibold">
          Vui lòng chờ gara xác nhận trước khi thanh toán.
        </div>
      </aside>
    );
  }

  if (bookingStatus === "REJECTED") {
    return (
      <aside className="rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <span className="grid size-12 place-items-center rounded-2xl bg-red-100 text-red-600"><XCircle size={22} /></span>
        </div>
        <h2 className="mt-5 text-lg font-extrabold text-red-800">Gara từ chối lịch đặt</h2>
        <p className="mt-2 text-sm leading-6 text-red-700">
          Gara không thể nhận lịch này. Vui lòng đặt lịch mới hoặc chọn gara khác.
        </p>
        <Link to="/khach-hang/dat-lich-moi" className="mt-6 block rounded-2xl bg-red-600 px-4 py-3 text-center text-sm font-bold text-white">
          Đặt lịch mới
        </Link>
      </aside>
    );
  }

  const action =
    status === "PAID"
      ? { label: "Xem hóa đơn", path: invoicePath }
      : ["FAILED", "CANCELLED"].includes(status)
        ? { label: "Thử thanh toán lại", path: paymentPath }
        : { label: "Tiếp tục thanh toán", path: paymentPath };

  return (
    <aside className="rounded-2xl border border-[var(--border-soft)] bg-white p-6 shadow-sm">
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
              : "Gara đã xác nhận lịch. Hoàn tất thanh toán để giữ khung giờ."}
      </p>
      <Link to={action.path} className="mt-6 block rounded-2xl bg-[var(--brand-blue)] px-4 py-3 text-center text-sm font-bold text-white">
        {action.label}
      </Link>
    </aside>
  );
}
