import { Download, Droplets, Printer } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { bookingApi } from "@/api/bookingApi";
import { invoiceApi } from "@/api/invoiceApi";
import { paymentApi } from "@/api/paymentApi";
import {
  formatBookingDate,
  formatMoney,
  invoiceStatusLabels,
  normalizeBooking,
  normalizeInvoice,
  normalizePayment,
  paymentMethodLabels,
} from "@/lib/customer-booking-data";


export default function CustomerInvoicePage() {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [payment, setPayment] = useState(null);
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadInvoice = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [bookingData, paymentData, invoiceData] = await Promise.all([
        bookingApi.getBookingById(bookingId),
        paymentApi.getPaymentByBookingId(bookingId),
        invoiceApi.getInvoiceByBookingId(bookingId),
      ]);
      const normalizedPayment = normalizePayment(paymentData);
      if (normalizedPayment.status !== "PAID") throw new Error("INVOICE_NOT_AVAILABLE");
      setBooking(normalizeBooking({ ...normalizeBooking(bookingData), payment: normalizedPayment, paymentStatus: "PAID" }));
      setPayment(normalizedPayment);
      setInvoice(normalizeInvoice(invoiceData));
    } catch {
      setError("Chưa có hóa đơn.");
      setBooking(null);
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    loadInvoice();
  }, [loadInvoice]);

  function downloadInvoice() {
    const content = [
      "WASHMATE",
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

  if (loading) {
    return <div className="mx-auto max-w-4xl p-8"><div className="rounded-2xl bg-card p-12 text-center text-muted-foreground">Đang tải hóa đơn...</div></div>;
  }

  if (!booking || !invoice) {
    return (
      <div className="mx-auto max-w-4xl p-8">
        <div className="rounded-2xl border border-warning/25 bg-warning-container p-10 text-center">
          <h1 className="text-xl font-extrabold text-warning">Chưa có hóa đơn</h1>
          <p className="mt-2 text-sm text-warning">{error}</p>
          <Button onClick={loadInvoice} className="mt-5">Thử lại</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl p-8">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-10">
        <header className="flex flex-col gap-5 border-b border-border pb-7 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="grid size-12 place-items-center rounded-2xl bg-primary text-white"><Droplets /></span>
            <strong className="text-xl">WashMate</strong>
          </div>
          <div className="sm:text-right">

            <h1 className="mt-3 text-2xl font-extrabold">Hóa đơn thanh toán</h1>
            <p className="mt-1 text-sm text-muted-foreground">{invoice.code}</p>
          </div>
        </header>

        <section className="grid gap-6 py-7 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold text-muted-foreground">Thông tin khách hàng</p>
            <strong className="mt-2 block">{booking.customerName || "Khách hàng WashMate"}</strong>
            <p className="mt-1 text-sm text-muted-foreground">{booking.vehicle} · {booking.plate}</p>
          </div>
          <div className="sm:text-right">
            <p className="text-xs font-semibold text-muted-foreground">Thông tin chứng từ</p>
            <p className="mt-2 font-bold">Booking: {booking.code}</p>
            <p className="mt-1 text-sm text-muted-foreground">Ngày phát hành: {formatBookingDate(invoice.issuedAt)}</p>
            <span className="mt-2 inline-flex rounded-full bg-success-container px-3 py-1 text-xs font-bold text-success">{invoiceStatusLabels[invoice.status]}</span>
          </div>
        </section>
        <section className="rounded-2xl bg-surface p-5">
          <div className="grid gap-4 text-sm sm:grid-cols-2">
            <div><span className="text-muted-foreground">Gara</span><strong className="mt-1 block">{booking.garageName}</strong></div>
            <div><span className="text-muted-foreground">Lịch hẹn</span><strong className="mt-1 block">{formatBookingDate(booking.bookingDate)} · {booking.slotTime}</strong></div>
            <div><span className="text-muted-foreground">Phương thức</span><strong className="mt-1 block">{paymentMethodLabels[payment.method] || payment.method || "Đang cập nhật"}</strong></div>
            <div><span className="text-muted-foreground">Mã giao dịch</span><strong className="mt-1 block">{payment.transactionCode || "Đang cập nhật"}</strong></div>
            {payment.bankName && (
              <div><span className="text-muted-foreground">Ngân hàng</span><strong className="mt-1 block">{payment.bankName}</strong></div>
            )}
            {payment.accountName && (
              <div><span className="text-muted-foreground">Chủ tài khoản</span><strong className="mt-1 block">{payment.accountName}</strong></div>
            )}
            {payment.transferContent && (
              <div className="sm:col-span-2">
                <span className="text-muted-foreground">Nội dung chuyển khoản</span>
                <strong className="mt-1 block font-extrabold text-primary">{payment.transferContent}</strong>
              </div>
            )}
          </div>
        </section>
        <table className="mt-7 w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border text-muted-foreground"><th className="py-3">Nội dung</th><th className="py-3 text-right">Số tiền</th></tr>
          </thead>
          <tbody>
            <tr className="border-b border-border"><td className="py-4 font-bold">{booking.serviceName}</td><td className="py-4 text-right">{formatMoney(booking.amount)}</td></tr>
            <tr><td className="py-3">Giảm giá</td><td className="py-3 text-right">-{formatMoney(booking.discount)}</td></tr>
            <tr className="text-lg font-extrabold"><td className="py-4">Tổng tiền</td><td className="py-4 text-right text-primary">{formatMoney(booking.finalAmount)}</td></tr>
          </tbody>
        </table>
        <div className="mt-8 flex flex-wrap justify-end gap-3">
          <Button variant="outline" size="lg" render={<Link to={`/khach-hang/lich-dat/${booking.id}`} />}>Quay lại chi tiết lịch đặt</Button>
          <Button variant="outline" size="lg" onClick={downloadInvoice}><Download /> Tải hóa đơn</Button>
          <Button size="lg" onClick={() => window.print()}><Printer /> In hóa đơn</Button>
        </div>
      </div>
    </div>
  );
}
