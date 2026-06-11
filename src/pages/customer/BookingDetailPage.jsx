import { Check, Circle, Clock3 } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useAppStore } from "../../state/AppStore";

const steps = [
  ["PENDING", "Đã tạo lịch"],
  ["CONFIRMED", "Đã xác nhận thanh toán"],
  ["CHECKED_IN", "Đã tiếp nhận xe"],
  ["WASHING", "Đang thực hiện dịch vụ"],
  ["COMPLETED", "Đã hoàn tất dịch vụ"],
];

const statusLabels = {
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

function BookingDetailPage() {
  const { bookingId } = useParams();
  const { state, actions } = useAppStore();
  const booking = state.bookings.find((item) => item.id === Number(bookingId));

  if (!booking) return <div className="rounded-xl bg-white p-8">Không tìm thấy lịch đặt.</div>;
  const currentIndex = steps.findIndex(([status]) => status === booking.bookingStatus);

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-[9px] font-bold text-blue-600">CHI TIẾT ĐẶT LỊCH</p><h1 className="mt-2 text-2xl font-extrabold">{booking.code}</h1><p className="mt-2 text-xs text-slate-500">{booking.garageName}</p></div>
        <span className="w-fit rounded-full bg-blue-50 px-3 py-2 text-[9px] font-bold text-blue-700">{statusLabels[booking.bookingStatus] || booking.bookingStatus}</span>
      </header>

      <div className="grid gap-5 lg:grid-cols-[1fr_330px]">
        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="font-extrabold">Tiến trình dịch vụ</h2>
          <div className="mt-6 space-y-0">
            {steps.map(([status, label], index) => {
              const done = currentIndex >= index || booking.bookingStatus === "COMPLETED";
              return (
                <div key={status} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <span className={`grid h-6 w-6 place-items-center rounded-full ${done ? "bg-blue-600 text-white" : "border border-slate-300 text-slate-300"}`}>{done ? <Check size={13} /> : <Circle size={10} />}</span>
                    {index < steps.length - 1 && <span className={`h-12 w-0.5 ${done ? "bg-blue-300" : "bg-slate-200"}`} />}
                  </div>
                  <div><b className="text-xs">{label}</b><p className="mt-1 text-[9px] text-slate-400">{statusLabels[status]}</p></div>
                </div>
              );
            })}
          </div>
        </section>

        <aside className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="font-extrabold">Tóm tắt</h2>
            <dl className="mt-4 space-y-3 text-xs">
              <div><dt className="text-slate-400">Phương tiện</dt><dd className="mt-1 font-bold">{booking.vehicle} · {booking.plate}</dd></div>
              <div><dt className="text-slate-400">Dịch vụ</dt><dd className="mt-1 font-bold">{booking.serviceName}</dd></div>
              <div><dt className="text-slate-400">Lịch hẹn</dt><dd className="mt-1 flex items-center gap-2 font-bold"><Clock3 size={13} /> {booking.bookingDate} · {booking.slotTime}</dd></div>
              <div><dt className="text-slate-400">Thanh toán</dt><dd className="mt-1 font-bold">{paymentLabels[booking.paymentStatus] || booking.paymentStatus}</dd></div>
            </dl>
          </div>
          {booking.paymentStatus !== "PAID" && <Link to={`/customer/bookings/${booking.id}/payment`} className="block rounded-lg bg-blue-600 py-3 text-center text-xs font-bold text-white">Hoàn tất thanh toán</Link>}
          {booking.invoiceStatus !== "NOT_ISSUED" && <Link to={`/customer/bookings/${booking.id}/invoice`} className="block rounded-lg border border-blue-200 bg-white py-3 text-center text-xs font-bold text-blue-700">Xem hóa đơn</Link>}
          {["PENDING", "CONFIRMED"].includes(booking.bookingStatus) && <button onClick={() => actions.cancelBooking(booking.id)} className="w-full rounded-lg border border-rose-200 py-3 text-xs font-bold text-rose-600">Hủy lịch đặt</button>}
        </aside>
      </div>
    </div>
  );
}

export default BookingDetailPage;

