import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Plus, ArrowRight, ReceiptText, CreditCard } from "lucide-react";
import StatusBadge from "@/components/shared/StatusBadge";
import { formatDate, formatTime, formatMoney } from "@/lib/format";

// Trạng thái còn "sống" — được phép xuất hiện ở Lịch tiếp theo
const ACTIVE_STATUSES = ["PENDING", "CONFIRMED", "CHECKED_IN", "WASHING"];

function bookingDateTime(b) {
  if (!b.bookingDate) return null;
  const time = b.slotTime && /^\d{2}:\d{2}/.test(b.slotTime) ? b.slotTime.slice(0, 5) : "23:59";
  const dt = new Date(`${String(b.bookingDate).slice(0, 10)}T${time}:00`);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

/**
 * Lịch tiếp theo — CHỈ hiển thị booking có thời gian >= hiện tại (không lấp
 * bằng lịch quá khứ). Action theo trạng thái thanh toán thật:
 * PENDING → Thanh toán; FAILED/CANCELLED → Thanh toán lại; PAID → Xem hóa đơn.
 */
export function UpcomingBookings({ bookings = [] }) {
  const navigate = useNavigate();

  const next = useMemo(() => {
    const now = new Date();
    return bookings
      .filter((b) => ACTIVE_STATUSES.includes(b.bookingStatus || b.status))
      .map((b) => ({ b, dt: bookingDateTime(b) }))
      .filter(({ dt }) => dt && dt >= now)
      .sort((a, z) => a.dt - z.dt)[0]?.b || null;
  }, [bookings]);

  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-foreground">Lịch tiếp theo</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">Lịch rửa xe sắp tới gần nhất của bạn.</p>
        </div>
        <Button size="sm" onClick={() => navigate("/khach-hang/dat-lich-moi")}>
          <Plus /> Đặt lịch mới
        </Button>
      </div>

      {!next ? (
        <div className="mt-4 flex flex-col items-center rounded-xl border border-dashed border-border px-6 py-10 text-center">
          <Calendar size={36} className="text-border" />
          <p className="mt-3 text-sm font-semibold text-foreground">Bạn chưa có lịch rửa xe sắp tới</p>
          <p className="mt-1 text-xs text-muted-foreground">Đặt lịch mới để giữ xe luôn sạch đẹp.</p>
          <Button size="sm" className="mt-4" onClick={() => navigate("/khach-hang/dat-lich-moi")}>
            Đặt lịch ngay
          </Button>
        </div>
      ) : (
        <div className="mt-4 rounded-xl border border-border bg-surface p-4">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-bold text-foreground">{next.serviceName}</h3>
            <StatusBadge status={next.bookingStatus || next.status} type="booking" size="sm" />
            {next.paymentStatus && <StatusBadge status={next.paymentStatus} type="payment" size="sm" />}
          </div>

          <div className="mt-3 grid grid-cols-1 gap-3 text-xs sm:grid-cols-2">
            <div>
              <p className="text-muted-foreground">Thời gian</p>
              <p className="mt-0.5 font-bold text-foreground">
                {formatDate(next.bookingDate)}{formatTime(next.slotTime) ? ` · ${formatTime(next.slotTime)}` : ""}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Chi nhánh</p>
              <p className="mt-0.5 flex items-center gap-1 font-bold text-foreground">
                <MapPin size={12} className="shrink-0 text-primary" /> {next.garageName}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Xe</p>
              <p className="mt-0.5 font-bold text-foreground">
                {next.plate && next.plate !== "Chưa cập nhật" ? next.plate : "Xe của bạn"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Thanh toán</p>
              <p className="mt-0.5 font-bold text-foreground">
                {next.finalAmount != null ? formatMoney(next.finalAmount) : "—"}
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-3">
            {next.paymentStatus === "PENDING" && (
              <Button size="sm" onClick={() => navigate(`/khach-hang/thanh-toan/${next.id || next.bookingId}`)}>
                <CreditCard /> Thanh toán
              </Button>
            )}
            {(next.paymentStatus === "FAILED" || next.paymentStatus === "CANCELLED") && (
              <Button size="sm" onClick={() => navigate(`/khach-hang/thanh-toan/${next.id || next.bookingId}`)}>
                <CreditCard /> Thanh toán lại
              </Button>
            )}
            {next.paymentStatus === "PAID" && (
              <Button size="sm" variant="outline" onClick={() => navigate(`/khach-hang/thanh-toan/${next.id || next.bookingId}/hoa-don`)}>
                <ReceiptText /> Xem hóa đơn
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              className="font-bold text-primary"
              onClick={() => navigate(`/khach-hang/lich-dat/${next.id || next.bookingId}`)}
            >
              Xem chi tiết <ArrowRight />
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
