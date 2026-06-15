import { Check, Circle, CircleX } from "lucide-react";
import { bookingStatusLabels } from "@/lib/customer-booking-data";
import { cn } from "@/lib/utils";

const steps = ["PENDING", "CONFIRMED", "CHECKED_IN", "WASHING", "COMPLETED"];

export function BookingTimeline({ booking }) {
  if (["CANCELLED", "NO_SHOW"].includes(booking.bookingStatus)) {
    return (
      <div className="mt-6 flex items-center gap-4 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
        <span className="grid size-11 place-items-center rounded-2xl bg-white"><CircleX /></span>
        <div>
          <strong>{bookingStatusLabels[booking.bookingStatus]}</strong>
          <p className="mt-1 text-sm">Lịch đặt đã dừng và không tiếp tục theo tiến trình dịch vụ.</p>
        </div>
      </div>
    );
  }

  const effectiveStatus =
    booking.paymentStatus !== "PAID" && booking.bookingStatus === "CONFIRMED"
      ? "PENDING"
      : booking.bookingStatus;
  const currentIndex = Math.max(0, steps.indexOf(effectiveStatus));

  return (
    <ol className="mt-7 grid gap-4 md:grid-cols-5">
      {steps.map((status, index) => {
        const done = index <= currentIndex;
        return (
          <li key={status} className="relative">
            {index < steps.length - 1 && <span className={cn("absolute left-5 top-5 hidden h-0.5 w-[calc(100%-20px)] md:block", index < currentIndex ? "bg-[var(--brand-blue)]" : "bg-[var(--border-soft)]")} />}
            <div className="relative z-10 flex items-center gap-3 md:block">
              <span className={cn("grid size-10 shrink-0 place-items-center rounded-full border-2", done ? "border-[var(--brand-blue)] bg-[var(--brand-blue)] text-white" : "border-[var(--border-soft)] bg-white text-slate-300")}>
                {done ? <Check size={17} strokeWidth={3} /> : <Circle size={13} />}
              </span>
              <div className="md:mt-3">
                <strong className={cn("text-sm", done ? "text-[var(--text-main)]" : "text-[var(--text-muted)]")}>{bookingStatusLabels[status]}</strong>
                <p className="mt-1 text-xs text-[var(--text-muted)]">Bước {index + 1}</p>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
