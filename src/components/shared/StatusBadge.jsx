import { cn } from "@/lib/utils";
import {
  bookingStatusLabels,
  bookingStatusTones,
  paymentStatusLabels,
  paymentStatusTones,
  NEUTRAL_TONE,
} from "@/lib/status-tones";

const SIZES = {
  sm: "px-2.5 py-0.5", // bảng dày Admin/Staff
  md: "px-3 py-1.5", // card/detail Customer
};

/**
 * Badge trạng thái hợp nhất cho cả 3 portal.
 * Props: status (enum BE), type "booking"|"payment", size "sm"|"md".
 * Status lạ → badge trung tính, không crash.
 */
export function StatusBadge({ status, type = "booking", size = "md", className }) {
  const isPayment = type === "payment";
  const labels = isPayment ? paymentStatusLabels : bookingStatusLabels;
  const tones = isPayment ? paymentStatusTones : bookingStatusTones;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full text-xs font-bold whitespace-nowrap",
        SIZES[size] || SIZES.md,
        (status && tones[status]) || NEUTRAL_TONE,
        className,
      )}
    >
      {status ? labels[status] || status : "Chưa có"}
    </span>
  );
}

export default StatusBadge;
