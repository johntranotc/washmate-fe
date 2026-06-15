import { CheckCircle2, CircleAlert, Clock3, Droplets, LogIn, UserX } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { staffApi } from "@/api/staffApi";
import DemoDataNotice from "@/components/customer/DemoDataNotice";
import { getStaffDemoBookings, updateStaffDemoBooking } from "@/lib/staff-demo-store";
import { bookingStatusLabels, normalizeStaffBooking, paymentStatusLabels } from "@/lib/staff-booking-data";

const actionByStatus = {
  CONFIRMED: { next: "CHECKED_IN", label: "Check-in khách", icon: LogIn, api: "checkInBooking" },
  CHECKED_IN: { next: "WASHING", label: "Bắt đầu rửa xe", icon: Droplets, api: "startWashing" },
  WASHING: { next: "COMPLETED", label: "Hoàn tất dịch vụ", icon: CheckCircle2, api: "completeBooking" },
};

export default function StaffBookingWorkflowPage() {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [isMock, setIsMock] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    staffApi.getStaffBookingById(bookingId).then((data) => setBooking(normalizeStaffBooking(data))).catch(() => {
      setBooking(getStaffDemoBookings().find((item) => String(item.id) === String(bookingId)) || null);
      setIsMock(true);
    }).finally(() => setLoading(false));
  }, [bookingId]);

  const transition = async (nextStatus, apiMethod) => {
    if (!booking || updating) return;
    setUpdating(true);
    try {
      await staffApi[apiMethod](booking.id);
      setBooking((item) => ({ ...item, bookingStatus: nextStatus }));
    } catch {
      const next = updateStaffDemoBooking(booking.id, nextStatus).find((item) => String(item.id) === String(booking.id));
      setBooking(next);
      setIsMock(true);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="rounded-2xl bg-white p-10 text-center text-sm text-slate-500">Đang tải chi tiết lịch đặt...</div>;
  if (!booking) return <div className="rounded-2xl bg-white p-10 text-center text-sm text-slate-500">Không tìm thấy lịch đặt.</div>;

  const action = actionByStatus[booking.bookingStatus];
  const ActionIcon = action?.icon;
  const terminal = ["COMPLETED", "CANCELLED", "NO_SHOW"].includes(booking.bookingStatus);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">Chi tiết vận hành</p><h1 className="mt-2 text-3xl font-extrabold">{booking.code}</h1><p className="mt-2 text-sm text-slate-500">{booking.customerName} · {booking.vehicle} · {booking.plate}</p></div><span className="w-fit rounded-full bg-blue-50 px-4 py-2 text-xs font-bold text-blue-700">{bookingStatusLabels[booking.bookingStatus]}</span></header>
      {isMock && <DemoDataNotice />}
      {booking.bookingStatus === "PENDING" && <div className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"><CircleAlert size={19} />Lịch này chưa thanh toán nên chưa thể check-in.</div>}
      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="font-extrabold">Thông tin booking</h2>
          <div className="grid gap-4 sm:grid-cols-2">{[
            ["Khách hàng", `${booking.customerName} · ${booking.phone}`],
            ["Xe", `${booking.vehicle} · ${booking.plate}`],
            ["Dịch vụ", booking.serviceName],
            ["Gara", booking.garageName],
            ["Ngày giờ", `${booking.bookingDate} · ${booking.slotTime}`],
            ["Thanh toán", paymentStatusLabels[booking.paymentStatus]],
          ].map(([label, value]) => <div key={label} className="rounded-xl bg-slate-50 p-4"><p className="text-[10px] text-slate-400">{label}</p><b className="mt-1 block text-sm">{value}</b></div>)}</div>
          <div><p className="text-xs font-bold">Ghi chú</p><p className="mt-2 rounded-xl border border-slate-100 p-4 text-sm text-slate-500">{booking.note || "Không có ghi chú."}</p></div>
          <div><h2 className="font-extrabold">Dòng thời gian trạng thái</h2><div className="mt-4 grid gap-3 sm:grid-cols-3">{[["Check-in", booking.checkinTime], ["Bắt đầu rửa", booking.serviceStartTime], ["Hoàn tất", booking.completedTime]].map(([label, value]) => <div key={label} className="rounded-xl border border-slate-100 p-4"><Clock3 className="text-blue-600" size={16} /><p className="mt-2 text-xs font-bold">{label}</p><p className="mt-1 text-[10px] text-slate-500">{value ? new Date(value).toLocaleString("vi-VN") : "Chưa ghi nhận"}</p></div>)}</div></div>
        </section>
        <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="font-extrabold">Thao tác xử lý</h2>
          <p className="mt-2 text-xs leading-5 text-slate-500">{terminal ? (booking.bookingStatus === "COMPLETED" ? "Dịch vụ đã hoàn tất." : "Lịch đã kết thúc, không còn thao tác xử lý.") : action ? `Bước hợp lệ tiếp theo: ${action.label}.` : "Booking chưa đủ điều kiện xử lý."}</p>
          {action && <button disabled={updating} onClick={() => transition(action.next, action.api)} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-xs font-bold text-white disabled:bg-slate-300"><ActionIcon size={16} />{updating ? "Đang cập nhật..." : action.label}</button>}
          {booking.bookingStatus === "CONFIRMED" && <button disabled={updating} onClick={() => transition("NO_SHOW", "markNoShow")} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 py-3 text-xs font-bold text-rose-600"><UserX size={16} />Đánh dấu không đến</button>}
          <Link to="/staff/bookings" className="mt-4 block text-center text-xs font-bold text-blue-600">Quay lại danh sách</Link>
        </aside>
      </div>
    </div>
  );
}
