import { ArrowRight, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { staffApi } from "@/api/staffApi";
import DemoDataNotice from "@/components/customer/DemoDataNotice";
import { getStaffDemoBookings } from "@/lib/staff-demo-store";
import {
  bookingStatusLabels,
  bookingStatusTone,
  normalizeBookingList,
  normalizeStaffBooking,
  paymentStatusLabels,
} from "@/lib/staff-booking-data";
import { formatBookingDate, formatMoney } from "@/lib/customer-booking-data";
import { cn } from "@/lib/utils";

function getPaymentTone(status) {
  switch (status) {
    case "PAID":
      return "bg-emerald-100 text-emerald-700";
    case "PENDING":
    case "UNPAID":
      return "bg-amber-100 text-amber-700";
    case "FAILED":
      return "bg-red-100 text-red-700";
    case "REFUNDED":
      return "bg-slate-100 text-slate-600";
    default:
      return "bg-slate-100 text-slate-600";
  }
}

const STATUS_FILTERS = [
  "ALL",
  "PENDING_STAFF_CONFIRMATION",
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
  const [isMock, setIsMock] = useState(false);

  useEffect(() => {
    staffApi
      .getTodayBookings()
      .then((response) => {
        setBookings(normalizeBookingList(response).map(normalizeStaffBooking));
        setIsMock(false);
      })
      .catch(() => {
        setBookings(getStaffDemoBookings());
        setIsMock(true);
      })
      .finally(() => setLoading(false));
  }, []);

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
    (b) => b.bookingStatus === "PENDING_STAFF_CONFIRMATION",
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

      {isMock && <DemoDataNotice />}

      {/* Pending alert banner */}
      {pendingCount > 0 && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4">
          <p className="text-sm font-bold text-orange-700">
            Có {pendingCount} booking đang chờ gara xác nhận
          </p>
          <button
            type="button"
            onClick={() => setStatus("PENDING_STAFF_CONFIRMATION")}
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
                item === "PENDING_STAFF_CONFIRMATION" &&
                  status !== item &&
                  pendingCount > 0 &&
                  "border border-orange-300 bg-orange-50 text-orange-700",
              )}
            >
              {filterLabels[item]}
              {item === "PENDING_STAFF_CONFIRMATION" && pendingCount > 0 && (
                <span className="ml-1 inline-flex size-4 items-center justify-center rounded-full bg-orange-500 text-[9px] font-extrabold text-white">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Table */}
      <section className="w-full">
        {loading ? (
          <p className="py-16 text-center text-sm text-slate-500">
            Đang tải lịch đặt...
          </p>
        ) : visibleBookings.length === 0 ? (
          <p className="py-16 text-center text-sm text-slate-500">
            Không có lịch đặt phù hợp.
          </p>
        ) : (
          <div className="w-full">
            <div className="hidden sm:grid text-[11px] uppercase font-bold text-slate-400 tracking-wider sm:grid-cols-[1.7fr_1.1fr_1.2fr_1.2fr_1.2fr] divide-x divide-slate-100 px-2 bg-white rounded-2xl border border-slate-200 mb-4 shadow-sm">
              <span className="px-4 py-3">Booking / Khách</span>
              <span className="px-4 py-3 text-center">Lịch hẹn</span>
              <span className="px-4 py-3 text-center">Thanh toán</span>
              <span className="px-4 py-3 text-center">Gara</span>
              <span className="px-4 py-3 text-center">Thao tác</span>
            </div>
            <div className="flex flex-col gap-4 mt-2">
              {visibleBookings.map((booking) => (
                <article
                  key={booking.id}
                  className={cn(
                    "grid sm:grid-cols-[1.7fr_1.1fr_1.2fr_1.2fr_1.2fr] items-stretch bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-blue-300 hover:shadow-md transition-all divide-y sm:divide-y-0 sm:divide-x divide-slate-100 overflow-hidden",
                    booking.bookingStatus === "PENDING_STAFF_CONFIRMATION" && "border-orange-200 bg-orange-50/30"
                  )}
                >
                  <div className="p-4 sm:p-5 min-w-0 flex flex-col">
                    <b className="text-sm text-blue-600 block mb-1">{booking.code}</b>
                    <p className="text-sm font-bold truncate">{booking.customerName}</p>
                    {booking.phone && <p className="text-xs text-slate-500 truncate mt-0.5">{booking.phone}</p>}
                    <p className="text-xs text-slate-600 mt-1 truncate">
                      {booking.vehicle} · {booking.plate}
                    </p>
                    <p className="text-xs text-slate-500 truncate">{booking.serviceName}</p>
                  </div>

                  <div className="p-4 sm:p-5 min-w-0 flex flex-col items-center text-center">
                    <p className="text-[10px] text-slate-400 uppercase font-bold mb-1 sm:hidden">Lịch hẹn</p>
                    <p className="font-bold text-sm">{formatBookingDate(booking.bookingDate)}</p>
                    <p className="text-xs text-blue-600 font-semibold mt-0.5">{booking.slotTime}</p>
                  </div>

                  <div className="p-4 sm:p-5 min-w-0 flex flex-col items-center text-center">
                    <p className="text-[10px] text-slate-400 uppercase font-bold mb-1 sm:hidden">Thanh toán</p>
                    <span className={cn("px-3 py-1.5 rounded-full text-[10px] font-extrabold inline-block", getPaymentTone(booking.paymentStatus))}>
                      {paymentStatusLabels[booking.paymentStatus] || booking.paymentStatus}
                    </span>
                    <p className="text-sm font-bold mt-1.5">{formatMoney(booking.finalAmount)}</p>
                  </div>

                  <div className="p-4 sm:p-5 min-w-0 flex flex-col items-center text-center">
                    <p className="text-[10px] text-slate-400 uppercase font-bold mb-1 sm:hidden">Gara</p>
                    <span
                      className={cn(
                        "inline-block rounded-full px-3 py-1.5 text-[10px] font-extrabold",
                        bookingStatusTone[booking.bookingStatus] || "bg-slate-100 text-slate-600"
                      )}
                    >
                      {bookingStatusLabels[booking.bookingStatus] || booking.bookingStatus}
                    </span>
                    <p className="text-[11px] text-slate-500 mt-1.5 truncate">{booking.garageName}</p>
                  </div>

                  <div className="p-4 sm:p-5 flex flex-col items-center text-center">
                    <Link
                      to={`/nhan-vien/danh-sach/${booking.id}`}
                      className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 transition-all"
                    >
                      Xử lý <ArrowRight size={13} />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
