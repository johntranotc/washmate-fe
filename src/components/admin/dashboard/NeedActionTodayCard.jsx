import { Link } from "react-router-dom";
import { CalendarClock, Clock3, ReceiptText, Undo2, ArrowRight } from "lucide-react";
import { formatNumber } from "@/lib/format";

/**
 * "Cần xử lý hôm nay / ngay" — 4 chỉ số vận hành tính từ booking/payment thật.
 * BE chưa có trạng thái "hoàn tiền chờ xử lý" hay "đối soát" riêng nên dùng
 * 2 chỉ số thật gần nhất: thanh toán thất bại và đã hoàn tiền trong kỳ.
 * `onItemClick(key)` (tùy chọn): thay vì điều hướng, filter danh sách tại chỗ.
 */
export function NeedActionTodayCard({
  title = "Cần xử lý hôm nay",
  pending = 0,
  overdue = 0,
  failedPayments = 0,
  refunded = 0,
  onItemClick,
}) {
  const items = [
    { key: "pending", label: "Lịch hẹn đang chờ xác nhận", value: pending, Icon: CalendarClock, tone: "text-warning bg-warning-container" },
    { key: "overdue", label: "Lịch đã quá giờ nhưng chưa check-in", value: overdue, Icon: Clock3, tone: "text-no-show bg-no-show-container" },
    { key: "failed", label: "Thanh toán thất bại cần đối soát", value: failedPayments, Icon: ReceiptText, tone: "text-critical bg-critical-container" },
    { key: "refunded", label: "Đã hoàn tiền trong kỳ", value: refunded, Icon: Undo2, tone: "text-primary bg-primary-container" },
  ];

  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-foreground">{title}</h2>
        {!onItemClick && (
          <Link to="/quan-tri/bookings" className="flex items-center gap-1 text-xs font-bold text-primary hover:underline">
            Xem hàng đợi xử lý <ArrowRight size={14} />
          </Link>
        )}
      </div>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {items.map(({ key, label, value, Icon, tone }) => {
          const inner = (
            <>
              <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${tone}`}>
                <Icon size={18} />
              </span>
              <span className="min-w-0">
                <b className="block text-xl font-bold text-foreground">{formatNumber(value)}</b>
                <span className="block text-xs leading-4 text-muted-foreground">{label}</span>
              </span>
            </>
          );
          const cls =
            "flex w-full items-center gap-3 rounded-xl border border-border bg-surface p-3.5 text-left transition hover:border-primary/20 hover:bg-primary-container";
          return onItemClick ? (
            <button key={key} type="button" onClick={() => onItemClick(key)} className={cls}>
              {inner}
            </button>
          ) : (
            <Link key={key} to="/quan-tri/bookings" className={cls}>
              {inner}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
