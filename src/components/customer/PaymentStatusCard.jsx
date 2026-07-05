import { Clock, CreditCard, XCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";

export function PaymentStatusCard({ booking }) {
  const bookingStatus = booking.bookingStatus;
  const status = booking.paymentStatus || "PENDING";
  const paymentPath = `/khach-hang/thanh-toan/${booking.id}`;
  const invoicePath = `/khach-hang/thanh-toan/${booking.id}/hoa-don`;

  if (bookingStatus === "PENDING") {
    return (
      <aside className="rounded-2xl border border-warning/30 bg-warning-container p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <span className="grid size-12 place-items-center rounded-2xl bg-warning-container text-warning"><Clock size={20} /></span>
        </div>
        <h2 className="mt-5 text-lg font-extrabold text-warning">Chờ gara xác nhận</h2>
        <p className="mt-2 text-sm leading-6 text-warning">
          Lịch đặt đang chờ gara xác nhận. Bạn chỉ có thể thanh toán sau khi gara xác nhận lịch.
        </p>
        <div className="mt-4 rounded-2xl border border-warning/30 bg-card px-4 py-3 text-xs text-warning font-semibold">
          Vui lòng chờ gara xác nhận trước khi thanh toán.
        </div>
      </aside>
    );
  }

  if (bookingStatus === "REJECTED") {
    return (
      <aside className="rounded-2xl border border-critical/25 bg-critical-container p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <span className="grid size-12 place-items-center rounded-2xl bg-critical-container text-critical"><XCircle size={20} /></span>
        </div>
        <h2 className="mt-5 text-lg font-extrabold text-critical">Gara từ chối lịch đặt</h2>
        <p className="mt-2 text-sm leading-6 text-critical">
          Gara không thể nhận lịch này. Vui lòng đặt lịch mới hoặc chọn gara khác.
        </p>
        <Button size="lg" className="mt-6 w-full bg-critical text-white hover:bg-critical/90" render={<Link to="/khach-hang/dat-lich-moi" />}>
          Đặt lịch mới
        </Button>
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
    <aside className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <span className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary"><CreditCard /></span>
        <StatusBadge status={status} type="payment" />
      </div>
      <h2 className="mt-5 text-lg font-extrabold">Trạng thái thanh toán</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {status === "PAID"
          ? "Thanh toán đã hoàn tất và lịch đặt đã được xác nhận."
          : status === "FAILED"
            ? "Giao dịch chưa thành công. Bạn có thể thử lại."
            : status === "CANCELLED"
              ? "Thanh toán đã bị hủy. Lịch vẫn đang chờ thanh toán."
              : "Gara đã xác nhận lịch. Hoàn tất thanh toán để giữ khung giờ."}
      </p>
      <Button size="lg" className="mt-6 w-full" render={<Link to={action.path} />}>
        {action.label}
      </Button>
    </aside>
  );
}
