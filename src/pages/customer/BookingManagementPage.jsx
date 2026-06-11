import { CalendarDays, Eye, Plus, XCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAppStore } from "../../state/AppStore";

const filters = [
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
  WASHING: "Đang thực hiện",
  COMPLETED: "Đã hoàn tất",
  CANCELLED: "Đã hủy",
  NO_SHOW: "Khách không đến",
};

const paymentLabels = {
  PENDING: "Chờ thanh toán",
  PAID: "Đã thanh toán",
  REFUNDED: "Đã hoàn tiền",
};

function BookingManagementPage() {
  const { state, actions } = useAppStore();
  const [filter, setFilter] = useState("ALL");
  const bookings = useMemo(
    () =>
      state.bookings.filter(
        (item) =>
          item.customerId === state.session?.id &&
          (filter === "ALL" || item.bookingStatus === filter),
      ),
    [filter, state.bookings, state.session?.id],
  );

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold">Lịch đặt của tôi</h1>
          <p className="mt-2 text-xs text-slate-500">
            Theo dõi thanh toán, tiến độ dịch vụ và lịch sử đặt lịch.
          </p>
        </div>
        <Link
          to="/customer/bookings/create"
          className="flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-xs font-bold text-white"
        >
          <Plus size={15} /> Đặt lịch mới
        </Link>
      </header>

      <div className="flex gap-2 overflow-x-auto rounded-xl border border-slate-200 bg-white p-2">
        {filters.map((item) => (
          <button
            key={item}
            onClick={() => setFilter(item)}
            className={`whitespace-nowrap rounded-lg px-3 py-2 text-[9px] font-bold ${
              filter === item
                ? "bg-blue-600 text-white"
                : "text-slate-500 hover:bg-blue-50"
            }`}
          >
            {statusLabels[item]}
          </button>
        ))}
      </div>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {bookings.length === 0 ? (
          <div className="p-12 text-center">
            <CalendarDays className="mx-auto text-blue-300" size={36} />
            <h2 className="mt-4 font-bold">Không tìm thấy lịch đặt</h2>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {bookings.map((booking) => (
              <article
                key={booking.id}
                className="grid gap-4 p-5 md:grid-cols-[1.2fr_1fr_1fr_auto] md:items-center"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <strong>{booking.code}</strong>
                    <span className="rounded-full bg-blue-50 px-2 py-1 text-[8px] font-bold text-blue-700">
                      {statusLabels[booking.bookingStatus] || booking.bookingStatus}
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-semibold">{booking.vehicle}</p>
                  <p className="text-[10px] text-slate-500">{booking.plate}</p>
                </div>
                <div className="text-[10px]">
                  <b className="block">{booking.serviceName}</b>
                  <span className="mt-1 block text-slate-500">
                    {booking.garageName}
                  </span>
                </div>
                <div className="text-[10px]">
                  <b className="block">{booking.bookingDate}</b>
                  <span className="mt-1 block text-slate-500">
                    {booking.slotTime} · {paymentLabels[booking.paymentStatus] || booking.paymentStatus}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Link
                    to={`/customer/bookings/${booking.id}`}
                    className="grid h-9 w-9 place-items-center rounded-lg bg-blue-50 text-blue-600"
                  >
                    <Eye size={15} />
                  </Link>
                  {["PENDING", "CONFIRMED"].includes(booking.bookingStatus) && (
                    <button
                      onClick={() => actions.cancelBooking(booking.id)}
                      className="grid h-9 w-9 place-items-center rounded-lg bg-rose-50 text-rose-600"
                    >
                      <XCircle size={15} />
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default BookingManagementPage;

