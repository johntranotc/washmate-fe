import { CheckCircle2, Clock3, Droplets, MessageSquare, TimerReset, UsersRound, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { staffApi } from "@/api/staffApi";
import DemoDataNotice from "@/components/customer/DemoDataNotice";
import {
  confirmStaffBooking,
  getStaffDemoBookings,
  rejectStaffBooking,
} from "@/lib/staff-demo-store";
import {
  bookingStatusLabels,
  bookingStatusTone,
  normalizeBookingList,
  normalizeStaffBooking,
} from "@/lib/staff-booking-data";
import { cn } from "@/lib/utils";

export default function StaffQueuePage() {
  const [bookings, setBookings] = useState([]);
  const [isMock, setIsMock] = useState(false);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  function load() {
    staffApi
      .getTodayBookings()
      .then((data) => {
        setBookings(normalizeBookingList(data).map(normalizeStaffBooking));
      })
      .catch(() => {
        setBookings(getStaffDemoBookings());
        setIsMock(true);
      });
  }

  useEffect(() => {
    load();
  }, []);

  function handleConfirm(bookingId) {
    const updated = confirmStaffBooking(bookingId);
    setBookings(updated);
  }

  function handleReject(bookingId) {
    const updated = rejectStaffBooking(bookingId, rejectReason.trim());
    setBookings(updated);
    setRejectingId(null);
    setRejectReason("");
  }

  const pending = bookings.filter(
    (b) => b.bookingStatus === "PENDING_STAFF_CONFIRMATION",
  );
  const queue = bookings.filter((b) =>
    ["CONFIRMED", "CHECKED_IN", "WASHING"].includes(b.bookingStatus),
  );

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
          Khu vực vận hành
        </p>
        <h1 className="mt-2 text-3xl font-extrabold">Hàng đợi</h1>
        <p className="mt-2 text-sm text-slate-500">
          Xác nhận yêu cầu đặt lịch và theo dõi xe đang xử lý.
        </p>
      </header>

      {isMock && <DemoDataNotice />}

      {/* Stats */}
      <section className="grid gap-4 sm:grid-cols-3">
        {[
          [UsersRound, "Chờ xác nhận", pending.length, "text-orange-500"],
          [Droplets, "Đang xử lý", queue.length, "text-blue-600"],
          [TimerReset, "Thời gian trung bình", "31 phút", "text-emerald-600"],
        ].map(([Icon, label, value, color]) => (
          <article
            key={label}
            className="rounded-2xl border border-slate-200 bg-white p-5"
          >
            <Icon className={color} size={20} />
            <p className="mt-4 text-xs text-slate-500">{label}</p>
            <b className="mt-1 block text-2xl">{value}</b>
          </article>
        ))}
      </section>

      {/* Pending confirmation section */}
      {pending.length > 0 && (
        <section className="space-y-3">
          <h2 className="flex items-center gap-2 text-base font-extrabold text-slate-700">
            <span className="flex size-5 items-center justify-center rounded-full bg-orange-500 text-[10px] font-extrabold text-white">
              {pending.length}
            </span>
            Chờ gara xác nhận
          </h2>
          <div className="overflow-hidden rounded-2xl border border-orange-200 bg-orange-50">
            <div className="divide-y divide-orange-100">
              {pending.map((item) => (
                <article key={item.id} className="p-5">
                  {/* Reject modal */}
                  {rejectingId === item.id && (
                    <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4">
                      <p className="mb-2 text-sm font-bold text-red-700">
                        Nhập lý do từ chối (không bắt buộc)
                      </p>
                      <textarea
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        rows={2}
                        placeholder="Ví dụ: Slot đã đầy, gara bảo trì..."
                        className="w-full resize-none rounded-lg border border-red-200 bg-white p-3 text-sm outline-none focus:border-red-400"
                      />
                      <div className="mt-3 flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleReject(item.id)}
                          className="rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white"
                        >
                          Xác nhận từ chối
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setRejectingId(null);
                            setRejectReason("");
                          }}
                          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600"
                        >
                          Hủy
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-orange-100 text-orange-600">
                      <Clock3 size={18} />
                    </span>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <b className="text-sm">{item.code}</b>
                        <span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-[10px] font-extrabold text-orange-700">
                          {bookingStatusLabels.PENDING_STAFF_CONFIRMATION}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-600">
                        {item.customerName} · {item.phone}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {item.vehicle} · {item.plate} · {item.serviceName}
                      </p>
                      <p className="mt-0.5 text-xs font-semibold text-slate-500">
                        {item.garageName} · {item.bookingDate} {item.slotTime && `lúc ${item.slotTime}`}
                      </p>
                      {item.note && (
                        <p className="mt-1 flex items-start gap-1 text-xs italic text-slate-400">
                          <MessageSquare size={11} className="mt-0.5 shrink-0" />
                          {item.note}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex shrink-0 flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleConfirm(item.id)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-700"
                      >
                        <CheckCircle2 size={14} /> Xác nhận lịch
                      </button>
                      <button
                        type="button"
                        onClick={() => setRejectingId(item.id)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50"
                      >
                        <XCircle size={14} /> Từ chối
                      </button>
                      <Link
                        to={`/nhan-vien/danh-sach/${item.id}`}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
                      >
                        Chi tiết
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Active queue section */}
      <section className="space-y-3">
        <h2 className="text-base font-extrabold text-slate-700">Đang xử lý</h2>
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {queue.length === 0 ? (
            <p className="py-14 text-center text-sm text-slate-500">
              Không có xe đang chờ xử lý.
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {queue.map((item) => (
                <article
                  key={item.id}
                  className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center"
                >
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600">
                    <Clock3 size={18} />
                  </span>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <b className="text-sm">
                        {item.slotTime} · {item.customerName}
                      </b>
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-0.5 text-[10px] font-extrabold",
                          bookingStatusTone[item.bookingStatus] ||
                            "bg-slate-100 text-slate-600",
                        )}
                      >
                        {bookingStatusLabels[item.bookingStatus]}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      {item.vehicle} · {item.plate} · {item.serviceName}
                    </p>
                  </div>
                  <Link
                    to={`/nhan-vien/danh-sach/${item.id}`}
                    className="rounded-xl bg-blue-600 px-4 py-2.5 text-center text-xs font-bold text-white"
                  >
                    Xử lý
                  </Link>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
