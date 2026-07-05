import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { isUrgent } from "@/lib/staff-booking-data";

// Tab trạng thái của Hàng đợi — matcher chạy trên booking thật, count tính từ data fetch.
export const QUEUE_TABS = [
  { key: "ALL", label: "Tất cả", match: () => true },
  { key: "PENDING", label: "Chờ xác nhận", match: (b) => b.bookingStatus === "PENDING" },
  {
    key: "UNPAID",
    label: "Chờ thanh toán",
    match: (b) => ["PENDING", "CONFIRMED"].includes(b.bookingStatus) && b.paymentStatus !== "PAID",
  },
  { key: "CONFIRMED", label: "Chờ check-in", match: (b) => b.bookingStatus === "CONFIRMED" },
  { key: "CHECKED_IN", label: "Đã check-in", match: (b) => b.bookingStatus === "CHECKED_IN" },
  { key: "WASHING", label: "Đang rửa", match: (b) => b.bookingStatus === "WASHING" },
  { key: "NEED_ACTION", label: "Cần xử lý", match: (b) => isUrgent(b) },
  { key: "NO_SHOW", label: "No-show", match: (b) => b.bookingStatus === "NO_SHOW" },
  { key: "COMPLETED", label: "Hoàn tất", match: (b) => b.bookingStatus === "COMPLETED" },
  { key: "REJECTED", label: "Từ chối", match: (b) => b.bookingStatus === "REJECTED" },
  { key: "CANCELLED", label: "Hủy", match: (b) => b.bookingStatus === "CANCELLED" },
];

export const DATE_RANGES = [
  { key: "TODAY", label: "Hôm nay" },
  { key: "TOMORROW", label: "Ngày mai" },
  { key: "WEEK", label: "Tuần này" },
];

/**
 * Thanh công cụ Hàng đợi: search (lọc data thật đã fetch), chip khoảng ngày,
 * tab trạng thái với count thật. Các filter "Việc của tôi"/"Chưa phân công"/
 * "Tất cả khoang" không hiển thị vì BE chưa expose assignedStaff/khoang qua API.
 */
export function StaffQueueFilters({
  keyword,
  onKeyword,
  dateKey,
  onDateKey,
  tab,
  onTab,
  counts = {},
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <label className="flex h-10 flex-1 items-center gap-2 rounded-xl border border-border px-3 lg:max-w-md">
          <Search size={16} className="text-neutral-muted" />
          <input
            value={keyword}
            onChange={(e) => onKeyword(e.target.value)}
            placeholder="Tìm mã booking, tên khách, SĐT, biển số..."
            className="w-full bg-transparent text-sm outline-none"
          />
        </label>

        <div className="flex shrink-0 gap-1 rounded-xl border border-border bg-surface p-1">
          {DATE_RANGES.map((r) => (
            <button
              key={r.key}
              type="button"
              onClick={() => onDateKey(r.key)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-bold transition",
                dateKey === r.key ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="no-scrollbar mt-3 flex gap-1 overflow-x-auto border-t border-border pt-3">
        {QUEUE_TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => onTab(t.key)}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition",
              tab === t.key
                ? "bg-primary text-white"
                : "bg-surface text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
            <span
              className={cn(
                "grid h-4 min-w-4 place-items-center rounded-full px-1 text-xs font-bold",
                tab === t.key ? "bg-card/25 text-white" : "bg-muted text-muted-foreground",
              )}
            >
              {counts[t.key] ?? 0}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
