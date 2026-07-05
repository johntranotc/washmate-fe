import { Check, Circle, CircleX, Clock } from "lucide-react";
import { bookingStatusLabels } from "@/lib/status-tones";
import { cn } from "@/lib/utils";

const steps = ["PENDING", "CONFIRMED", "CHECKED_IN", "WASHING", "COMPLETED"];

export function BookingTimeline({ booking }) {
  if (booking.bookingStatus === "PENDING") {
    return (
      <div className="mt-6 flex items-center gap-4 rounded-2xl border border-warning/30 bg-warning-container p-5 text-warning">
        <span className="grid size-11 place-items-center rounded-2xl bg-card"><Clock size={20} /></span>
        <div>
          <strong>Chờ gara xác nhận</strong>
          <p className="mt-1 text-sm">Gara đang xem xét lịch đặt của bạn. Vui lòng chờ trong giây lát.</p>
        </div>
      </div>
    );
  }

  if (booking.bookingStatus === "REJECTED") {
    return (
      <div className="mt-6 flex items-center gap-4 rounded-2xl border border-critical/25 bg-critical-container p-5 text-critical">
        <span className="grid size-11 place-items-center rounded-2xl bg-card"><CircleX /></span>
        <div>
          <strong>Gara từ chối lịch đặt</strong>
          <p className="mt-1 text-sm">Gara không thể nhận lịch này. Vui lòng đặt lịch mới hoặc chọn gara khác.</p>
        </div>
      </div>
    );
  }

  if (["CANCELLED", "NO_SHOW"].includes(booking.bookingStatus)) {
    return (
      <div className="mt-6 flex items-center gap-4 rounded-2xl border border-critical/25 bg-critical-container p-5 text-critical">
        <span className="grid size-11 place-items-center rounded-2xl bg-card"><CircleX /></span>
        <div>
          <strong>{bookingStatusLabels[booking.bookingStatus]}</strong>
          <p className="mt-1 text-sm">Lịch đặt đã dừng và không tiếp tục theo tiến trình dịch vụ.</p>
        </div>
      </div>
    );
  }

  const currentIndex = Math.max(0, steps.indexOf(booking.bookingStatus));

  return (
    <ol className="mt-7 grid gap-4 md:grid-cols-5">
      {steps.map((status, index) => {
        const done = index <= currentIndex;
        return (
          <li key={status} className="relative">
            {index < steps.length - 1 && <span className={cn("absolute left-5 top-5 hidden h-0.5 w-[calc(100%-20px)] md:block", index < currentIndex ? "bg-primary" : "bg-border")} />}
            <div className="relative z-10 flex items-center gap-3 md:block">
              <span className={cn("grid size-10 shrink-0 place-items-center rounded-full border-2", done ? "border-primary bg-primary text-white" : "border-border bg-card text-neutral-muted")}>
                {done ? <Check size={18} strokeWidth={3} /> : <Circle size={14} />}
              </span>
              <div className="md:mt-3">
                <strong className={cn("text-sm", done ? "text-foreground" : "text-muted-foreground")}>{bookingStatusLabels[status]}</strong>
                <p className="mt-1 text-xs text-muted-foreground">Bước {index + 1}</p>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
