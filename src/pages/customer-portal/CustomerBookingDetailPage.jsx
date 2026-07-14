import { ArrowLeft, CalendarClock, CalendarDays, Car, Droplets, Gift, MapPin, NotebookText, XCircle } from "lucide-react";
import PageContainer from "@/components/shared/PageContainer";
import PageHeader from "@/components/shared/PageHeader";
import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { confirmDialog } from "@/components/shared/ConfirmDialog";
import { bookingApi } from "@/api/bookingApi";
import { bookingSlotApi } from "@/api/bookingSlotApi";
import { paymentApi } from "@/api/paymentApi";
import { BookingTimeline } from "@/components/customer/BookingTimeline";
import { PaymentStatusCard } from "@/components/customer/PaymentStatusCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  formatBookingDate,
  formatMoney,
  normalizeBooking,
  normalizePayment,
} from "@/lib/customer-booking-data";
import { loadCustomerBookingList } from "@/lib/customer-bookings";

export default function CustomerBookingDetailPage() {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [showReschedule, setShowReschedule] = useState(false);

  const loadDetail = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [bookingResult, paymentResult] = await Promise.allSettled([
        bookingApi.getBookingById(bookingId),
        paymentApi.getPaymentByBookingId(bookingId),
      ]);
      if (bookingResult.status === "rejected") throw bookingResult.reason;
      const normalized = normalizeBooking(bookingResult.value);
      if (paymentResult.status === "fulfilled") {
        const payment = normalizePayment(paymentResult.value);
        setBooking(normalizeBooking({ ...normalized, payment, paymentStatus: payment.status }));
      } else {
        setBooking(normalized);
      }
    } catch {
      setError("Không thể tải dữ liệu lịch đặt.");
      setBooking(null);
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  // BE chỉ cho hủy/đổi lịch khi PENDING/CONFIRMED và chưa thanh toán (đã thanh toán phải hoàn tiền tại quầy).
  const canCancel =
    booking &&
    ["PENDING", "CONFIRMED"].includes(String(booking.bookingStatus || "").toUpperCase()) &&
    String(booking.paymentStatus || "").toUpperCase() !== "PAID";
  const canReschedule =
    canCancel && booking.garageId != null && booking.serviceId != null && booking.vehicleId != null;

  async function handleCancel() {
    const ok = await confirmDialog({
      title: "Hủy lịch đặt này?",
      description: `Lịch ${booking.code} sẽ bị hủy và khung giờ được trả lại cho gara. Thao tác này không thể hoàn tác.`,
      confirmLabel: "Hủy lịch",
      destructive: true,
    });
    if (!ok) return;
    setCancelling(true);
    try {
      await bookingApi.cancelBooking(bookingId);
      toast.success("Đã hủy lịch đặt", { description: booking.code });
      await loadDetail();
    } catch (e) {
      toast.error("Không thể hủy lịch", { description: e?.message || "Vui lòng thử lại." });
    } finally {
      setCancelling(false);
    }
  }

  useEffect(() => {
    function refreshOnFocus() {
      if (document.visibilityState === "visible") loadDetail();
    }

    window.addEventListener("focus", loadDetail);
    document.addEventListener("visibilitychange", refreshOnFocus);
    return () => {
      window.removeEventListener("focus", loadDetail);
      document.removeEventListener("visibilitychange", refreshOnFocus);
    };
  }, [loadDetail]);

  if (loading) {
    return <div className="mx-auto max-w-5xl p-8"><div className="rounded-2xl bg-card p-12 text-center text-muted-foreground">Đang tải chi tiết lịch đặt...</div></div>;
  }

  if (!booking) {
    return (
      <div className="mx-auto max-w-5xl p-8">
        <div className="rounded-2xl border border-critical/25 bg-critical-container p-10 text-center">
          <h1 className="text-xl font-extrabold text-critical">Không tìm thấy lịch đặt</h1>
          <p className="mt-2 text-sm text-critical">{error}</p>
          <Button onClick={loadDetail} className="mt-5 bg-critical text-white hover:bg-critical/90">Thử lại</Button>
        </div>
      </div>
    );
  }

  const details = [
    [Car, "Xe", booking.vehicle],
    [Car, "Biển số", booking.plate],
    [Droplets, "Dịch vụ", booking.serviceName],
    [MapPin, "Gara", booking.garageName],
    [MapPin, "Địa chỉ gara", booking.garageAddress],
    [CalendarDays, "Ngày hẹn", formatBookingDate(booking.bookingDate)],
    [CalendarDays, "Khung giờ", `${booking.slotTime}${booking.endTime ? ` - ${booking.endTime}` : ""}`],
    [NotebookText, "Ghi chú", booking.note || "Không có ghi chú"],
  ];

  return (
    <PageContainer variant="customer">
      <Link to="/khach-hang/lich-dat" className="inline-flex items-center gap-2 text-sm font-bold text-primary"><ArrowLeft size={16} /> Quay lại lịch đặt</Link>
      <PageHeader
        title="Chi tiết lịch đặt"
        description={booking.code}
        actions={<StatusBadge status={booking.bookingStatus} />}
      />

      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold">Tiến trình lịch đặt</h2>
            <p className="mt-1 text-sm text-muted-foreground">Trạng thái được cập nhật theo quá trình thanh toán và chăm sóc xe.</p>
          </div>
        </div>
        <BookingTimeline booking={booking} />
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-extrabold">Thông tin lịch đặt</h2>
          <dl className="mt-6 grid gap-5 sm:grid-cols-2">
            {details.map(([Icon, label, value]) => (
              <div key={label} className="flex gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><Icon size={18} /></span>
                <div>
                  <dt className="text-xs font-semibold text-muted-foreground">{label}</dt>
                  <dd className="mt-1 font-bold">{value}</dd>
                </div>
              </div>
            ))}
          </dl>
          <div className="mt-7 flex items-center justify-between rounded-2xl bg-surface p-5">
            <span className="font-bold">Tổng tiền tạm tính</span>
            <strong className="text-xl text-primary">{formatMoney(booking.finalAmount)}</strong>
          </div>
        </section>
        <PaymentStatusCard booking={booking} />
      </div>

      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><Gift size={18} /></span>
          <div>
            <h2 className="text-lg font-extrabold">Điểm thưởng</h2>
            {booking.bookingStatus === "COMPLETED" && booking.paymentStatus === "PAID" ? (
              <p className="mt-1 text-sm text-muted-foreground">
                Bạn đã được cộng điểm thưởng cho lịch đặt này. Xem tại{" "}
                <Link to="/khach-hang/diem-thanh-vien" className="font-bold text-primary">trang Điểm thành viên</Link>.
              </p>
            ) : (
              <p className="mt-1 text-sm text-muted-foreground">
                Điểm thưởng sẽ được cộng sau khi lịch đặt hoàn tất và thanh toán thành công.{" "}
                <Link to="/khach-hang/diem-thanh-vien" className="font-bold text-primary">Xem điểm thành viên</Link>.
              </p>
            )}
          </div>
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <Button variant="outline" size="lg" render={<Link to="/khach-hang" />}>Quay về trang khách hàng</Button>
        <Button variant="outline" size="lg" render={<Link to="/khach-hang/lich-dat" />}>Xem lịch đặt</Button>
        <Button size="lg" render={<Link to="/khach-hang/dat-lich-moi" />}>Đặt lịch mới</Button>
        {canReschedule && (
          <Button variant="outline" size="lg" onClick={() => setShowReschedule(true)}>
            <CalendarClock size={18} /> Đổi lịch hẹn
          </Button>
        )}
        {canCancel && (
          <Button
            variant="outline"
            size="lg"
            onClick={handleCancel}
            disabled={cancelling}
            className="text-critical hover:bg-critical-container"
          >
            <XCircle size={18} /> {cancelling ? "Đang hủy..." : "Hủy lịch"}
          </Button>
        )}
      </div>

      <RescheduleDialog
        booking={booking}
        open={showReschedule}
        onOpenChange={setShowReschedule}
        onDone={loadDetail}
      />
    </PageContainer>
  );
}

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/**
 * Đổi ngày + khung giờ của lịch đặt — PUT /bookings/{id}.
 * Giữ nguyên gara/dịch vụ/xe; BE kiểm tra lại slot trống, trùng lịch và trạng thái.
 */
