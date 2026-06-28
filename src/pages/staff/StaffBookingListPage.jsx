import { ArrowRight, Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { staffApi } from "@/api/staffApi";

import {
  bookingStatusLabels,
  bookingStatusTone,
  normalizeBookingList,
  normalizeStaffBooking,
  paymentStatusLabels,
} from "@/lib/staff-booking-data";
import { cn } from "@/lib/utils";

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

  const pendingCount = bookings.filter(
    (b) => b.bookingStatus === "PENDING",
  ).length;

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
          Vận hành hôm nay
        </p>
        <h1 className="mt-2 text-3xl font-extrabold">Danh sách lịch đặt</h1>
        <p className="mt-2 text-sm text-slate-500">
          Tra cứu và xử lý booking theo đúng vòng đời dịch vụ.
        </p>
      </header>



      {/* Pending alert banner */}
      {pendingCount > 0 && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4">
          <p className="text-sm font-bold text-orange-700">
            Có {pendingCount} booking đang chờ gara xác nhận
          </p>
          <button
            type="button"
            onClick={() => setStatus("PENDING")}
            className="rounded-xl bg-orange-500 px-3 py-1.5 text-xs font-bold text-white"
          >
            Xem ngay
          </button>
        </div>
      )}

      {/* Search & filter */}
      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4">
        <label className="flex h-11 items-center gap-2 rounded-xl border border-slate-200 px-3">
          <Search size={17} className="text-slate-400" />
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
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200",
                item === "PENDING" &&
                  status !== item &&
                  pendingCount > 0 &&
                  "border border-orange-300 bg-orange-50 text-orange-700",
              )}
            >
              {filterLabels[item]}
              {item === "PENDING" && pendingCount > 0 && (
                <span className="ml-1 inline-flex size-4 items-center justify-center rounded-full bg-orange-500 text-[9px] font-extrabold text-white">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Table */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {loading ? (
          <p className="py-16 text-center text-sm text-slate-500">
            Đang tải lịch đặt...
          </p>
        ) : visibleBookings.length === 0 ? (
          <p className="py-16 text-center text-sm text-slate-500">
            Không có lịch đặt phù hợp.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-xs">
              <thead className="bg-slate-50 text-[10px] uppercase text-slate-500">
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
              <tbody className="divide-y divide-slate-100">
                {visibleBookings.map((booking) => (
                  <tr
                    key={booking.id}
                    className={cn(
                      booking.bookingStatus === "PENDING" &&
                        "bg-orange-50/50",
                    )}
                  >
                    <td className="p-4">
                      <b>{booking.code}</b>
                      <span className="mt-1 block text-slate-500">
                        {booking.customerName}
                      </span>
                      {booking.phone && (
                        <span className="block text-slate-400">
                          {booking.phone}
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <b>{booking.vehicle}</b>
                      <span className="mt-1 block text-slate-500">
                        {booking.plate}
                      </span>
                    </td>
                    <td className="p-4">{booking.serviceName}</td>
                    <td className="p-4">
                      {booking.bookingDate}
                      <span className="mt-1 block font-bold text-blue-600">
                        {booking.slotTime}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-1 text-[10px] font-extrabold",
                          bookingStatusTone[booking.bookingStatus] ||
                            "bg-slate-100 text-slate-600",
                        )}
                      >
                        {bookingStatusLabels[booking.bookingStatus] ||
                          booking.bookingStatus}
                      </span>
                    </td>
                    <td className="p-4">
                      {paymentStatusLabels[booking.paymentStatus] ||
                        booking.paymentStatus}
                    </td>
                    <td className="p-4">
                      <Link
                        to={`/nhan-vien/danh-sach/${booking.id}`}
                        className="inline-flex items-center gap-1 font-bold text-blue-600 hover:underline"
                      >
                        Xem chi tiết <ArrowRight size={13} />
                      </Link>
                    </td>
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
