import { ArrowRight, Search } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { staffApi } from "@/api/staffApi";

import { normalizeBookingList, normalizeStaffBooking } from "@/lib/staff-booking-data";
import { bookingStatusLabels } from "@/lib/status-tones";
import { cn } from "@/lib/utils";
import StatusBadge from "@/components/shared/StatusBadge";
import Pagination from "@/components/common/Pagination";
import { formatDate, formatTime } from "@/lib/format";

const PAGE_SIZE = 10;

const STATUS_FILTERS = [
  "ALL",
  "PENDING",
  "CONFIRMED",
  "CHECKED_IN",
  "WASHING",
  "COMPLETED",
  "REJECTED",
  "NO_SHOW",
  "CANCELLED",
];

const filterLabels = {
  ALL: "Tất cả",
  ...bookingStatusLabels,
};

export default function StaffBookingListPage() {
  const [searchParams] = useSearchParams();
  const [bookings, setBookings] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState(searchParams.get("status") || "ALL");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const load = useCallback(() => {
    setLoading(true);
    staffApi
      .getAllBookings()
      .then((response) => {
        console.log("[StaffBookingList] getAllBookings raw response:", response);
        const list = normalizeBookingList(response).map(normalizeStaffBooking);
        console.log("[StaffBookingList] normalized count:", list.length);
        setBookings(list);
      })
      .catch((error) => {
        console.error("Failed to load bookings:", error);
        setBookings([]);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    function refreshOnFocus() {
      if (document.visibilityState === "visible") load();
    }

    window.addEventListener("focus", load);
    document.addEventListener("visibilitychange", refreshOnFocus);
    return () => {
      window.removeEventListener("focus", load);
      document.removeEventListener("visibilitychange", refreshOnFocus);
    };
  }, [load]);

  const visibleBookings = useMemo(
    () =>
      bookings.filter((item) => {
        const text =
          `${item.code} ${item.customerName} ${item.phone} ${item.plate}`.toLowerCase();
        return (
          text.includes(keyword.toLowerCase()) &&
          (status === "ALL" || item.bookingStatus === status)
        );
      }),
    [bookings, keyword, status],
  );

  // Reset về trang 1 khi đổi bộ lọc / từ khoá / dữ liệu.
  useEffect(() => {
    setPage(1);
  }, [keyword, status, bookings]);

  const pagedBookings = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return visibleBookings.slice(start, start + PAGE_SIZE);
  }, [visibleBookings, page]);

  const pendingCount = bookings.filter(
    (b) => b.bookingStatus === "PENDING",
  ).length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Vận hành hôm nay"
        title="Danh sách lịch đặt"
        description="Tra cứu và xử lý booking theo đúng vòng đời dịch vụ."
      />



      {/* Pending alert banner */}
      {pendingCount > 0 && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-warning/30 bg-warning-container px-5 py-4">
          <p className="text-sm font-bold text-warning">
            Có {pendingCount} booking đang chờ gara xác nhận
          </p>
          <Button
            size="sm"
            onClick={() => setStatus("PENDING")}
            className="bg-warning text-white hover:bg-warning/90"
          >
            Xem ngay
          </Button>
        </div>
      )}

      {/* Search & filter */}
      <section className="space-y-4 rounded-2xl border border-border bg-card p-4">
        <label className="flex h-11 items-center gap-2 rounded-xl border border-border px-3">
          <Search size={18} className="text-neutral-muted" />
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Tìm mã lịch, khách hàng, số điện thoại hoặc biển số..."
            className="w-full bg-transparent text-sm outline-none"
          />
        </label>
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setStatus(item)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-bold transition",
                status === item
                  ? "bg-primary text-white"
                  : "bg-muted text-muted-foreground hover:bg-border",
                item === "PENDING" &&
                  status !== item &&
                  pendingCount > 0 &&
                  "border border-warning/40 bg-warning-container text-warning",
              )}
            >
              {filterLabels[item]}
              {item === "PENDING" && pendingCount > 0 && (
                <span className="ml-1 inline-flex size-5 items-center justify-center rounded-full bg-warning text-xs font-extrabold text-white">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Table */}
      <section className="overflow-hidden rounded-2xl border border-border bg-card">
        {loading ? (
          <p className="py-16 text-center text-sm text-muted-foreground">
            Đang tải lịch đặt...
          </p>
        ) : visibleBookings.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted-foreground">
            Không có lịch đặt phù hợp.
          </p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-xs">
                <thead className="bg-surface text-xs font-semibold text-muted-foreground">
                  <tr>
                    <th className="p-4">Booking / Khách</th>
                    <th className="p-4">Xe</th>
                    <th className="p-4">Dịch vụ</th>
                    <th className="p-4">Khung giờ</th>
                    <th className="p-4">Trạng thái</th>
                    <th className="p-4">Thanh toán</th>
                    <th className="p-4">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {pagedBookings.map((booking) => (
                    <tr
                      key={booking.id}
                      className={cn(
                        booking.bookingStatus === "PENDING" && "bg-warning-container/50",
                      )}
                    >
                      <td className="p-4">
                        <b>{booking.code}</b>
                        <span className="mt-1 block text-muted-foreground">
                          {booking.customerName}
                        </span>
                        {booking.phone && (
                          <span className="block text-neutral-muted">{booking.phone}</span>
                        )}
                      </td>
                      <td className="p-4">
                        <b>{booking.vehicle}</b>
                        <span className="mt-1 block text-muted-foreground">{booking.plate}</span>
                      </td>
                      <td className="p-4">{booking.serviceName}</td>
                      <td className="p-4">
                        {formatDate(booking.bookingDate)}
                        <span className="mt-1 block font-bold text-primary">
                          {formatTime(booking.slotTime)}
                        </span>
                      </td>
                      <td className="p-4">
                        <StatusBadge status={booking.bookingStatus} type="booking" size="sm" />
                      </td>
                      <td className="p-4">
                        <StatusBadge status={booking.paymentStatus} type="payment" size="sm" />
                      </td>
                      <td className="p-4">
                        <Link
                          to={`/nhan-vien/danh-sach/${booking.id}`}
                          className="inline-flex items-center gap-1 font-bold text-primary hover:underline"
                        >
                          Xem chi tiết <ArrowRight size={14} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              page={page}
              pageSize={PAGE_SIZE}
              total={visibleBookings.length}
              onPageChange={setPage}
            />
          </>
        )}
      </section>
    </div>
  );
}
