import { Download, Droplets, Printer } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { bookingApi } from "@/api/bookingApi";
import { invoiceApi } from "@/api/invoiceApi";
import { paymentApi } from "@/api/paymentApi";
import { useAppStore } from "@/state/AppStore";
import {
  formatBookingDate,
  formatMoney,
  invoiceStatusLabels,
  normalizeBooking,
  normalizeInvoice,
  normalizePayment,
  paymentMethodLabels,
} from "@/lib/customer-booking-data";
import { createDemoInvoice } from "@/lib/invoice-mock-data";
import { createDemoPayment } from "@/lib/payment-mock-data";

export default function InvoicePage() {
  const { bookingId, invoiceId } = useParams();
  const { state } = useAppStore();
  const [booking, setBooking] = useState(null);
  const [payment, setPayment] = useState(null);
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadInvoice = useCallback(async () => {
    setLoading(true);
    setError("");
    const local = state.bookings.find(
      (item) =>
        String(item.id) === String(bookingId || invoiceId) ||
        String(item.invoiceCode) === String(invoiceId),
    );
    try {
      let invoiceById = null;
      if (invoiceId && !bookingId) {
        invoiceById = await invoiceApi.getById(invoiceId);
      }
      const normalizedInvoiceById = invoiceById
        ? normalizeInvoice(invoiceById)
        : null;
      const resolvedBookingId =
        bookingId || normalizedInvoiceById?.bookingId || local?.id;
      if (!resolvedBookingId) throw new Error("BOOKING_NOT_FOUND");
      const [bookingData, paymentData, invoiceData] = await Promise.all([
        bookingApi.getBookingById(resolvedBookingId),
        paymentApi.getPaymentByBookingId(resolvedBookingId),
        normalizedInvoiceById
          ? Promise.resolve(normalizedInvoiceById)
          : invoiceApi.getInvoiceByBookingId(resolvedBookingId),
      ]);
      const normalizedPayment = normalizePayment(paymentData);
      if (normalizedPayment.status !== "PAID") throw new Error("INVOICE_NOT_AVAILABLE");
      setBooking(normalizeBooking({ ...bookingData, payment: normalizedPayment, paymentStatus: "PAID" }));
      setPayment(normalizedPayment);
      setInvoice(normalizeInvoice(invoiceData));
    } catch {
      if (!local || local.paymentStatus !== "PAID") {
        setError("Chưa có hóa đơn.");
        setBooking(null);
      } else {
        const normalizedBooking = normalizeBooking({ ...local, isMock: true });
        const demoPayment = createDemoPayment(normalizedBooking, { status: "PAID", isMock: true });
        setBooking(normalizedBooking);
        setPayment(demoPayment);
        setInvoice(createDemoInvoice(normalizedBooking, demoPayment));
      }
    } finally {
      setLoading(false);
    }
  }, [bookingId, invoiceId, state.bookings]);

  useEffect(() => {
    loadInvoice();
  }, [loadInvoice]);

  function downloadInvoice() {
    const content = [
      "SPARKLEAI / WASHMATE",
      `Mã hóa đơn: ${invoice.code}`,
      `Mã booking: ${booking.code}`,
      `Khách hàng: ${booking.customerName || "Khách hàng WashMate"}`,
      `Dịch vụ: ${booking.serviceName}`,
      `Tổng tiền: ${formatMoney(booking.finalAmount)}`,
      `Trạng thái: ${invoiceStatusLabels[invoice.status]}`,
    ].join("\n");
    const url = URL.createObjectURL(new Blob([content], { type: "text/plain;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${invoice.code || "hoa-don-washmate"}.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  if (loading) return <div className="rounded-3xl bg-white p-12 text-center text-[var(--text-muted)]">Đang tải hóa đơn...</div>;
  if (!booking || !invoice) return <div className="rounded-3xl border border-amber-200 bg-amber-50 p-10 text-center"><h1 className="text-xl font-extrabold text-amber-800">Chưa có hóa đơn</h1><p className="mt-2 text-sm text-amber-700">{error}</p><button onClick={loadInvoice} className="mt-5 rounded-xl bg-amber-600 px-5 py-2.5 text-sm font-bold text-white">Thử lại</button></div>;

  return (
    <div className="mx-auto max-w-4xl">
      <div className="rounded-[2rem] border border-[var(--border-soft)] bg-white p-6 shadow-[var(--shadow-soft)] sm:p-10">
        <header className="flex flex-col gap-5 border-b border-[var(--border-soft)] pb-7 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-3"><span className="grid size-12 place-items-center rounded-2xl bg-[var(--brand-blue)] text-white"><Droplets /></span><div><strong className="text-xl">SparkleAI</strong><p className="text-sm font-bold text-[var(--brand-blue)]">/ WashMate</p></div></div>
          <div className="sm:text-right">{invoice.isMock && <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-extrabold text-[var(--brand-blue)]">Dữ liệu mẫu</span>}<h1 className="mt-3 text-2xl font-extrabold">Hóa đơn thanh toán</h1><p className="mt-1 text-sm text-[var(--text-muted)]">{invoice.code}</p></div>
        </header>
        {invoice.isMock && <p className="mt-5 rounded-2xl bg-blue-50 px-4 py-3 text-sm text-blue-700">Dữ liệu này dùng để demo giao diện. API thật sẽ được kết nối sau.</p>}
        <section className="grid gap-6 py-7 sm:grid-cols-2">
          <div><p className="text-xs font-semibold text-[var(--text-muted)]">Thông tin khách hàng</p><strong className="mt-2 block">{booking.customerName || "Khách hàng WashMate"}</strong><p className="mt-1 text-sm text-[var(--text-muted)]">{booking.vehicle} · {booking.plate}</p></div>
          <div className="sm:text-right"><p className="text-xs font-semibold text-[var(--text-muted)]">Thông tin chứng từ</p><p className="mt-2 font-bold">Booking: {booking.code}</p><p className="mt-1 text-sm text-[var(--text-muted)]">Ngày phát hành: {formatBookingDate(invoice.issuedAt)}</p><span className="mt-2 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">{invoiceStatusLabels[invoice.status]}</span></div>
        </section>
        <section className="rounded-3xl bg-[var(--bg-main)] p-5"><div className="grid gap-4 text-sm sm:grid-cols-2"><div><span className="text-[var(--text-muted)]">Gara</span><strong className="mt-1 block">{booking.garageName}</strong></div><div><span className="text-[var(--text-muted)]">Lịch hẹn</span><strong className="mt-1 block">{formatBookingDate(booking.bookingDate)} · {booking.slotTime}</strong></div><div><span className="text-[var(--text-muted)]">Phương thức</span><strong className="mt-1 block">{paymentMethodLabels[payment.method] || payment.method || "Đang cập nhật"}</strong></div><div><span className="text-[var(--text-muted)]">Mã giao dịch</span><strong className="mt-1 block">{payment.transactionCode || "Đang cập nhật"}</strong></div></div></section>
        <table className="mt-7 w-full text-left text-sm"><thead><tr className="border-b border-[var(--border-soft)] text-[var(--text-muted)]"><th className="py-3">Nội dung</th><th className="py-3 text-right">Số tiền</th></tr></thead><tbody><tr className="border-b border-[var(--border-soft)]"><td className="py-4 font-bold">{booking.serviceName}</td><td className="py-4 text-right">{formatMoney(booking.amount)}</td></tr><tr><td className="py-3">Giảm giá</td><td className="py-3 text-right">-{formatMoney(booking.discount)}</td></tr><tr className="text-lg font-extrabold"><td className="py-4">Tổng tiền</td><td className="py-4 text-right text-[var(--brand-blue)]">{formatMoney(booking.finalAmount)}</td></tr></tbody></table>
        <div className="mt-8 flex flex-wrap justify-end gap-3"><Link to={`/customer/bookings/${booking.id}`} className="rounded-2xl border border-[var(--border-soft)] px-5 py-3 text-sm font-bold">Quay lại chi tiết lịch đặt</Link><button onClick={downloadInvoice} className="inline-flex items-center gap-2 rounded-2xl border border-[var(--border-soft)] px-5 py-3 text-sm font-bold"><Download size={17} /> Tải hóa đơn</button><button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-2xl bg-[var(--brand-blue)] px-5 py-3 text-sm font-bold text-white"><Printer size={17} /> In hóa đơn</button></div>
      </div>
    </div>
  );
}
