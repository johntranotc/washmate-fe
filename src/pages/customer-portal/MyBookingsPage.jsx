import { useCallback, useEffect, useState } from "react";
import { CalendarDays, ClipboardList, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { StatusBadge } from "@/components/customer/BookingStatusBadge";
import {
  bookingStatusLabels,
  formatBookingDate,
  formatMoney,
  paymentStatusLabels,
} from "@/lib/customer-booking-data";
import { loadCustomerBookingList } from "@/lib/customer-bookings";

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    try {
      const { bookings: list } = await loadCustomerBookingList();
      setBookings(list);
    } catch {
      setBookings([]);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    function refreshOnFocus() {
      if (document.visibilityState === "visible") load({ silent: true });
    }

    const timer = window.setInterval(() => load({ silent: true }), 15000);
    window.addEventListener("focus", refreshOnFocus);
    document.addEventListener("visibilitychange", refreshOnFocus);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", refreshOnFocus);
      document.removeEventListener("visibilitychange", refreshOnFocus);
    };
  }, [load]);

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-8 pb-32">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[var(--brand-blue)]">Lịch đặt của tôi</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">Lịch đặt rửa xe</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--text-muted)]">Theo dõi trạng thái các lịch đặt và tiếp tục thanh toán nếu cần.</p>
        </div>
        <Link to="/khach-hang/dat-lich-moi" className="inline-flex items-center justify-center gap-2 self-start rounded-2xl bg-[var(--brand-blue)] px-5 py-3 text-sm font-bold text-white shadow-[0_12px_28px_-10px_rgba(37,99,235,.75)]">
          Đặt lịch mới
        </Link>
      </header>



      {loading ? (
        <div className="rounded-2xl bg-white p-12 text-center text-[var(--text-muted)]">Đang tải lịch đặt...</div>
      ) : !bookings.length ? (
        <div className="rounded-2xl border border-[var(--border-soft)] bg-white p-12 text-center">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-[var(--brand-blue)]/10 text-[var(--brand-blue)]"><ClipboardList size={26} /></span>
          <h2 className="mt-4 text-xl font-extrabold">Bạn chưa có lịch đặt nào</h2>
          <p className="mt-2 text-sm text-[var(--text-muted)]">Đặt lịch rửa xe ngay để trải nghiệm dịch vụ của WashMate.</p>
          <Link to="/khach-hang/dat-lich-moi" className="mt-5 inline-flex rounded-2xl bg-[var(--brand-blue)] px-5 py-3 text-sm font-bold text-white">Đặt lịch ngay</Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {bookings.map((booking) => {
            const isPendingConfirm = booking.bookingStatus === "PENDING";
            const isConfirmedUnpaid =
              booking.bookingStatus === "CONFIRMED" &&
              (booking.paymentStatus === "PENDING" || !booking.paymentStatus);
            const isRejected = booking.bookingStatus === "REJECTED";

            return (
              <div key={booking.id} className="rounded-2xl border border-[var(--border-soft)] bg-white shadow-sm transition hover:border-[var(--brand-blue)]">
                <Link
                  to={`/khach-hang/lich-dat/${booking.id}`}
                  className="block p-6"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <strong className="text-lg">{booking.code}</strong>

                      <p className="mt-1 font-semibold">{booking.serviceName}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <StatusBadge status={booking.bookingStatus} />
                      {booking.paymentStatus &&
                        bookingStatusLabels[booking.bookingStatus] !==
                          paymentStatusLabels[booking.paymentStatus] && (
                          <StatusBadge status={booking.paymentStatus} type="payment" />
                        )}
                    </div>
                  </div>
                  <div className="mt-4 grid gap-3 text-sm text-[var(--text-muted)] sm:grid-cols-3">
                    <span className="inline-flex items-center gap-2"><MapPin size={16} /> {booking.garageName}</span>
                    <span className="inline-flex items-center gap-2"><CalendarDays size={16} /> {formatBookingDate(booking.bookingDate)} · {booking.slotTime}</span>
                    <span className="font-bold text-[var(--brand-blue)] sm:text-right">{formatMoney(booking.finalAmount)}</span>
                  </div>
                </Link>

                {/* Conditional action row */}
                {(isPendingConfirm || isConfirmedUnpaid || isRejected) && (
                  <div className="border-t border-[var(--border-soft)] px-6 py-3">
                    {isPendingConfirm && (
                      <p className="text-xs text-orange-600 font-semibold">
                        Vui lòng chờ gara xác nhận trước khi thanh toán.
                      </p>
                    )}
                    {isRejected && (
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs text-red-600 font-semibold">Gara đã từ chối lịch này.</p>
                        <Link
                          to="/khach-hang/dat-lich-moi"
                          className="rounded-xl bg-red-600 px-3 py-1.5 text-xs font-bold text-white"
                        >
                          Đặt lịch mới
                        </Link>
                      </div>
                    )}
                    {isConfirmedUnpaid && (
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs text-emerald-700 font-semibold">Gara đã xác nhận. Hãy hoàn tất thanh toán.</p>
                        <Link
                          to={`/khach-hang/thanh-toan/${booking.id}`}
                          className="rounded-xl bg-[var(--brand-blue)] px-3 py-1.5 text-xs font-bold text-white"
                        >
                          Thanh toán ngay
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
