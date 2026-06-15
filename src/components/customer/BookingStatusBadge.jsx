import { cn } from "@/lib/utils";
import {
  bookingStatusLabels,
  paymentStatusLabels,
} from "@/lib/customer-booking-data";

const tones = {
  PENDING: "bg-amber-100 text-amber-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  CHECKED_IN: "bg-cyan-100 text-cyan-700",
  WASHING: "bg-violet-100 text-violet-700",
  COMPLETED: "bg-emerald-100 text-emerald-700",
  PAID: "bg-emerald-100 text-emerald-700",
  FAILED: "bg-red-100 text-red-700",
  CANCELLED: "bg-slate-200 text-slate-700",
  NO_SHOW: "bg-orange-100 text-orange-700",
  REFUNDED: "bg-purple-100 text-purple-700",
};

export function StatusBadge({ status, type = "booking", className }) {
  const labels = type === "payment" ? paymentStatusLabels : bookingStatusLabels;
  return (
    <span className={cn("inline-flex rounded-full px-3 py-1.5 text-xs font-extrabold", tones[status] || "bg-slate-100 text-slate-600", className)}>
      {labels[status] || status}
    </span>
  );
}
