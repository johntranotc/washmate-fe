import { Building2, CalendarDays, CheckCircle2, CircleDollarSign, CreditCard, PackageCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { garageApi } from "../../api/garageApi";
import { adminApi } from "../../api/adminApi";
import { normalizeBookingList, normalizeStaffBooking } from "../../lib/staff-booking-data";

export default function AdminDashboardPage() {
  const [garages, setGarages] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [loadingGarages, setLoadingGarages] = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(true);

  useEffect(() => {
    garageApi
      .getAll()
      .then((data) => setGarages(Array.isArray(data) ? data : []))
      .catch(() => setGarages([]))
      .finally(() => setLoadingGarages(false));

    adminApi
      .getBookings()
      .then((data) => {
        const list = normalizeBookingList(data).map(normalizeStaffBooking);
        // Sort by id descending
        list.sort((a, b) => Number(b.id) - Number(a.id));
        setAllBookings(list);
      })
      .catch(() => setAllBookings([]))
      .finally(() => setLoadingBookings(false));
  }, []);

  const todayStr = new Date().toISOString().split("T")[0];
  const todayBookings = allBookings.filter(b => b.bookingDate === todayStr).length;
  const completedBookings = allBookings.filter(b => b.bookingStatus === "COMPLETED").length;
  const paidCount = allBookings.filter(b => b.paymentStatus === "PAID").length;
  const revenue = allBookings.filter(b => b.bookingStatus === "COMPLETED").reduce((sum, b) => sum + Number(b.finalAmount || 0), 0);

  const formatVND = (amount) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

  const metrics = [
    [Building2, "Tổng gara", loadingGarages ? "…" : garages.length],
    [PackageCheck, "Dịch vụ đang mở", loadingGarages ? "…" : (garages.length * 6)], // Mock 6 services per garage
    [CalendarDays, "Lịch hôm nay", loadingBookings ? "…" : todayBookings],
    [CircleDollarSign, "Doanh thu", loadingBookings ? "…" : formatVND(revenue)],
    [CreditCard, "Thanh toán đã nhận", loadingBookings ? "…" : paidCount],
    [CheckCircle2, "Lịch hoàn tất", loadingBookings ? "…" : completedBookings],
  ];

  const recentBookings = allBookings.slice(0, 5);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">Quản trị WashMate</p>
        <h1 className="mt-2 text-3xl font-extrabold">Tổng quan hệ thống</h1>
        <p className="mt-2 text-sm text-slate-500">Theo dõi vận hành gara, booking và doanh thu trên một màn hình.</p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {metrics.map(([Icon, label, value]) => (
          <article key={label} className="rounded-2xl border border-slate-200 bg-white p-5">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-600">
              <Icon size={19} />
            </span>
            <p className="mt-4 text-xs text-slate-500">{label}</p>
            <b className="mt-1 block text-2xl">{value}</b>
          </article>
        ))}
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.4fr_0.6fr]">
        <article className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex justify-between">
            <h2 className="font-extrabold">Booking gần đây</h2>
            <Link to="/quan-tri/bookings" className="text-xs font-bold text-blue-600">Xem tất cả</Link>
          </div>
          <div className="mt-4 space-y-3">
            {loadingBookings ? (
              <p className="py-8 text-center text-sm text-slate-400">Đang tải...</p>
            ) : recentBookings.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-400">Chưa có booking nào.</p>
            ) : (
              recentBookings.map((item) => (
                <div key={item.id} className="flex flex-col gap-2 rounded-xl bg-slate-50 p-4 sm:flex-row sm:items-center">
                  <div className="flex-1">
                    <b className="text-sm">{item.code} · {item.customerName}</b>
                    <p className="mt-1 text-xs text-slate-500">{item.garageName} · {item.serviceName}</p>
                  </div>
                  <span className="text-xs font-bold text-blue-600">{item.bookingStatus}</span>
                </div>
              ))
            )}
          </div>
        </article>

        <article className="rounded-2xl bg-gradient-to-br from-blue-700 to-cyan-500 p-6 text-white">
          <h2 className="text-xl font-black">Quản lý gara</h2>
          <p className="mt-2 text-xs leading-5 text-blue-100">
            {loadingGarages ? "Đang tải..." : garages.length > 0 ? `Hệ thống có ${garages.length} gara đang hoạt động.` : "Chưa có gara nào."}
          </p>
          <div className="mt-4 space-y-2">
            {garages.slice(0, 3).map((g) => (
              <div key={g.id} className="flex justify-between text-xs">
                <span className="truncate">{g.name ?? g.garageName}</span>
              </div>
            ))}
          </div>
          <Link to="/quan-tri/reports" className="mt-7 block rounded-xl bg-white py-3 text-center text-xs font-bold text-blue-700">Xem báo cáo</Link>
        </article>
      </section>
    </div>
  );
}
