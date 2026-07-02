import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import StatusBadge from "../../common/StatusBadge";
import Pagination from "../../common/Pagination";
import { formatDate, formatTime } from "@/lib/format";

const PAGE_SIZE = 10;

export function RecentBookingsTable({ bookings = [] }) {
  const [page, setPage] = useState(1);

  const pageItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return bookings.slice(start, start + PAGE_SIZE);
  }, [bookings, page]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
      <div className="flex justify-between items-center p-5 pb-4">
        <h3 className="font-extrabold text-slate-800">Danh sách lịch đặt</h3>
        <Link to="/quan-tri/bookings" className="text-xs font-bold text-blue-600 hover:underline">
          Xem tất cả lịch hẹn
        </Link>
      </div>
      <div className="overflow-x-auto px-5">
        <table className="w-full text-left text-xs whitespace-nowrap">
          <thead>
            <tr className="border-b border-slate-200 text-slate-400">
              <th className="py-3 px-2 font-bold uppercase tracking-wider">Mã lịch</th>
              <th className="py-3 px-2 font-bold uppercase tracking-wider">Khách hàng</th>
              <th className="py-3 px-2 font-bold uppercase tracking-wider">Biển số</th>
              <th className="py-3 px-2 font-bold uppercase tracking-wider">Dịch vụ</th>
              <th className="py-3 px-2 font-bold uppercase tracking-wider">Chi nhánh</th>
              <th className="py-3 px-2 font-bold uppercase tracking-wider">Giờ hẹn</th>
              <th className="py-3 px-2 font-bold uppercase tracking-wider">Trạng thái</th>
              <th className="py-3 px-2 font-bold uppercase tracking-wider">Thanh toán</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {pageItems.length > 0 ? pageItems.map((booking) => (
              <tr key={booking.id} className="hover:bg-slate-50 transition-colors">
                <td className="py-3 px-2 font-bold text-slate-800">{booking.code}</td>
                <td className="py-3 px-2 font-semibold text-slate-700">{booking.customerName}</td>
                <td className="py-3 px-2">
                  <span className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-[10px] font-mono font-bold text-slate-700">
                    {booking.plate}
                  </span>
                </td>
                <td className="py-3 px-2 text-slate-600 truncate max-w-[150px]">{booking.serviceName}</td>
                <td className="py-3 px-2 text-slate-600 truncate max-w-[150px]">{booking.garageName}</td>
                <td className="py-3 px-2 text-slate-600">
                  {formatDate(booking.bookingDate)}
                  {booking.slotTime && <span className="ml-1 font-bold text-blue-600">{formatTime(booking.slotTime)}</span>}
                </td>
                <td className="py-3 px-2"><StatusBadge status={booking.bookingStatus} type="booking" /></td>
                <td className="py-3 px-2"><StatusBadge status={booking.paymentStatus} type="payment" /></td>
              </tr>
            )) : (
              <tr>
                <td colSpan="8" className="py-8 text-center text-slate-400">Chưa có lịch hẹn nào trong kỳ đã chọn.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Pagination page={page} pageSize={PAGE_SIZE} total={bookings.length} onPageChange={setPage} />
    </div>
  );
}
