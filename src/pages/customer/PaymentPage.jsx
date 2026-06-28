import { CheckCircle2, CreditCard, Landmark, Smartphone, Wallet, XCircle } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { bookingApi } from "@/api/bookingApi";
import { paymentApi } from "@/api/paymentApi";
import { useAppStore } from "@/state/AppStore";
import { StatusBadge } from "@/components/customer/BookingStatusBadge";
import {
  formatBookingDate,
  formatMoney,
  normalizeBooking,
  normalizePayment,
  paymentMethodLabels,
} from "@/lib/customer-booking-data";
import { cn } from "@/lib/utils";

const methods = [
  ["CASH", "Tiền mặt tại gara", Wallet],
  ["BANK_TRANSFER", "Chuyển khoản", Landmark],
  ["DOMESTIC_CARD", "Thẻ nội địa", CreditCard],
  ["E_WALLET", "Ví điện tử", Smartphone],
];

export default function PaymentPage() {
  const { bookingId, paymentId } = useParams();
  const { state, actions } = useAppStore();
  const [booking, setBooking] = useState(null);
  const [payment, setPayment] = useState(null);
  const [method, setMethod] = useState("DOMESTIC_CARD");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  

  const loadPayment = useCallback(async () => {
    setLoading(true);
    setError("");
    const local = state.bookings.find(
      (item) =>
        String(item.id) === String(bookingId || paymentId) ||
        String(item.paymentId) === String(paymentId),
    );
    try {
      let paymentData;
      let resolvedBookingId = bookingId;
      if (paymentId) {
        paymentData = normalizePayment(await paymentApi.getById(paymentId));
        resolvedBookingId = paymentData.bookingId || local?.id;
      } else {
        paymentData = normalizePayment(await paymentApi.getPaymentByBookingId(bookingId));
      }
      const bookingData = normalizeBooking(await bookingApi.getBookingById(resolvedBookingId));
      setBooking(normalizeBooking({ ...bookingData, payment: paymentData, paymentStatus: paymentData.status }));
      setPayment(paymentData);
      setMethod(paymentData.method || "DOMESTIC_CARD");
      
    } catch {
      if (!local) {
        setError("Không thể tải thông tin thanh toán.");
        setBooking(null);
      } else {
        setError("Đã xảy ra lỗi khi kết nối API thanh toán.");
        setBooking(null);
      }
    } finally {
      setLoading(false);
    }
  }, [bookingId, paymentId, state.bookings]);

  useEffect(() => {
    loadPayment();
  }, [loadPayment]);

  async function confirmPayment() {
    if (!booking) return;
    setProcessing(true);
    setError("");
    try {
      if (!payment?.id) throw new Error("PAYMENT_API_NOT_READY");
      const response = await paymentApi.confirmPayment(payment.id, { paymentMethod: method });
      const paidPayment = normalizePayment(response);
      if (paidPayment.status !== "PAID") throw new Error("PAYMENT_NOT_PAID");
      if (state.bookings.some((item) => String(item.id) === String(booking.id))) {
        actions.payBooking(booking.id, method);
      }
      setPayment(paidPayment);
      setBooking(normalizeBooking({ ...booking, payment: paidPayment, paymentStatus: "PAID", bookingStatus: "CONFIRMED" }));
    } catch {
      setError("Thanh toán thất bại. Vui lòng thử lại.");
      setProcessing(false);
    }
  }

  if (loading) return <div className="rounded-3xl bg-white p-12 text-center text-[var(--text-muted)]">Đang tải thông tin thanh toán...</div>;
  if (!booking) return <div className="rounded-3xl border border-red-200 bg-red-50 p-10 text-center"><XCircle className="mx-auto text-red-500" /><h1 className="mt-4 text-xl font-extrabold text-red-700">Không thể tải dữ liệu lịch đặt</h1><p className="mt-2 text-sm text-red-600">{error}</p><button onClick={loadPayment} className="mt-5 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white">Thử lại</button></div>;

  const paid = payment?.status === "PAID";
  const isMock = booking?.isMock || payment?.isMock;
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header className="text-center"><p className="text-sm font-extrabold uppercase tracking-[0.16em] text-[var(--brand-blue)]">Thanh toán an toàn</p><h1 className="mt-2 text-3xl font-extrabold">Thanh toán lịch đặt</h1><p className="mt-2 text-sm text-[var(--text-muted)]">Thanh toán thành công sẽ xác nhận lịch và tạo hóa đơn.</p></header>
      {isMock && <div className="rounded-2xl border border-blue-200 bg-blue-50 px-5 py-4 text-sm text-blue-700"><strong>Dữ liệu mẫu.</strong> Dữ liệu này dùng để demo giao diện. API thật sẽ được kết nối sau.</div>}
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <section className="rounded-3xl border border-[var(--border-soft)] bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between"><h2 className="text-xl font-extrabold">Phương thức thanh toán</h2><StatusBadge status={payment?.status || "PENDING"} type="payment" /></div>
          {payment?.status === "FAILED" && <p className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">Thanh toán thất bại. Vui lòng thử lại.</p>}
          {payment?.status === "CANCELLED" && <p className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-700">Thanh toán đã bị hủy. Bạn có thể chọn phương thức và thử lại.</p>}
          {!paid && <div className="mt-6 grid gap-3 sm:grid-cols-2">{methods.map(([value, label, Icon]) => <button key={value} onClick={() => setMethod(value)} className={cn("rounded-2xl border-2 p-5 text-left transition", method === value ? "border-[var(--brand-blue)] bg-blue-50 text-[var(--brand-blue)]" : "border-[var(--border-soft)]")}><Icon size={22} /><strong className="mt-3 block text-sm">{label}</strong></button>)}</div>}
          {!paid ? <button onClick={confirmPayment} disabled={processing} className="mt-6 w-full rounded-2xl bg-[var(--brand-blue)] py-3.5 font-bold text-white disabled:opacity-60">{processing ? "Đang xử lý thanh toán..." : "Xác nhận thanh toán"}</button> : <div className="mt-6 rounded-3xl border border-emerald-200 bg-emerald-50 p-6 text-emerald-700"><p className="flex items-center gap-2 text-lg font-extrabold"><CheckCircle2 /> Thanh toán thành công</p><p className="mt-2 text-sm">Lịch đặt đã được xác nhận. Phương thức: {paymentMethodLabels[payment.method] || payment.method}</p><p className="mt-1 text-sm">Mã giao dịch: {payment.transactionCode || "Đang cập nhật"}</p></div>}
          {error && <p className="mt-4 rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-700">Thanh toán thất bại. Vui lòng thử lại.</p>}
        </section>
        <aside className="rounded-3xl border border-[var(--border-soft)] bg-white p-6 shadow-sm">
          <h2 className="text-xl font-extrabold">Tóm tắt thanh toán</h2>
          <dl className="mt-5 space-y-4 text-sm">
            {[["Mã booking", booking.code],["Dịch vụ", booking.serviceName],["Gara", booking.garageName],["Xe", `${booking.vehicle} · ${booking.plate}`],["Ngày giờ", `${formatBookingDate(booking.bookingDate)} · ${booking.slotTime}`]].map(([label, value]) => <div key={label}><dt className="text-xs text-[var(--text-muted)]">{label}</dt><dd className="mt-1 font-bold">{value}</dd></div>)}
          </dl>
          <div className="mt-6 space-y-3 border-t border-[var(--border-soft)] pt-5 text-sm"><div className="flex justify-between"><span>Giá dịch vụ</span><strong>{formatMoney(booking.amount)}</strong></div><div className="flex justify-between"><span>Giảm giá</span><strong>-{formatMoney(booking.discount)}</strong></div><div className="flex justify-between text-lg"><span className="font-bold">Tổng cần thanh toán</span><strong className="text-[var(--brand-blue)]">{formatMoney(booking.finalAmount)}</strong></div></div>
        </aside>
      </div>
      {paid && <div className="flex flex-wrap justify-center gap-3"><Link to={`/customer/bookings/${booking.id}`} className="rounded-2xl border border-[var(--border-soft)] bg-white px-5 py-3 text-sm font-bold">Xem chi tiết lịch đặt</Link><Link to={`/customer/bookings/${booking.id}/invoice`} className="rounded-2xl bg-[var(--brand-blue)] px-5 py-3 text-sm font-bold text-white">Xem hóa đơn</Link><Link to="/customer/dashboard" className="rounded-2xl border border-[var(--border-soft)] bg-white px-5 py-3 text-sm font-bold">Về trang khách hàng</Link></div>}
    </div>
  );
}
