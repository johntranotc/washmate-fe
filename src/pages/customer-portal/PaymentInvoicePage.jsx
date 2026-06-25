import { useCallback, useEffect, useState } from "react";
import { CalendarDays, FileText, Wallet } from "lucide-react";
import { Link } from "react-router-dom";
import { StatusBadge } from "@/components/customer/BookingStatusBadge";
import {
  formatBookingDate,
  formatMoney,
} from "@/lib/customer-booking-data";
import { loadCustomerBookingList } from "@/lib/customer-bookings";

export default function PaymentInvoicePage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { bookings: list } = await loadCustomerBookingList();
      setBookings(list);
    } catch {
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const pendingPayments = bookings.filter((booking) =>
    ["PENDING", "FAILED", "CANCELLED"].includes(booking.paymentStatus),
  );
  const paidInvoices = bookings.filter((booking) => booking.paymentStatus === "PAID");

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-8">
      <header>
        <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[var(--brand-blue)]">Thanh toán & Hóa đơn</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">Thanh toán & Hóa đơn</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--text-muted)]">Theo dõi thanh toán, xem hóa đơn chi tiết và lịch sử giao dịch của bạn.</p>
      </header>



      {loading ? (
        <div className="rounded-3xl bg-white p-12 text-center text-[var(--text-muted)]">Đang tải dữ liệu thanh toán...</div>
      ) : (
        <>
          <section className="rounded-3xl border border-[var(--border-soft)] bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-xl font-extrabold"><Wallet className="text-[var(--brand-blue)]" /> Cần thanh toán</h2>
            {!pendingPayments.length ? (
              <p className="mt-4 text-sm text-[var(--text-muted)]">Bạn không có lịch đặt nào đang chờ thanh toán.</p>
            ) : (
              <div className="mt-5 grid gap-4">
                {pendingPayments.map((booking) => (
                  <div key={booking.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[var(--border-soft)] p-5">
                    <div>
                      <div className="flex items-center gap-2">
                        <strong>{booking.code}</strong>
                        <StatusBadge status={booking.bookingStatus} />
                        <StatusBadge status={booking.paymentStatus} type="payment" />
                      </div>
                      <p className="mt-2 text-sm text-[var(--text-muted)]">{booking.serviceName} · {booking.garageName}</p>
                      <p className="mt-1 inline-flex items-center gap-2 text-sm text-[var(--text-muted)]"><CalendarDays size={14} /> {formatBookingDate(booking.bookingDate)} · {booking.slotTime}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <strong className="text-lg text-[var(--brand-blue)]">{formatMoney(booking.finalAmount)}</strong>
                      <Link to={`/khach-hang/thanh-toan/${booking.id}`} className="rounded-2xl bg-[var(--brand-blue)] px-5 py-2.5 text-sm font-bold text-white">Thanh toán ngay</Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-3xl border border-[var(--border-soft)] bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-xl font-extrabold"><FileText className="text-[var(--brand-blue)]" /> Hóa đơn đã phát hành</h2>
            {!paidInvoices.length ? (
              <p className="mt-4 text-sm text-[var(--text-muted)]">Bạn chưa có hóa đơn nào.</p>
            ) : (
              <div className="mt-5 grid gap-4">
                {paidInvoices.map((booking) => (
                  <div key={booking.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[var(--border-soft)] p-5">
                    <div>
                      <div className="flex items-center gap-2">
                        <strong>{booking.code}</strong>
                        <StatusBadge status={booking.bookingStatus} />
                        <StatusBadge status={booking.paymentStatus} type="payment" />
                      </div>
                      <p className="mt-2 text-sm text-[var(--text-muted)]">{booking.serviceName} · {booking.garageName}</p>
                      <p className="mt-1 inline-flex items-center gap-2 text-sm text-[var(--text-muted)]"><CalendarDays size={14} /> {formatBookingDate(booking.bookingDate)} · {booking.slotTime}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <strong className="text-lg text-[var(--brand-blue)]">{formatMoney(booking.finalAmount)}</strong>
                      <Link to={`/khach-hang/thanh-toan/${booking.id}/hoa-don`} className="rounded-2xl border border-[var(--border-soft)] px-5 py-2.5 text-sm font-bold">Xem hóa đơn</Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
