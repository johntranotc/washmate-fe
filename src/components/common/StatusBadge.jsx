import { cn } from "@/lib/utils";
import {
  bookingStatusLabels,
  bookingStatusTone,
  paymentStatusLabels,
} from "@/lib/staff-booking-data";

const paymentTone = {
  PENDING: "bg-amber-100 text-amber-700",
  PAID: "bg-emerald-100 text-emerald-700",
  REFUNDED: "bg-slate-100 text-slate-600",
  FAILED: "bg-red-100 text-red-700",
  CANCELLED: "bg-slate-100 text-slate-600",
};

/**
 * Unified status badge.
 *
 * Props:
 *   status  — enum value from BE (e.g. "CONFIRMED", "PAID")
 *   type    — "booking" (default) | "payment"
 *
 * Falls back to a neutral badge for unknown statuses (never crashes).
 */
export default function StatusBadge({ status, type = "booking", className = "" }) {
  if (!status) {
    return (
      <span
        className={cn(
          "inline-block rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-extrabold text-slate-500",
          className,
        )}
      >
        Chưa có
      </span>
    );
  }

  const isPayment = type === "payment";
  const label = isPayment
    ? paymentStatusLabels[status] || status
    : bookingStatusLabels[status] || status;
  const tone = isPayment
    ? paymentTone[status] || "bg-slate-100 text-slate-600"
    : bookingStatusTone[status] || "bg-slate-100 text-slate-600";

  return (
    <span
      className={cn(
        "inline-block rounded-full px-2.5 py-1 text-[10px] font-extrabold",
        tone,
        className,
      )}
    >
      {label}
    </span>
  );
}
