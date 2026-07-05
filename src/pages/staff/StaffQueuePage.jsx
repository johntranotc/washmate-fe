import { CheckCircle2, Clock3, Droplets, MessageSquare, RefreshCw, UsersRound, XCircle } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { staffApi } from "@/api/staffApi";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { confirmDialog } from "@/components/shared/ConfirmDialog";
import { StatusBadge } from "@/components/shared/StatusBadge";

import { normalizeBookingList, normalizeStaffBooking } from "@/lib/staff-booking-data";
import { bookingStatusLabels } from "@/lib/status-tones";

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
      toast.error("Xác nhận thất bại", { description: msg });
      setConfirmError({ bookingId, message: msg });
    } finally {
      setConfirmingId(null);
    }
  }

  async function handleReject(bookingId) {
    if (!rejectReason.trim()) {
      toast.error("Vui lòng nhập lý do từ chối (bắt buộc).");
      return;
    }

    const confirmed = await confirmDialog({
      title: "Từ chối lịch đặt này?",
      description: `Lý do: ${rejectReason.trim()}`,
      confirmLabel: "Từ chối lịch",
      destructive: true,
    });
    if (!confirmed) {
      return;
    }

    try {
      await staffApi.rejectBooking(bookingId, { reason: rejectReason });
      toast.success("Đã từ chối lịch đặt.");
      setBookings((items) =>
        items.map((item) =>
          String(item.id) === String(bookingId)
            ? { ...item, bookingStatus: "REJECTED" }
            : item
        )
      );
    } catch (error) {
      console.error("Failed to reject booking:", error);
      toast.error("Từ chối thất bại", { description: error?.message || "Lỗi không xác định" });
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
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <RefreshCw className="animate-spin mb-3" size={28} />
        <p className="text-sm">Đang tải hàng đợi...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="rounded-2xl border border-critical/25 bg-critical-container p-8 text-center">
        <p className="text-sm font-bold text-critical">{loadError}</p>
        <Button
          size="sm"
          onClick={load}
          className="mt-4 bg-critical text-white hover:bg-critical/90"
        >
          Thử lại
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Khu vực vận hành"
        title="Hàng đợi"
        description="Xác nhận yêu cầu đặt lịch và theo dõi xe đang xử lý."
        actions={
          <Button variant="outline" size="sm" onClick={load} title="Tải lại danh sách">
            <RefreshCw /> Tải lại
          </Button>
        }
      />

      {/* Stats */}
      <section className="grid gap-4 sm:grid-cols-4">
        {[
          [UsersRound, "Chờ xác nhận", pending.length, "text-warning"],
          [Droplets, "Đang xử lý", queue.length, "text-primary"],
          [XCircle, "Từ chối", rejectedCount, "text-critical"],
          [XCircle, "Hủy", cancelledCount, "text-muted-foreground"],
        ].map(([Icon, label, value, color]) => (
          <article
            key={label}
            className="rounded-2xl border border-border bg-card p-5"
          >
            <Icon className={color} size={20} />
            <p className="mt-4 text-xs text-muted-foreground">{label}</p>
            <b className="mt-1 block text-2xl">{value}</b>
          </article>
        ))}
      </section>

      {/* Pending section */}
      <section id="pending" className="space-y-3 scroll-mt-20">
        <h2 className="flex items-center gap-2 text-base font-extrabold text-ink-soft">
          {pending.length > 0 && (
            <span className="flex size-5 items-center justify-center rounded-full bg-warning text-xs font-extrabold text-white">
              {pending.length}
            </span>
          )}
          Chờ gara xác nhận
        </h2>

        {pending.length === 0 ? (
          <p className="rounded-2xl border border-border bg-card py-10 text-center text-sm text-neutral-muted">
            Không có lịch đặt nào đang chờ xác nhận.
          </p>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-warning/30 bg-warning-container">
            <div className="divide-y divide-warning-container">
              {pending.map((item, index) => (
                <article key={item.id} className="p-5">
                  {/* Reject modal */}
                  {rejectingId === item.id && (
                    <div className="mb-4 rounded-xl border border-critical/25 bg-critical-container p-4">
                      <p className="mb-2 text-sm font-bold text-critical">
                        Nhập lý do từ chối (bắt buộc)
                      </p>
                      <textarea
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        rows={2}
                        placeholder="Ví dụ: Slot đã đầy, gara bảo trì..."
                        className="w-full resize-none rounded-lg border border-critical/25 bg-card p-3 text-sm outline-none focus:border-critical"
                      />
                      <div className="mt-3 flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleReject(item.id)}
                          className="bg-critical text-white hover:bg-critical/90"
                        >
                          Xác nhận từ chối
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setRejectingId(null);
                            setRejectReason("");
                          }}
                        >
                          Hủy
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-warning-container text-warning">
                      <Clock3 size={18} />
                    </span>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-neutral-muted">#{index + 1}</span>
                        <b className="text-sm">{item.code}</b>
                        <span className="rounded-full bg-warning-container px-2.5 py-0.5 text-xs font-extrabold text-warning">
                          {bookingStatusLabels.PENDING}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {item.customerName} · {item.phone}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {item.vehicle} · {item.plate} · {item.serviceName}
                      </p>
                      <p className="mt-0.5 text-xs font-semibold text-muted-foreground">
                        {item.garageName} · {item.bookingDate} {item.slotTime && `lúc ${item.slotTime}`}
                      </p>
                      {confirmError?.bookingId === item.id && (
                        <p className="mt-2 rounded-xl border border-critical/25 bg-card px-3 py-2 text-xs font-bold text-critical">
                          {confirmError.message}
                        </p>
                      )}
                      {item.note && (
                        <p className="mt-1 flex items-start gap-1 text-xs italic text-neutral-muted">
                          <MessageSquare size={14} className="mt-0.5 shrink-0" />
                          {item.note}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex shrink-0 flex-wrap gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleConfirm(item.id)}
                        disabled={confirmingId === item.id}
                        className="bg-success text-white hover:bg-success/90"
                      >
                        <CheckCircle2 /> {confirmingId === item.id ? "Đang xác nhận..." : "Xác nhận lịch"}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setRejectingId(item.id)}
                      >
                        <XCircle /> Từ chối
                      </Button>
                      <Link
                        to={`/nhan-vien/danh-sach/${item.id}`}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-bold text-muted-foreground hover:bg-surface"
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
        <h2 className="text-base font-extrabold text-ink-soft">Đang xử lý</h2>
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          {queue.length === 0 ? (
            <p className="py-14 text-center text-sm text-muted-foreground">
              Không có xe đang chờ xử lý.
            </p>
          ) : (
            <div className="divide-y divide-border">
              {queue.map((item, index) => (
                <article
                  key={item.id}
                  className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center"
                >
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary-container text-primary">
                    <Clock3 size={18} />
                  </span>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-neutral-muted">#{index + 1}</span>
                      <b className="text-sm">
                        {item.code} · {item.slotTime} · {item.customerName}
                      </b>
                      <StatusBadge status={item.bookingStatus} size="sm" />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {item.vehicle} · {item.plate} · {item.serviceName}
                    </p>
                  </div>
                  <Link
                    to={`/nhan-vien/danh-sach/${item.id}`}
                    className="rounded-xl bg-primary px-4 py-2.5 text-center text-xs font-bold text-white"
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
          <h2 className="text-base font-extrabold text-critical">Lịch bị từ chối</h2>
          <div className="overflow-hidden rounded-2xl border border-critical/25 bg-card">
            <div className="divide-y divide-critical-container">
              {rejected.map((item, index) => (
                <article
                  key={item.id}
                  className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center"
                >
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-critical-container text-critical">
                    <XCircle size={18} />
                  </span>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-neutral-muted">#{index + 1}</span>
                      <b className="text-sm text-muted-foreground">
                        {item.code} · {item.slotTime} · {item.customerName}
                      </b>
                      <StatusBadge status={item.bookingStatus} size="sm" />
                    </div>
                    <p className="mt-1 text-xs text-neutral-muted">
                      {item.vehicle} · {item.plate} · {item.serviceName}
                    </p>
                  </div>
                  <Link
                    to={`/nhan-vien/danh-sach/${item.id}`}
                    className="rounded-xl border border-critical/25 bg-card px-4 py-2.5 text-center text-xs font-bold text-critical hover:bg-critical-container"
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
          <h2 className="text-base font-extrabold text-muted-foreground">Lịch khách hủy</h2>
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className="divide-y divide-border">
              {cancelled.map((item, index) => (
                <article
                  key={item.id}
                  className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center"
                >
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-surface text-neutral-muted">
                    <XCircle size={18} />
                  </span>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-neutral-muted">#{index + 1}</span>
                      <b className="text-sm text-muted-foreground">
                        {item.code} · {item.slotTime} · {item.customerName}
                      </b>
                      <StatusBadge status={item.bookingStatus} size="sm" />
                    </div>
                    <p className="mt-1 text-xs text-neutral-muted">
                      {item.vehicle} · {item.plate} · {item.serviceName}
                    </p>
                  </div>
                  <Link
                    to={`/nhan-vien/danh-sach/${item.id}`}
                    className="rounded-xl border border-border bg-card px-4 py-2.5 text-center text-xs font-bold text-muted-foreground hover:bg-surface"
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
