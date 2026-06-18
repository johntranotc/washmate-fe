import { ArrowLeft, CalendarDays, Car, Gift, MapPin, NotebookText, Sparkles } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { bookingApi } from "@/api/bookingApi";
import { paymentApi } from "@/api/paymentApi";
import { BookingTimeline } from "@/components/customer/BookingTimeline";
import { PaymentStatusCard } from "@/components/customer/PaymentStatusCard";
import { StatusBadge } from "@/components/customer/BookingStatusBadge";
import {
  formatBookingDate,
  formatMoney,
  normalizeBooking,
  normalizePayment,
} from "@/lib/customer-booking-data";
import { loadCustomerBookingList } from "@/lib/customer-bookings";
import { cancelBookingByCustomer } from "@/lib/shared-booking-store";

export default function CustomerBookingDetailPage() {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
      const { bookings } = await loadCustomerBookingList();
      const found = bookings.find((item) => String(item.id) === String(bookingId));
      if (!found) {
        setError("Không thể tải dữ liệu lịch đặt.");
        setBooking(null);
      } else {
        setBooking(normalizeBooking({ ...found, isMock: true }));
      }
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  if (loading) {
    return <div className="mx-auto max-w-5xl p-8"><div className="rounded-3xl bg-white p-12 text-center text-[var(--text-muted)]">Đang tải chi tiết lịch đặt...</div></div>;
  }

  if (!booking) {
    return (
      <div className="mx-auto max-w-5xl p-8">
        <div className="rounded-3xl border border-red-200 bg-red-50 p-10 text-center">
          <h1 className="text-xl font-extrabold text-red-700">Không tìm thấy lịch đặt</h1>
          <p className="mt-2 text-sm text-red-600">{error}</p>
          <button onClick={loadDetail} className="mt-5 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white">Thử lại</button>
        </div>
      </div>
    );
  }

  const details = [
    [Car, "Xe", booking.vehicle],
    [Car, "Biển số", booking.plate],
    [Sparkles, "Dịch vụ", booking.serviceName],
    [MapPin, "Gara", booking.garageName],
    [MapPin, "Địa chỉ gara", booking.garageAddress],
    [CalendarDays, "Ngày đặt", formatBookingDate(booking.bookingDate)],
    [CalendarDays, "Khung giờ", `${booking.slotTime}${booking.endTime ? ` - ${booking.endTime}` : ""}`],
    [NotebookText, "Ghi chú", booking.note || "Không có ghi chú"],
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link to="/khach-hang/lich-dat" className="inline-flex items-center gap-2 text-sm font-bold text-[var(--brand-blue)]"><ArrowLeft size={16} /> Quay lại lịch đặt</Link>
          <h1 className="mt-4 text-3xl font-extrabold">Chi tiết lịch đặt</h1>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <strong>{booking.code}</strong>
            <StatusBadge status={booking.bookingStatus} />
          </div>
        </div>
        {booking.isMock && <span className="w-fit rounded-full bg-blue-50 px-3 py-1.5 text-xs font-extrabold text-[var(--brand-blue)]">Dữ liệu mẫu</span>}
      </header>
      {booking.isMock && <p className="rounded-2xl border border-blue-200 bg-blue-50 px-5 py-4 text-sm text-blue-700">Dữ liệu này dùng để demo giao diện. API thật sẽ được kết nối sau.</p>}

      <section className="rounded-3xl border border-[var(--border-soft)] bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold">Tiến trình lịch đặt</h2>
            <p className="mt-1 text-sm text-[var(--text-muted)]">Trạng thái được cập nhật theo quá trình thanh toán và chăm sóc xe.</p>
          </div>
        </div>
        <BookingTimeline booking={booking} />
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <section className="rounded-3xl border border-[var(--border-soft)] bg-white p-6 shadow-sm">
          <h2 className="text-xl font-extrabold">Thông tin lịch đặt</h2>
          <dl className="mt-6 grid gap-5 sm:grid-cols-2">
            {details.map(([Icon, label, value]) => (
              <div key={label} className="flex gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--brand-blue)]/10 text-[var(--brand-blue)]"><Icon size={18} /></span>
                <div>
                  <dt className="text-xs font-semibold text-[var(--text-muted)]">{label}</dt>
                  <dd className="mt-1 font-bold">{value}</dd>
                </div>
              </div>
            ))}
          </dl>
          <div className="mt-7 flex items-center justify-between rounded-2xl bg-[var(--bg-main)] p-5">
            <span className="font-bold">Tổng tiền tạm tính</span>
            <strong className="text-xl text-[var(--brand-blue)]">{formatMoney(booking.finalAmount)}</strong>
          </div>
        </section>
        <PaymentStatusCard booking={booking} />
      </div>

      <section className="rounded-3xl border border-[var(--border-soft)] bg-white p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--brand-blue)]/10 text-[var(--brand-blue)]"><Gift size={18} /></span>
          <div>
            <h2 className="text-lg font-extrabold">Điểm thưởng</h2>
            {booking.bookingStatus === "COMPLETED" && booking.paymentStatus === "PAID" ? (
              <p className="mt-1 text-sm text-[var(--text-muted)]">
                Bạn đã được cộng điểm thưởng cho lịch đặt này. Xem tại{" "}
                <Link to="/khach-hang/diem-thanh-vien" className="font-bold text-[var(--brand-blue)]">trang Điểm thành viên</Link>.
              </p>
            ) : (
              <p className="mt-1 text-sm text-[var(--text-muted)]">
                Điểm thưởng sẽ được cộng sau khi lịch đặt hoàn tất và thanh toán thành công.{" "}
                <Link to="/khach-hang/diem-thanh-vien" className="font-bold text-[var(--brand-blue)]">Xem điểm thành viên</Link>.
              </p>
            )}
          </div>
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <Link to="/khach-hang" className="rounded-2xl border border-[var(--border-soft)] bg-white px-5 py-3 text-sm font-bold">Quay về trang khách hàng</Link>
        <Link to="/khach-hang/lich-dat" className="rounded-2xl border border-[var(--border-soft)] bg-white px-5 py-3 text-sm font-bold">Xem lịch đặt</Link>
        <Link to="/khach-hang/dat-lich-moi" className="rounded-2xl bg-[var(--brand-blue)] px-5 py-3 text-sm font-bold text-white">Đặt lịch mới</Link>
        {booking && (booking.bookingStatus === "PENDING_STAFF_CONFIRMATION" || booking.bookingStatus === "CONFIRMED") && (
          <button
            onClick={() => {
              if (window.confirm("Bạn có chắc chắn muốn hủy lịch đặt này không?")) {
                cancelBookingByCustomer(booking.id);
                setBooking({ ...booking, bookingStatus: "CANCELLED" });
              }
            }}
            className="rounded-2xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-bold text-red-600 hover:bg-red-100"
          >
            Hủy lịch
          </button>
        )}
      </div>
    </div>
  );
}
