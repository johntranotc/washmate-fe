import { ArrowRight, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { staffApi } from "../../api/staffApi";
import DemoDataNotice from "../../components/customer/DemoDataNotice";

import {
  bookingStatusLabels,
  normalizeBookingList,
  normalizeStaffBooking,
  paymentStatusLabels,
} from "../../lib/staff-booking-data";

const filters = ["ALL", "CONFIRMED", "CHECKED_IN", "WASHING", "COMPLETED", "NO_SHOW", "CANCELLED"];
const filterLabels = { ALL: "Tất cả", ...bookingStatusLabels };

export default function StaffBookingSearchPage() {
  const [searchParams] = useSearchParams();
  const [bookings, setBookings] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState(searchParams.get("status") || "ALL");
  const [loading, setLoading] = useState(true);
  

  useEffect(() => {
    staffApi.getTodayBookings()
      .then((response) => {
        setBookings(normalizeBookingList(response).map(normalizeStaffBooking));
        
      })
      .catch(() => {
        setBookings([]);
        
      })
      .finally(() => setLoading(false));
  }, []);

  const visibleBookings = useMemo(() => bookings.filter((item) => {
    const text = `${item.code} ${item.customerName} ${item.phone} ${item.plate}`.toLowerCase();
    return text.includes(keyword.toLowerCase()) && (status === "ALL" || item.bookingStatus === status);
  }), [bookings, keyword, status]);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">Vận hành hôm nay</p>
        <h1 className="mt-2 text-3xl font-extrabold">Danh sách lịch đặt</h1>
        <p className="mt-2 text-sm text-slate-500">Tra cứu và xử lý booking theo đúng vòng đời dịch vụ.</p>
      </header>
      
      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4">
        <label className="flex h-11 items-center gap-2 rounded-xl border border-slate-200 px-3">
          <Search size={17} className="text-slate-400" />
          <input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="Tìm mã lịch, khách hàng, số điện thoại hoặc biển số..." className="w-full bg-transparent text-sm outline-none" />
        </label>
        <div className="flex flex-wrap gap-2">
          {filters.map((item) => <button key={item} onClick={() => setStatus(item)} className={`rounded-full px-4 py-2 text-xs font-bold ${status === item ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"}`}>{filterLabels[item]}</button>)}
        </div>
      </section>
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {loading ? <p className="py-16 text-center text-sm text-slate-500">Đang tải lịch đặt...</p> : visibleBookings.length === 0 ? <p className="py-16 text-center text-sm text-slate-500">Không có lịch đặt phù hợp.</p> : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-xs">
              <thead className="bg-slate-50 text-[10px] uppercase text-slate-500"><tr><th className="p-4">Booking / Khách</th><th className="p-4">Xe</th><th className="p-4">Dịch vụ</th><th className="p-4">Khung giờ</th><th className="p-4">Trạng thái</th><th className="p-4">Thanh toán</th><th className="p-4">Thao tác</th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {visibleBookings.map((booking) => (
                  <tr key={booking.id}>
                    <td className="p-4"><b>{booking.code}</b><span className="mt-1 block text-slate-500">{booking.customerName}</span></td>
                    <td className="p-4"><b>{booking.vehicle}</b><span className="mt-1 block text-slate-500">{booking.plate}</span></td>
                    <td className="p-4">{booking.serviceName}</td>
                    <td className="p-4">{booking.bookingDate}<span className="mt-1 block font-bold text-blue-600">{booking.slotTime}</span></td>
                    <td className="p-4"><span className="rounded-full bg-blue-50 px-2.5 py-1 font-bold text-blue-700">{bookingStatusLabels[booking.bookingStatus]}</span></td>
                    <td className="p-4">{paymentStatusLabels[booking.paymentStatus]}</td>
                    <td className="p-4"><Link to={`/staff/bookings/${booking.id}`} className="inline-flex items-center gap-1 font-bold text-blue-600">Xem chi tiết <ArrowRight size={13} /></Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
