import { CalendarDays, CreditCard, Eye, Plus } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { bookingApi } from "@/api/bookingApi";
import { useAppStore } from "@/state/AppStore";
import { StatusBadge } from "@/components/customer/BookingStatusBadge";
import {
  bookingStatusLabels,
  formatBookingDate,
  formatMoney,
  normalizeBooking,
  normalizeBookingList,
} from "@/lib/customer-booking-data";
import { cn } from "@/lib/utils";

const filters = ["ALL", "PENDING", "CONFIRMED", "CHECKED_IN", "WASHING", "COMPLETED", "CANCELLED", "NO_SHOW"];

export default function BookingManagementPage() {
  const { state } = useAppStore();
  const [filter, setFilter] = useState("ALL");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  

  const loadBookings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await bookingApi.getMyBookings();
      const list = normalizeBookingList(data);
      if (!list.length) throw new Error("EMPTY");
      setBookings(list);
      
    } catch {
      setBookings(state.bookings.map((item) => normalizeBooking({ ...item, isMock: true })));
      
    } finally {
      setLoading(false);
    }
  }, [state.bookings]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const filtered = useMemo(
    () => bookings.filter((item) => filter === "ALL" || item.bookingStatus === filter),
    [bookings, filter],
  );

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-sm font-extrabold uppercase tracking-[0.16em] text-[var(--brand-blue)]">Quản lý lịch</p><h1 className="mt-2 text-3xl font-extrabold">Lịch đặt của tôi</h1><p className="mt-2 text-sm text-[var(--text-muted)]">Theo dõi thanh toán và tiến độ chăm sóc xe.</p></div>
        <Link to="/customer/booking" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[var(--brand-blue)] px-5 py-3 text-sm font-bold text-white"><Plus size={17} /> Đặt lịch mới</Link>
      </header>
      {isMock && <div className="rounded-2xl border border-blue-200 bg-blue-50 px-5 py-4 text-sm text-blue-700"><strong>Dữ liệu mẫu.</strong> Dữ liệu này dùng để demo giao diện. API thật sẽ được kết nối sau.</div>}
      <div className="flex gap-2 overflow-x-auto rounded-2xl border border-[var(--border-soft)] bg-white p-2">
        {filters.map((status) => <button key={status} onClick={() => setFilter(status)} className={cn("whitespace-nowrap rounded-xl px-4 py-2 text-xs font-bold", filter === status ? "bg-[var(--brand-blue)] text-white" : "text-[var(--text-muted)] hover:bg-[var(--bg-main)]")}>{status === "ALL" ? "Tất cả" : bookingStatusLabels[status]}</button>)}
      </div>
      {loading ? <div className="rounded-3xl bg-white p-12 text-center text-[var(--text-muted)]">Đang tải dữ liệu...</div> : !filtered.length ? (
        <div className="rounded-3xl border border-dashed border-[var(--border-soft)] bg-white p-12 text-center"><CalendarDays className="mx-auto size-10 text-[var(--brand-blue)]" /><h2 className="mt-4 text-xl font-extrabold">Bạn chưa có lịch đặt nào</h2><Link to="/customer/booking" className="mt-5 inline-flex rounded-2xl bg-[var(--brand-blue)] px-5 py-3 text-sm font-bold text-white">Đặt lịch mới</Link></div>
      ) : <div className="grid gap-5">{filtered.map((booking) => (
        <article key={booking.id} className="rounded-3xl border border-[var(--border-soft)] bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
            <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><strong className="text-lg">{booking.code}</strong><StatusBadge status={booking.bookingStatus} /><StatusBadge status={booking.paymentStatus} type="payment" /></div><h2 className="mt-4 font-extrabold">{booking.vehicle} · {booking.plate}</h2><p className="mt-1 text-sm text-[var(--text-muted)]">{booking.serviceName} tại {booking.garageName}</p></div>
            <div className="grid gap-2 text-sm sm:grid-cols-2 lg:w-72 lg:grid-cols-1"><span>{formatBookingDate(booking.bookingDate)} · {booking.slotTime}</span><strong className="text-[var(--brand-blue)]">{formatMoney(booking.finalAmount)}</strong></div>
            <div className="flex flex-wrap gap-2"><Link to={`/customer/bookings/${booking.id}`} className="inline-flex items-center gap-2 rounded-xl border border-[var(--border-soft)] px-4 py-2.5 text-sm font-bold"><Eye size={16} /> Xem chi tiết</Link>{booking.paymentStatus !== "PAID" && <Link to={`/customer/bookings/${booking.id}/payment`} className="inline-flex items-center gap-2 rounded-xl bg-[var(--brand-blue)] px-4 py-2.5 text-sm font-bold text-white"><CreditCard size={16} /> Thanh toán</Link>}</div>
          </div>
        </article>
      ))}</div>}
    </div>
  );
}
