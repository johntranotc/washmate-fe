import { CheckCircle2, CircleAlert, Clock3, Droplets, LogIn, UserX } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import PageHeader from "@/components/shared/PageHeader";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { staffApi } from "../../api/staffApi";

import { normalizeStaffBooking } from "../../lib/staff-booking-data";
import { paymentStatusLabels } from "../../lib/status-tones";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";

const actionByStatus = {
  CONFIRMED: { next: "CHECKED_IN", label: "Check-in khách", icon: LogIn, api: "checkInBooking" },
  CHECKED_IN: { next: "WASHING", label: "Bắt đầu rửa xe", icon: Droplets, api: "startWashing" },
  WASHING: { next: "COMPLETED", label: "Hoàn tất dịch vụ", icon: CheckCircle2, api: "completeBooking" },
};

export default function StaffWorkflowPage() {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    staffApi
      .getStaffBookingById(bookingId)
      .then((data) => setBooking(normalizeStaffBooking(data)))
      .catch((err) => {
        console.error("Failed to fetch booking details:", err);
        setError(err?.message || "Không thể tải chi tiết lịch đặt.");
      })
      .finally(() => setLoading(false));
  }, [bookingId]);

  const transition = async (nextStatus, apiMethod) => {
    if (!booking || updating) return;
    setUpdating(true);
    try {
      await staffApi[apiMethod](booking.id);
      setBooking((item) => ({ ...item, bookingStatus: nextStatus }));
    } catch (err) {
      console.error("Failed to update status:", err);
      toast.error("Không thể cập nhật trạng thái", { description: err?.message || "Vui lòng thử lại." });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="rounded-2xl bg-card p-10 text-center text-sm text-muted-foreground">Đang tải chi tiết lịch đặt...</div>;
  if (error) return <div className="rounded-2xl border border-critical/25 bg-critical-container p-10 text-center text-sm text-critical">{error}</div>;
  if (!booking) return <div className="rounded-2xl bg-card p-10 text-center text-sm text-muted-foreground">Không tìm thấy lịch đặt.</div>;

  const action = actionByStatus[booking.bookingStatus];
  const ActionIcon = action?.icon;
  const terminal = ["COMPLETED", "CANCELLED", "NO_SHOW"].includes(booking.bookingStatus);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Chi tiết vận hành"
        title={booking.code}
        description={`${booking.customerName} · ${booking.vehicle} · ${booking.plate}`}
        actions={<StatusBadge status={booking.bookingStatus} />}
      />

      {booking.bookingStatus === "PENDING" && (
        <div className="flex gap-3 rounded-2xl border border-warning/25 bg-warning-container p-4 text-sm text-warning">
          <CircleAlert size={18} />Lịch này đang chờ gara xác nhận nên chưa thể check-in.
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <section className="space-y-5 rounded-2xl border border-border bg-card p-6">
          <h2 className="font-extrabold">Thông tin booking</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ["Khách hàng", `${booking.customerName} · ${booking.phone}`],
              ["Xe", `${booking.vehicle} · ${booking.plate}`],
              ["Dịch vụ", booking.serviceName],
              ["Gara", booking.garageName],
              ["Ngày giờ", `${booking.bookingDate ?? "–"} · ${booking.slotTime ?? "–"}`],
              ["Thanh toán", paymentStatusLabels[booking.paymentStatus] ?? booking.paymentStatus],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl bg-surface p-4">
                <p className="text-xs text-neutral-muted">{label}</p>
                <b className="mt-1 block text-sm">{value}</b>
              </div>
            ))}
          </div>
          <div>
            <p className="text-xs font-bold">Ghi chú</p>
            <p className="mt-2 rounded-xl border border-border p-4 text-sm text-muted-foreground">{booking.note || "Không có ghi chú."}</p>
          </div>
          <div>
            <h2 className="font-extrabold">Dòng thời gian trạng thái</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {[
                ["Check-in", booking.checkinTime],
                ["Bắt đầu rửa", booking.serviceStartTime],
                ["Hoàn tất", booking.completedTime],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-border p-4">
                  <Clock3 className="text-primary" size={16} />
                  <p className="mt-2 text-xs font-bold">{label}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{value ? new Date(value).toLocaleString("vi-VN") : "Chưa ghi nhận"}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <aside className="h-fit rounded-2xl border border-border bg-card p-6">
          <h2 className="font-extrabold">Thao tác xử lý</h2>
          <p className="mt-2 text-xs leading-5 text-muted-foreground">
            {terminal
              ? booking.bookingStatus === "COMPLETED"
                ? "Dịch vụ đã hoàn tất."
                : "Lịch đã kết thúc, không còn thao tác xử lý."
              : action
              ? `Bước hợp lệ tiếp theo: ${action.label}.`
              : "Booking chưa đủ điều kiện xử lý."}
          </p>
          {action && (
            <Button
              size="lg"
              disabled={updating}
              onClick={() => transition(action.next, action.api)}
              className="mt-5 w-full"
            >
              <ActionIcon />
              {updating ? "Đang cập nhật..." : action.label}
            </Button>
          )}
          {booking.bookingStatus === "CONFIRMED" && (
            <Button
              variant="destructive"
              size="lg"
              disabled={updating}
              onClick={() => transition("NO_SHOW", "markNoShow")}
              className="mt-3 w-full"
            >
              <UserX />Đánh dấu không đến
            </Button>
          )}
          <Link to="/staff/bookings" className="mt-4 block text-center text-xs font-bold text-primary">
            Quay lại danh sách
          </Link>
        </aside>
      </div>
    </div>
  );
}
