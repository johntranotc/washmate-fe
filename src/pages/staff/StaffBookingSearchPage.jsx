import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAppStore } from "../../state/AppStore";

const statuses = [
  "ALL",
  "PENDING",
  "CONFIRMED",
  "CHECKED_IN",
  "WASHING",
  "COMPLETED",
  "CANCELLED",
  "NO_SHOW",
];

const statusLabels = {
  ALL: "Tất cả",
  PENDING: "Chờ thanh toán",
  CONFIRMED: "Đã xác nhận",
  CHECKED_IN: "Đã tiếp nhận",
  WASHING: "Đang rửa",
  COMPLETED: "Đã hoàn tất",
  CANCELLED: "Đã hủy",
  NO_SHOW: "Khách không đến",
};

const paymentLabels = {
  PENDING: "Chờ thanh toán",
  PAID: "Đã thanh toán",
  REFUNDED: "Đã hoàn tiền",
};

function StaffBookingSearchPage() {
  const { state } = useAppStore();
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("ALL");
  const bookings = useMemo(
    () =>
      state.bookings.filter((item) => {
        const text =
          `${item.code} ${item.customerName} ${item.phone} ${item.plate}`.toLowerCase();
        return (
          text.includes(keyword.toLowerCase()) &&
          (status === "ALL" || item.bookingStatus === status)
        );
      }),
    [keyword, state.bookings, status],
  );

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-extrabold">Tra cứu lịch đặt</h1>
        <p className="mt-2 text-xs text-slate-500">
          Xác minh khách hàng bằng mã đặt lịch, số điện thoại hoặc biển số xe.
        </p>
      </header>
      <section className="grid gap-3 rounded-xl border border-slate-200 bg-white p-5 md:grid-cols-[1fr_220px]">
        <label className="flex h-11 items-center gap-2 rounded-lg border border-slate-200 px-3">
          <Search size={16} className="text-slate-400" />
          <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="Tìm kiếm lịch đặt..."
            className="w-full border-0 bg-transparent text-xs outline-none"
          />
        </label>
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="h-11 rounded-lg border border-slate-200 px-3 text-xs"
        >
          {statuses.map((item) => (
            <option key={item} value={item}>
              {statusLabels[item]}
            </option>
          ))}
        </select>
      </section>
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="divide-y divide-slate-100">
          {bookings.map((booking) => (
            <article
              key={booking.id}
              className="grid gap-4 p-5 md:grid-cols-[1.2fr_1fr_1fr_auto] md:items-center"
            >
              <div>
                <div className="flex gap-2">
                  <b>{booking.code}</b>
                  <span className="rounded-full bg-blue-50 px-2 py-1 text-[8px] font-bold text-blue-700">
                    {statusLabels[booking.bookingStatus] || booking.bookingStatus}
                  </span>
                </div>
                <p className="mt-2 text-xs font-semibold">
                  {booking.customerName}
                </p>
                <p className="text-[9px] text-slate-500">{booking.phone}</p>
              </div>
              <div className="text-xs">
                <b>{booking.vehicle}</b>
                <p className="text-[9px] text-slate-500">{booking.plate}</p>
              </div>
              <div className="text-xs">
                <b>{booking.bookingDate}</b>
                <p className="text-[9px] text-slate-500">
                  {booking.slotTime} ·{" "}
                  {paymentLabels[booking.paymentStatus] || booking.paymentStatus}
                </p>
              </div>
              <Link
                to={`/staff/bookings/${booking.id}/workflow`}
                className="rounded-lg bg-blue-600 px-4 py-2 text-center text-[10px] font-bold text-white"
              >
                Mở quy trình
              </Link>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export default StaffBookingSearchPage;