function RescheduleDialog({ booking, open, onOpenChange, onDone }) {
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotId, setSlotId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    const initial = String(booking?.bookingDate || "").slice(0, 10);
    setDate(initial && initial >= todayISO() ? initial : todayISO());
    setSlotId(null);
    setError("");
  }, [open, booking]);

  useEffect(() => {
    if (!open || !date || booking?.garageId == null) return;
    let alive = true;
    setLoadingSlots(true);
    bookingSlotApi
      .getAvailable({ garageId: booking.garageId, date })
      .then((res) => {
        if (!alive) return;
        const list = Array.isArray(res) ? res : res?.content || res?.data || [];
        setSlots(list);
      })
      .catch(() => alive && setSlots([]))
      .finally(() => alive && setLoadingSlots(false));
    return () => { alive = false; };
  }, [open, date, booking?.garageId]);

  async function handleSubmit() {
    if (!slotId) { setError("Vui lòng chọn khung giờ mới."); return; }
    setError("");
    setSaving(true);
    try {
      await bookingApi.updateBooking(booking.id, {
        garageId: booking.garageId,
        slotId,
        serviceId: booking.serviceId,
        vehicleId: booking.vehicleId,
        bookingDate: date,
      });
      toast.success("Đã đổi lịch hẹn", { description: booking.code });
      onOpenChange(false);
      onDone?.();
    } catch (e) {
      setError(e?.message || "Không thể đổi lịch. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  }

  const isSameSlot = (s) =>
    String(s.slotId ?? s.id) === String(booking?.slotId) &&
    String(booking?.bookingDate || "").slice(0, 10) === date;

  return (
    <AlertDialog open={open} onOpenChange={(next) => { if (!saving) onOpenChange(next); }}>
      <AlertDialogContent className="max-h-[85vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle>Đổi lịch hẹn</AlertDialogTitle>
          <AlertDialogDescription>
            Chọn ngày và khung giờ mới cho lịch {booking?.code}. Gara, dịch vụ và xe giữ nguyên.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="mt-4 space-y-4">
          {error && (
            <p className="rounded-xl border border-critical/25 bg-critical-container px-3 py-2 text-xs font-bold text-critical">
              {error}
            </p>
          )}

          <div>
            <label className="text-xs font-bold text-foreground">Ngày hẹn mới</label>
            <input
              type="date"
              value={date}
              min={todayISO()}
              onChange={(e) => { setDate(e.target.value); setSlotId(null); }}
              className="mt-1.5 h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-ring"
            />
          </div>

          <div>
            <p className="text-xs font-bold text-foreground">Khung giờ</p>
            {loadingSlots ? (
              <p className="mt-2 py-4 text-center text-xs text-neutral-muted">Đang tải khung giờ...</p>
            ) : slots.length === 0 ? (
              <p className="mt-2 py-4 text-center text-xs text-neutral-muted">
                Ngày này chưa có khung giờ hoạt động. Vui lòng chọn ngày khác.
              </p>
            ) : (
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {slots.map((s) => {
                  const id = s.slotId ?? s.id;
                  const full = s.available === false || (s.availableCapacity != null && Number(s.availableCapacity) <= 0);
                  const current = isSameSlot(s);
                  const selected = String(slotId) === String(id);
                  return (
                    <button
                      key={id}
                      type="button"
                      disabled={full || current}
                      onClick={() => setSlotId(id)}
                      className={`rounded-xl border px-2 py-2.5 text-xs font-bold transition ${
                        selected
                          ? "border-primary bg-primary text-white"
                          : full || current
                            ? "cursor-not-allowed border-border bg-muted text-neutral-muted"
                            : "border-input bg-background text-foreground hover:border-primary"
                      }`}
                    >
                      {String(s.startTime || "").slice(0, 5)} – {String(s.endTime || "").slice(0, 5)}
                      {current && <span className="block text-[10px] font-semibold">Khung giờ hiện tại</span>}
                      {full && !current && <span className="block text-[10px] font-semibold">Đã đầy</span>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={saving}>Đóng</AlertDialogCancel>
          <Button size="lg" onClick={handleSubmit} disabled={saving || !slotId}>
            {saving ? "Đang đổi lịch..." : "Xác nhận đổi lịch"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
