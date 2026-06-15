import { CalendarDays, CheckCircle2, CircleSlash, Clock3, Droplets, ListTodo } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { staffApi } from "../../api/staffApi";
import DemoDataNotice from "../../components/customer/DemoDataNotice";
import { getStaffDemoBookings } from "../../lib/staff-demo-store";
import { bookingStatusLabels, normalizeBookingList, normalizeStaffBooking } from "../../lib/staff-booking-data";

export default function StaffDashboardPage() {
  const [bookings, setBookings] = useState([]);
  const [isMock, setIsMock] = useState(false);

  useEffect(() => {
    staffApi.getTodayBookings().then((data) => {
      setBookings(normalizeBookingList(data).map(normalizeStaffBooking));
    }).catch(() => {
      setBookings(getStaffDemoBookings());
      setIsMock(true);
    });
  }, []);

  const count = (status) => bookings.filter((item) => item.bookingStatus === status).length;
  const metrics = [
    [CalendarDays, "Lịch hôm nay", bookings.length],
    [Clock3, "Chờ check-in", count("CONFIRMED")],
    [Droplets, "Đang rửa", count("WASHING")],
    [CheckCircle2, "Hoàn tất hôm nay", count("COMPLETED")],
    [CircleSlash, "Không đến", count("NO_SHOW")],
  ];
  const nextBookings = bookings.filter((item) => ["CONFIRMED", "CHECKED_IN", "WASHING"].includes(item.bookingStatus)).slice(0, 4);

  return (
    <div className="space-y-6">
      <header><p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">Trung tâm vận hành</p><h1 className="mt-2 text-3xl font-extrabold">Xin chào nhân viên</h1><p className="mt-2 text-sm text-slate-500">Theo dõi công việc và lịch phục vụ trong ngày.</p></header>
      {isMock && <DemoDataNotice />}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">{metrics.map(([Icon, label, value]) => <article key={label} className="rounded-2xl border border-slate-200 bg-white p-5"><Icon className="text-blue-600" size={20} /><p className="mt-4 text-xs text-slate-500">{label}</p><b className="mt-1 block text-2xl">{value}</b></article>)}</section>
      <section className="grid gap-5 lg:grid-cols-[1.4fr_0.6fr]">
        <article className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between"><h2 className="font-extrabold">Việc cần làm tiếp theo</h2><Link to="/staff/bookings" className="text-xs font-bold text-blue-600">Xem tất cả</Link></div>
          <div className="mt-4 space-y-3">{nextBookings.length ? nextBookings.map((item) => <Link key={item.id} to={`/staff/bookings/${item.id}`} className="flex items-center gap-4 rounded-xl bg-slate-50 p-4 hover:bg-blue-50"><span className="grid h-10 w-10 place-items-center rounded-xl bg-white text-blue-600"><ListTodo size={18} /></span><div className="flex-1"><b className="text-sm">{item.code} · {item.customerName}</b><p className="mt-1 text-xs text-slate-500">{item.slotTime} · {item.vehicle} · {item.serviceName}</p></div><span className="text-[10px] font-bold text-blue-600">{bookingStatusLabels[item.bookingStatus]}</span></Link>) : <p className="py-10 text-center text-sm text-slate-500">Không còn việc cần xử lý.</p>}</div>
        </article>
        <aside className="rounded-2xl bg-gradient-to-br from-blue-700 to-cyan-500 p-6 text-white"><p className="text-xs text-blue-100">Thao tác nhanh</p><h2 className="mt-2 text-2xl font-black">Sẵn sàng tiếp nhận xe?</h2><p className="mt-3 text-xs leading-5 text-blue-100">Mở danh sách lịch đã xác nhận để check-in khách đúng khung giờ.</p><Link to="/staff/bookings" className="mt-6 block rounded-xl bg-white py-3 text-center text-xs font-bold text-blue-700">Mở lịch hôm nay</Link></aside>
      </section>
    </div>
  );
}
