import { Clock3, Droplets, TimerReset, UsersRound } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { staffApi } from "../../api/staffApi";
import DemoDataNotice from "../../components/customer/DemoDataNotice";
import { getStaffDemoBookings } from "../../lib/staff-demo-store";
import { normalizeBookingList, normalizeStaffBooking } from "../../lib/staff-booking-data";
import { getBookingStatusLabel } from "../../lib/status-labels";

export default function StaffQueuePage() {
  const [bookings, setBookings] = useState([]);
  const [isMock, setIsMock] = useState(false);
  useEffect(() => {
    staffApi.getTodayBookings().then((data) => setBookings(normalizeBookingList(data).map(normalizeStaffBooking))).catch(() => {
      setBookings(getStaffDemoBookings());
      setIsMock(true);
    });
  }, []);
  const queue = bookings.filter((item) => ["CONFIRMED", "CHECKED_IN", "WASHING"].includes(item.bookingStatus));
  return <div className="space-y-6"><header><p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">Khu vực vận hành</p><h1 className="mt-2 text-3xl font-extrabold">Đang xử lý</h1><p className="mt-2 text-sm text-slate-500">Theo dõi xe đang chờ, đã tiếp nhận và đang rửa.</p></header>{isMock && <DemoDataNotice />}<section className="grid gap-4 sm:grid-cols-3">{[[UsersRound,"Xe trong hàng đợi",queue.length],[Droplets,"Đang rửa",queue.filter((i)=>i.bookingStatus==="WASHING").length],[TimerReset,"Thời gian trung bình","31 phút"]].map(([Icon,label,value])=><article key={label} className="rounded-2xl border border-slate-200 bg-white p-5"><Icon className="text-blue-600" size={20}/><p className="mt-4 text-xs text-slate-500">{label}</p><b className="mt-1 block text-2xl">{value}</b></article>)}</section><section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">{queue.length===0?<p className="py-16 text-center text-sm text-slate-500">Không có xe đang chờ xử lý.</p>:<div className="divide-y divide-slate-100">{queue.map((item)=><article key={item.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center"><span className="grid h-11 w-11 place-items-center rounded-xl bg-blue-50 text-blue-600"><Clock3 size={18}/></span><div className="flex-1"><b>{item.slotTime} · {item.customerName}</b><p className="mt-1 text-xs text-slate-500">{item.vehicle} · {item.plate} · {item.serviceName}</p></div><span className="text-xs font-bold text-blue-600">{getBookingStatusLabel(item.bookingStatus)}</span><Link to={`/staff/bookings/${item.id}`} className="rounded-xl bg-blue-600 px-4 py-2.5 text-center text-xs font-bold text-white">Xử lý</Link></article>)}</div>}</section></div>;
}
