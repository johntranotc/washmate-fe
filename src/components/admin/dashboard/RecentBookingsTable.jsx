import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import StatusBadge from "@/components/shared/StatusBadge";
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
    <div className="bg-card rounded-2xl border border-border shadow-sm">
      <div className="flex justify-between items-center p-5 pb-4">
        <h3 className="font-extrabold text-foreground">Danh sách lịch đặt</h3>
        <Link to="/quan-tri/bookings" className="text-xs font-bold text-primary hover:underline">
          Xem tất cả lịch hẹn
        </Link>
      </div>
      <div className="overflow-x-auto px-5">
        <table className="w-full text-left text-xs whitespace-nowrap">
          <thead>
            <tr className="border-b border-border text-neutral-muted">
              <th className="py-3 px-2 font-semibold">Mã lịch</th>
              <th className="py-3 px-2 font-semibold">Khách hàng</th>
              <th className="py-3 px-2 font-semibold">Biển số</th>
              <th className="py-3 px-2 font-semibold">Dịch vụ</th>
              <th className="py-3 px-2 font-semibold">Chi nhánh</th>
              <th className="py-3 px-2 font-semibold">Giờ hẹn</th>
              <th className="py-3 px-2 font-semibold">Trạng thái</th>
              <th className="py-3 px-2 font-semibold">Thanh toán</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {pageItems.length > 0 ? pageItems.map((booking) => (
              <tr key={booking.id} className="hover:bg-surface transition-colors">
                <td className="py-3 px-2 font-bold text-foreground">{booking.code}</td>
                <td className="py-3 px-2 font-semibold text-ink-soft">{booking.customerName}</td>
                <td className="py-3 px-2">
                  <span className="bg-muted border border-border px-2 py-0.5 rounded text-xs font-mono font-bold text-ink-soft">
                    {booking.plate}
                  </span>
                </td>
                <td className="py-3 px-2 text-muted-foreground truncate max-w-[150px]">{booking.serviceName}</td>
                <td className="py-3 px-2 text-muted-foreground truncate max-w-[150px]">{booking.garageName}</td>
                <td className="py-3 px-2 text-muted-foreground">
                  {formatDate(booking.bookingDate)}
                  {booking.slotTime && <span className="ml-1 font-bold text-primary">{formatTime(booking.slotTime)}</span>}
                </td>
                <td className="py-3 px-2"><StatusBadge status={booking.bookingStatus} type="booking" size="sm" /></td>
                <td className="py-3 px-2"><StatusBadge status={booking.paymentStatus} type="payment" size="sm" /></td>
              </tr>
            )) : (
              <tr>
                <td colSpan="8" className="py-8 text-center text-neutral-muted">Chưa có lịch hẹn nào trong kỳ đã chọn.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Pagination page={page} pageSize={PAGE_SIZE} total={bookings.length} onPageChange={setPage} />
    </div>
  );
}
