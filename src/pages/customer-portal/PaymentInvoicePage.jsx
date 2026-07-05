import { useCallback, useEffect, useState } from "react";
import PageContainer from "@/components/shared/PageContainer";
import PageHeader from "@/components/shared/PageHeader";
import { CalendarDays, FileText, Wallet } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatBookingDate, formatMoney } from "@/lib/customer-booking-data";
import { bookingStatusLabels, paymentStatusLabels } from "@/lib/status-tones";
import { loadCustomerBookingList } from "@/lib/customer-bookings";

export default function PaymentInvoicePage() {
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

  const pendingPayments = bookings.filter((booking) =>
    booking.bookingStatus === "CONFIRMED" &&
    ["PENDING", "FAILED", "CANCELLED"].includes(booking.paymentStatus),
  );
  const waitingConfirmations = bookings.filter((booking) =>
    booking.bookingStatus === "PENDING" &&
    ["PENDING", "FAILED", "CANCELLED"].includes(booking.paymentStatus),
  );
  const paidInvoices = bookings.filter((booking) => booking.paymentStatus === "PAID");

  return (
    <PageContainer variant="customer">
      <PageHeader
        eyebrow="Tài chính của tôi"
        title="Thanh toán & Hóa đơn"
        description="Theo dõi thanh toán, xem hóa đơn chi tiết và lịch sử giao dịch của bạn."
      />



      {loading ? (
        <div className="rounded-2xl bg-card p-12 text-center text-muted-foreground">Đang tải dữ liệu thanh toán...</div>
      ) : (
        <>
          <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-xl font-extrabold"><Wallet className="text-primary" /> Cần thanh toán</h2>
            {!pendingPayments.length ? (
              <p className="mt-4 text-sm text-muted-foreground">Bạn không có lịch đặt nào đang chờ thanh toán.</p>
            ) : (
              <div className="mt-5 grid gap-4">
                {pendingPayments.map((booking) => (
                  <div key={booking.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border p-5">
                    <div>
                      <div className="flex items-center gap-2">
                        <strong>{booking.code}</strong>
                        <StatusBadge status={booking.bookingStatus} />
                        {booking.paymentStatus &&
                          bookingStatusLabels[booking.bookingStatus] !==
                            paymentStatusLabels[booking.paymentStatus] && (
                            <StatusBadge status={booking.paymentStatus} type="payment" />
                          )}
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">{booking.serviceName} · {booking.garageName}</p>
                      <p className="mt-1 inline-flex items-center gap-2 text-sm text-muted-foreground"><CalendarDays size={14} /> {formatBookingDate(booking.bookingDate)} · {booking.slotTime}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <strong className="text-lg text-primary">{formatMoney(booking.finalAmount)}</strong>
                      <Button render={<Link to={`/khach-hang/thanh-toan/${booking.id}`} />}>Thanh toán ngay</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {waitingConfirmations.length > 0 && (
              <div className="mt-5 rounded-2xl border border-warning/30 bg-warning-container px-5 py-4">
                <p className="text-sm font-bold text-warning">
                  {waitingConfirmations.length} lịch đặt đang chờ gara xác nhận trước khi thanh toán.
                </p>
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-xl font-extrabold"><FileText className="text-primary" /> Hóa đơn đã phát hành</h2>
            {!paidInvoices.length ? (
              <p className="mt-4 text-sm text-muted-foreground">Bạn chưa có hóa đơn nào.</p>
            ) : (
              <div className="mt-5 grid gap-4">
                {paidInvoices.map((booking) => (
                  <div key={booking.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border p-5">
                    <div>
                      <div className="flex items-center gap-2">
                        <strong>{booking.code}</strong>
                        <StatusBadge status={booking.bookingStatus} />
                        {booking.paymentStatus &&
                          bookingStatusLabels[booking.bookingStatus] !==
                            paymentStatusLabels[booking.paymentStatus] && (
                            <StatusBadge status={booking.paymentStatus} type="payment" />
                          )}
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">{booking.serviceName} · {booking.garageName}</p>
                      <p className="mt-1 inline-flex items-center gap-2 text-sm text-muted-foreground"><CalendarDays size={14} /> {formatBookingDate(booking.bookingDate)} · {booking.slotTime}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <strong className="text-lg text-primary">{formatMoney(booking.finalAmount)}</strong>
                      <Button variant="outline" render={<Link to={`/khach-hang/thanh-toan/${booking.id}/hoa-don`} />}>Xem hóa đơn</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </PageContainer>
  );
}
