import { ArrowLeft, CalendarDays, Car, Droplets, Gift, MapPin, NotebookText, XCircle } from "lucide-react";
import PageContainer from "@/components/shared/PageContainer";
import PageHeader from "@/components/shared/PageHeader";
import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { confirmDialog } from "@/components/shared/ConfirmDialog";
import { bookingApi } from "@/api/bookingApi";
import { paymentApi } from "@/api/paymentApi";
import { BookingTimeline } from "@/components/customer/BookingTimeline";
import { PaymentStatusCard } from "@/components/customer/PaymentStatusCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  formatBookingDate,
  formatMoney,
  normalizeBooking,
  normalizePayment,
} from "@/lib/customer-booking-data";
import { loadCustomerBookingList } from "@/lib/customer-bookings";

export default function CustomerBookingDetailPage() {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState(false);

  const loadDetail = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [bookingResult, paymentResult] = await Promise.allSettled([
        bookingApi.getBookingById(bookingId),
        paymentApi.getPaymentByBookingId(bookingId),
      ]);
      if (bookingResult.status === "rejected") throw bookingResult.reason;
      const normalized = normalizeBooking(bookingResult.value);
      if (paymentResult.status === "fulfilled") {
        const payment = normalizePayment(paymentResult.value);
        setBooking(normalizeBooking({ ...normalized, payment, paymentStatus: payment.status }));
      } else {
        setBooking(normalized);
      }
    } catch {
      setError("Không thể tải dữ liệu lịch đặt.");
      setBooking(null);
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  // BE chỉ cho hủy khi PENDING/CONFIRMED và chưa thanh toán (đã thanh toán phải hoàn tiền tại quầy).
  const canCancel =
    booking &&
    ["PENDING", "CONFIRMED"].includes(String(booking.bookingStatus || "").toUpperCase()) &&
    String(booking.paymentStatus || "").toUpperCase() !== "PAID";

  async function handleCancel() {
    const ok = await confirmDialog({
      title: "Hủy lịch đặt này?",
      description: `Lịch ${booking.code} sẽ bị hủy và khung giờ được trả lại cho gara. Thao tác này không thể hoàn tác.`,
      confirmLabel: "Hủy lịch",
      destructive: true,
    });
    if (!ok) return;
    setCancelling(true);
    try {
      await bookingApi.cancelBooking(bookingId);
      toast.success("Đã hủy lịch đặt", { description: booking.code });
      await loadDetail();
    } catch (e) {
      toast.error("Không thể hủy lịch", { description: e?.message || "Vui lòng thử lại." });
    } finally {
      setCancelling(false);
    }
  }

  useEffect(() => {
    function refreshOnFocus() {
      if (document.visibilityState === "visible") loadDetail();
    }

    window.addEventListener("focus", loadDetail);
    document.addEventListener("visibilitychange", refreshOnFocus);
    return () => {
      window.removeEventListener("focus", loadDetail);
      document.removeEventListener("visibilitychange", refreshOnFocus);
    };
  }, [loadDetail]);

  if (loading) {
    return <div className="mx-auto max-w-5xl p-8"><div className="rounded-2xl bg-card p-12 text-center text-muted-foreground">Đang tải chi tiết lịch đặt...</div></div>;
  }

  if (!booking) {
    return (
      <div className="mx-auto max-w-5xl p-8">
        <div className="rounded-2xl border border-critical/25 bg-critical-container p-10 text-center">
          <h1 className="text-xl font-extrabold text-critical">Không tìm thấy lịch đặt</h1>
          <p className="mt-2 text-sm text-critical">{error}</p>
          <Button onClick={loadDetail} className="mt-5 bg-critical text-white hover:bg-critical/90">Thử lại</Button>
        </div>
      </div>
    );
  }

  const details = [
    [Car, "Xe", booking.vehicle],
    [Car, "Biển số", booking.plate],
    [Droplets, "Dịch vụ", booking.serviceName],
    [MapPin, "Gara", booking.garageName],
    [MapPin, "Địa chỉ gara", booking.garageAddress],
    [CalendarDays, "Ngày hẹn", formatBookingDate(booking.bookingDate)],
    [CalendarDays, "Khung giờ", `${booking.slotTime}${booking.endTime ? ` - ${booking.endTime}` : ""}`],
    [NotebookText, "Ghi chú", booking.note || "Không có ghi chú"],
  ];

  return (
    <PageContainer variant="customer">
      <Link to="/khach-hang/lich-dat" className="inline-flex items-center gap-2 text-sm font-bold text-primary"><ArrowLeft size={16} /> Quay lại lịch đặt</Link>
      <PageHeader
        title="Chi tiết lịch đặt"
        description={booking.code}
        actions={<StatusBadge status={booking.bookingStatus} />}
      />

      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold">Tiến trình lịch đặt</h2>
            <p className="mt-1 text-sm text-muted-foreground">Trạng thái được cập nhật theo quá trình thanh toán và chăm sóc xe.</p>
          </div>
        </div>
        <BookingTimeline booking={booking} />
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-extrabold">Thông tin lịch đặt</h2>
          <dl className="mt-6 grid gap-5 sm:grid-cols-2">
            {details.map(([Icon, label, value]) => (
              <div key={label} className="flex gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><Icon size={18} /></span>
                <div>
                  <dt className="text-xs font-semibold text-muted-foreground">{label}</dt>
                  <dd className="mt-1 font-bold">{value}</dd>
                </div>
              </div>
            ))}
          </dl>
          <div className="mt-7 flex items-center justify-between rounded-2xl bg-surface p-5">
            <span className="font-bold">Tổng tiền tạm tính</span>
            <strong className="text-xl text-primary">{formatMoney(booking.finalAmount)}</strong>
          </div>
        </section>
        <PaymentStatusCard booking={booking} />
      </div>

      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><Gift size={18} /></span>
          <div>
            <h2 className="text-lg font-extrabold">Điểm thưởng</h2>
            {booking.bookingStatus === "COMPLETED" && booking.paymentStatus === "PAID" ? (
              <p className="mt-1 text-sm text-muted-foreground">
                Bạn đã được cộng điểm thưởng cho lịch đặt này. Xem tại{" "}
                <Link to="/khach-hang/diem-thanh-vien" className="font-bold text-primary">trang Điểm thành viên</Link>.
              </p>
            ) : (
              <p className="mt-1 text-sm text-muted-foreground">
                Điểm thưởng sẽ được cộng sau khi lịch đặt hoàn tất và thanh toán thành công.{" "}
                <Link to="/khach-hang/diem-thanh-vien" className="font-bold text-primary">Xem điểm thành viên</Link>.
              </p>
            )}
          </div>
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <Button variant="outline" size="lg" render={<Link to="/khach-hang" />}>Quay về trang khách hàng</Button>
        <Button variant="outline" size="lg" render={<Link to="/khach-hang/lich-dat" />}>Xem lịch đặt</Button>
        <Button size="lg" render={<Link to="/khach-hang/dat-lich-moi" />}>Đặt lịch mới</Button>
        {canCancel && (
          <Button
            variant="outline"
            size="lg"
            onClick={handleCancel}
            disabled={cancelling}
            className="text-critical hover:bg-critical-container"
          >
            <XCircle size={18} /> {cancelling ? "Đang hủy..." : "Hủy lịch"}
          </Button>
        )}
      </div>
    </PageContainer>
  );
}
