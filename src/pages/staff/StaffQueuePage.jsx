import { CheckCircle2, Clock3, Droplets, MessageSquare, RefreshCw, TimerReset, UsersRound, XCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { staffApi } from "@/api/staffApi";

import {
  bookingStatusLabels,
  bookingStatusTone,
  normalizeBookingList,
  normalizeStaffBooking,
} from "@/lib/staff-booking-data";
import { cn } from "@/lib/utils";

export default function StaffQueuePage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  // Lưu ID các booking đã confirm thành công ở FE để không bị reload ghi đè
  const confirmedIds = useRef(new Set());

  const [confirmingId, setConfirmingId] = useState(null);
  const [confirmError, setConfirmError] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  async function load() {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await staffApi.getAllBookings();
      const list = normalizeBookingList(data).map(normalizeStaffBooking).map((item) => {
        // Nếu DB vẫn trả PENDING nhưng FE đã confirm thành công → giữ CONFIRMED
        if (confirmedIds.current.has(String(item.id)) && item.bookingStatus === "PENDING") {
          return { ...item, bookingStatus: "CONFIRMED" };
        }
        // Nếu DB đã cập nhật CONFIRMED → xóa khỏi confirmedIds (không cần override nữa)
        if (confirmedIds.current.has(String(item.id)) && item.bookingStatus !== "PENDING") {
          confirmedIds.current.delete(String(item.id));
        }
        return item;
      });
      if (list.length > 0) {
        console.log("SAMPLE BOOKING DATA:", list[list.length - 1]);
      }
      setBookings(list);
    } catch (error) {
      console.error("[StaffQueue] load failed:", error);
      setLoadError(error?.message || "Không thể tải danh sách lịch đặt.");
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

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
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleConfirm(bookingId) {
    setConfirmingId(bookingId);
    setConfirmError(null);
    try {
      const response = await staffApi.confirmBooking(bookingId);
      // Đánh dấu đã confirm thành công ở FE (dù DB có thể chưa kịp lưu)
      confirmedIds.current.add(String(bookingId));
      // Cập nhật UI ngay: chuyển sang CONFIRMED
      setBookings((items) =>
        items.map((item) =>
          String(item.id) === String(bookingId)
            ? { ...item, bookingStatus: "CONFIRMED" }
            : item,
        ),
      );
    } catch (error) {
      console.error("[Confirm] ERROR=", error);
      const msg =
        error?.status === 403
          ? "403 - Không có quyền xác nhận. Kiểm tra lại tài khoản staff."
          : error?.status === 409
          ? "409 - Booking không còn PENDING. Tải lại danh sách."
          : `Lỗi ${error?.status || ""}: ${error?.message || "Không thể xác nhận lịch."}`;
      alert(`Xác nhận thất bại!\n${msg}`);
      setConfirmError({ bookingId, message: msg });
    } finally {
      setConfirmingId(null);
    }
  }

  async function handleReject(bookingId) {
    if (!rejectReason.trim()) {
      alert("Vui lòng nhập lý do từ chối (bắt buộc)!");
      return;
    }
    
    if (!window.confirm("Bạn có chắc chắn muốn từ chối lịch đặt này không?")) {
      return;
    }

    try {
      await staffApi.rejectBooking(bookingId, { reason: rejectReason });
      alert("Đã từ chối lịch đặt thành công.");
      setBookings((items) =>
        items.map((item) =>
          String(item.id) === String(bookingId)
            ? { ...item, bookingStatus: "REJECTED" }
            : item
        )
      );
    } catch (error) {
      console.error("Failed to reject booking:", error);
      alert(`Từ chối thất bại: ${error?.message || "Lỗi không xác định"}`);
    } finally {
      setRejectingId(null);
      setRejectReason("");
    }
  }

  const sortByNewest = (a, b) => {
    // Sort by id descending (highest id = newest)
    return Number(b.id) - Number(a.id);
  };

  const pending = bookings
    .filter((b) => b.bookingStatus === "PENDING")
    .sort(sortByNewest);
    
  const queue = bookings
    .filter((b) => ["CONFIRMED", "CHECKED_IN", "WASHING"].includes(b.bookingStatus))
    .sort(sortByNewest);

  const rejected = bookings
    .filter((b) => b.bookingStatus === "REJECTED")
    .sort(sortByNewest);

  const cancelled = bookings
    .filter((b) => b.bookingStatus === "CANCELLED")
    .sort(sortByNewest);

  const rejectedCount = bookings.filter((b) => b.bookingStatus === "REJECTED").length;
  const cancelledCount = bookings.filter((b) => b.bookingStatus === "CANCELLED").length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500">
        <RefreshCw className="animate-spin mb-3" size={28} />
        <p className="text-sm">Đang tải hàng đợi...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
        <p className="text-sm font-bold text-red-700">{loadError}</p>
        <button
          type="button"
          onClick={load}
          className="mt-4 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="flex items-end justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
            Khu vực vận hành
          </p>
          <h1 className="mt-2 text-3xl font-extrabold">Hàng đợi</h1>
          <p className="mt-2 text-sm text-slate-500">
            Xác nhận yêu cầu đặt lịch và theo dõi xe đang xử lý.
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          title="Tải lại danh sách"
          className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
        >
          <RefreshCw size={14} /> Tải lại
        </button>
      </header>

      {/* Stats */}
      <section className="grid gap-4 sm:grid-cols-4">
        {[
          [UsersRound, "Chờ xác nhận", pending.length, "text-orange-500"],
          [Droplets, "Đang xử lý", queue.length, "text-blue-600"],
          [XCircle, "Từ chối", rejectedCount, "text-red-600"],
          [XCircle, "Hủy", cancelledCount, "text-slate-500"],
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

      {/* Pending section */}
      <section id="pending" className="space-y-3 scroll-mt-20">
        <h2 className="flex items-center gap-2 text-base font-extrabold text-slate-700">
          {pending.length > 0 && (
            <span className="flex size-5 items-center justify-center rounded-full bg-orange-500 text-[10px] font-extrabold text-white">
              {pending.length}
            </span>
          )}
          Chờ gara xác nhận
        </h2>

        {pending.length === 0 ? (
          <p className="rounded-2xl border border-slate-100 bg-white py-10 text-center text-sm text-slate-400">
            Không có lịch đặt nào đang chờ xác nhận.
          </p>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-orange-200 bg-orange-50">
            <div className="divide-y divide-orange-100">
              {pending.map((item, index) => (
                <article key={item.id} className="p-5">
                  {/* Reject modal */}
                  {rejectingId === item.id && (
                    <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4">
                      <p className="mb-2 text-sm font-bold text-red-700">
                        Nhập lý do từ chối (bắt buộc)
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
                        <span className="font-bold text-slate-400">#{index + 1}</span>
                        <b className="text-sm">{item.code}</b>
                        <span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-[10px] font-extrabold text-orange-700">
                          {bookingStatusLabels.PENDING}
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
                      {confirmError?.bookingId === item.id && (
                        <p className="mt-2 rounded-xl border border-red-200 bg-white px-3 py-2 text-xs font-bold text-red-600">
                          {confirmError.message}
                        </p>
                      )}
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
                        disabled={confirmingId === item.id}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                      >
                        <CheckCircle2 size={14} /> {confirmingId === item.id ? "Đang xác nhận..." : "Xác nhận lịch"}
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
        )}
      </section>

      {/* Active queue section */}
      <section id="queue" className="space-y-3 scroll-mt-20">
        <h2 className="text-base font-extrabold text-slate-700">Đang xử lý</h2>
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {queue.length === 0 ? (
            <p className="py-14 text-center text-sm text-slate-500">
              Không có xe đang chờ xử lý.
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {queue.map((item, index) => (
                <article
                  key={item.id}
                  className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center"
                >
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600">
                    <Clock3 size={18} />
                  </span>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-slate-400">#{index + 1}</span>
                      <b className="text-sm">
                        {item.code} · {item.slotTime} · {item.customerName}
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
      {/* Rejected section */}
      {rejected.length > 0 && (
        <section id="rejected" className="space-y-3 mt-8 opacity-80 scroll-mt-20">
          <h2 className="text-base font-extrabold text-red-500">Lịch bị từ chối</h2>
          <div className="overflow-hidden rounded-2xl border border-red-200 bg-white">
            <div className="divide-y divide-red-100">
              {rejected.map((item, index) => (
                <article
                  key={item.id}
                  className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center"
                >
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-red-50 text-red-400">
                    <XCircle size={18} />
                  </span>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-slate-300">#{index + 1}</span>
                      <b className="text-sm text-slate-600">
                        {item.code} · {item.slotTime} · {item.customerName}
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
                    <p className="mt-1 text-xs text-slate-400">
                      {item.vehicle} · {item.plate} · {item.serviceName}
                    </p>
                  </div>
                  <Link
                    to={`/nhan-vien/danh-sach/${item.id}`}
                    className="rounded-xl border border-red-200 bg-white px-4 py-2.5 text-center text-xs font-bold text-red-600 hover:bg-red-50"
                  >
                    Chi tiết
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Cancelled section */}
      {cancelled.length > 0 && (
        <section id="cancelled" className="space-y-3 mt-8 opacity-70 scroll-mt-20">
          <h2 className="text-base font-extrabold text-slate-500">Lịch khách hủy</h2>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="divide-y divide-slate-100">
              {cancelled.map((item, index) => (
                <article
                  key={item.id}
                  className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center"
                >
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-slate-50 text-slate-400">
                    <XCircle size={18} />
                  </span>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-slate-300">#{index + 1}</span>
                      <b className="text-sm text-slate-600">
                        {item.code} · {item.slotTime} · {item.customerName}
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
                    <p className="mt-1 text-xs text-slate-400">
                      {item.vehicle} · {item.plate} · {item.serviceName}
                    </p>
                  </div>
                  <Link
                    to={`/nhan-vien/danh-sach/${item.id}`}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-center text-xs font-bold text-slate-600 hover:bg-slate-50"
                  >
                    Chi tiết
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
