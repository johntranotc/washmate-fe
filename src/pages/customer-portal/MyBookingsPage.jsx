import { useCallback, useEffect, useState } from "react";
import PageContainer from "@/components/shared/PageContainer";
import PageHeader from "@/components/shared/PageHeader";
import { CalendarDays, ClipboardList, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatBookingDate, formatMoney } from "@/lib/customer-booking-data";
import { bookingStatusLabels, paymentStatusLabels } from "@/lib/status-tones";
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
    <PageContainer variant="customer" className="pb-32">
      <PageHeader
        eyebrow="Lịch đặt của tôi"
        title="Lịch đặt rửa xe"
        description="Theo dõi trạng thái các lịch đặt và tiếp tục thanh toán nếu cần."
        actions={
          <Button size="lg" className="shadow-cta" render={<Link to="/khach-hang/dat-lich-moi" />}>
            Đặt lịch mới
          </Button>
        }
      />



      {loading ? (
        <div className="rounded-2xl bg-card p-12 text-center text-muted-foreground">Đang tải lịch đặt...</div>
      ) : !bookings.length ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary"><ClipboardList size={26} /></span>
          <h2 className="mt-4 text-xl font-extrabold">Bạn chưa có lịch đặt nào</h2>
          <p className="mt-2 text-sm text-muted-foreground">Đặt lịch rửa xe ngay để trải nghiệm dịch vụ của WashMate.</p>
          <Button size="lg" className="mt-5" render={<Link to="/khach-hang/dat-lich-moi" />}>Đặt lịch ngay</Button>
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
              <div key={booking.id} className="rounded-2xl border border-border bg-card shadow-sm transition hover:border-primary">
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
                  <div className="mt-4 grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
                    <span className="inline-flex items-center gap-2"><MapPin size={16} /> {booking.garageName}</span>
                    <span className="inline-flex items-center gap-2"><CalendarDays size={16} /> {formatBookingDate(booking.bookingDate)} · {booking.slotTime}</span>
                    <span className="font-bold text-primary sm:text-right">{formatMoney(booking.finalAmount)}</span>
                  </div>
                </Link>

                {/* Conditional action row */}
                {(isPendingConfirm || isConfirmedUnpaid || isRejected) && (
                  <div className="border-t border-border px-6 py-3">
                    {isPendingConfirm && (
                      <p className="text-xs text-warning font-semibold">
                        Vui lòng chờ gara xác nhận trước khi thanh toán.
                      </p>
                    )}
                    {isRejected && (
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs text-critical font-semibold">Gara đã từ chối lịch này.</p>
                        <Button
                          size="sm"
                          className="bg-critical text-white hover:bg-critical/90"
                          render={<Link to="/khach-hang/dat-lich-moi" />}
                        >
                          Đặt lịch mới
                        </Button>
                      </div>
                    )}
                    {isConfirmedUnpaid && (
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs text-success font-semibold">Gara đã xác nhận. Hãy hoàn tất thanh toán.</p>
                        <Button
                          size="sm"
                          render={<Link to={`/khach-hang/thanh-toan/${booking.id}`} />}
                        >
                          Thanh toán ngay
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </PageContainer>
  );
}
