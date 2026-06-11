import {
  CheckCircle2,
  CircleAlert,
  Clock3,
  Droplets,
  LogIn,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useAppStore } from "../../state/AppStore";

const statusLabels = {
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

const actionByStatus = {
  CONFIRMED: {
    next: "CHECKED_IN",
    label: "Tiếp nhận khách hàng",
    icon: LogIn,
  },
  CHECKED_IN: {
    next: "WASHING",
    label: "Bắt đầu rửa xe",
    icon: Droplets,
  },
  WASHING: {
    next: "COMPLETED",
    label: "Hoàn tất dịch vụ",
    icon: CheckCircle2,
  },
};

function StaffWorkflowPage() {
  const { bookingId } = useParams();
  const { state, actions } = useAppStore();
  const booking = state.bookings.find((item) => item.id === Number(bookingId));

  if (!booking) {
    return <div className="rounded-xl bg-white p-8">Không tìm thấy lịch đặt.</div>;
  }

  const action = actionByStatus[booking.bookingStatus];
  const ActionIcon = action?.icon;
  const operationDetails = [
    ["Cơ sở", booking.garageName],
    ["Dịch vụ", booking.serviceName],
    ["Lịch hẹn", `${booking.bookingDate} · ${booking.slotTime}`],
    ["Thanh toán", paymentLabels[booking.paymentStatus] || booking.paymentStatus],
  ];

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[9px] font-bold text-blue-600">QUY TRÌNH DỊCH VỤ</p>
          <h1 className="mt-2 text-2xl font-extrabold">{booking.code}</h1>
          <p className="mt-2 text-xs text-slate-500">
            {booking.customerName} · {booking.vehicle} · {booking.plate}
          </p>
        </div>
        <span className="w-fit rounded-full bg-blue-50 px-3 py-2 text-[9px] font-bold text-blue-700">
          {statusLabels[booking.bookingStatus] || booking.bookingStatus}
        </span>
      </header>

      {booking.paymentStatus !== "PAID" && (
        <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800">
          <CircleAlert size={18} />
          Quy trình bị khóa cho đến khi thanh toán thành công.
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="font-extrabold">Thông tin vận hành</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {operationDetails.map(([label, value]) => (
              <div key={label} className="rounded-lg bg-slate-50 p-4">
                <span className="text-[9px] text-slate-400">{label}</span>
                <b className="mt-1 block text-xs">{value}</b>
              </div>
            ))}
          </div>
          <div className="mt-5 space-y-3 text-xs">
            <p className="flex justify-between border-b border-slate-100 pb-3">
              <span className="text-slate-500">Thời gian tiếp nhận</span>
              <b>
                {booking.checkinTime
                  ? new Date(booking.checkinTime).toLocaleString("vi-VN")
                  : "Chưa ghi nhận"}
              </b>
            </p>
            <p className="flex justify-between border-b border-slate-100 pb-3">
              <span className="text-slate-500">Bắt đầu dịch vụ</span>
              <b>
                {booking.serviceStartTime
                  ? new Date(booking.serviceStartTime).toLocaleString("vi-VN")
                  : "Chưa ghi nhận"}
              </b>
            </p>
            <p className="flex justify-between">
              <span className="text-slate-500">Thời gian hoàn tất</span>
              <b>
                {booking.completedTime
                  ? new Date(booking.completedTime).toLocaleString("vi-VN")
                  : "Chưa ghi nhận"}
              </b>
            </p>
          </div>
        </section>

        <aside className="rounded-xl border border-slate-200 bg-white p-6">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-blue-50 text-blue-600">
            <Clock3 />
          </span>
          <h2 className="mt-4 font-extrabold">Thao tác tiếp theo</h2>
          <p className="mt-2 text-xs leading-5 text-slate-500">
            {action
              ? `Chuyển lịch đặt từ “${
                  statusLabels[booking.bookingStatus]
                }” sang “${statusLabels[action.next]}”.`
              : "Quy trình này đã kết thúc."}
          </p>
          {action && (
            <button
              disabled={booking.paymentStatus !== "PAID"}
              onClick={() => actions.transitionBooking(booking.id, action.next)}
              className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 text-xs font-bold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              <ActionIcon size={16} /> {action.label}
            </button>
          )}
          {booking.bookingStatus === "CONFIRMED" && (
            <button
              onClick={() => actions.transitionBooking(booking.id, "NO_SHOW")}
              className="mt-3 w-full rounded-lg border border-rose-200 py-3 text-xs font-bold text-rose-600"
            >
              Đánh dấu không đến
            </button>
          )}
          <Link
            to="/staff/bookings"
            className="mt-3 block text-center text-[10px] font-bold text-blue-600"
          >
            Quay lại tra cứu
          </Link>
        </aside>
      </div>
    </div>
  );
}

export default StaffWorkflowPage;
