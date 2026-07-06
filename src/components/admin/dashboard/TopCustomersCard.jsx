import { Link } from "react-router-dom";
import { formatMoneyCompact } from "@/lib/format";

/** Top khách hàng thân thiết. data: [{ name, bookings, spend }] */
export function TopCustomersCard({ data = [] }) {
  return (
    <div className="flex flex-col rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold text-foreground">Top khách hàng thân thiết</h3>
      </div>
      {/* Grid cột cố định để header và các dòng luôn thẳng hàng nhau */}
      <div className="mb-2 grid grid-cols-[minmax(0,1fr)_3.5rem_5rem] gap-2 text-xs font-semibold text-neutral-muted">
        <span>Khách hàng</span>
        <span className="text-right">Lần rửa</span>
        <span className="text-right">Chi tiêu</span>
      </div>
      <div className="flex-1 space-y-3">
        {data.length > 0 ? data.map((c, i) => (
          <div key={i} className="grid grid-cols-[minmax(0,1fr)_3.5rem_5rem] items-center gap-2 text-xs">
            <span className="flex min-w-0 items-center gap-2">
              <span className="w-3 shrink-0 font-bold text-neutral-muted">{i + 1}</span>
              <span className="truncate font-bold text-ink-soft">{c.name}</span>
            </span>
            <span className="text-right font-bold text-foreground">{c.bookings}</span>
            <span className="text-right font-bold text-primary">{formatMoneyCompact(c.spend)}</span>
          </div>
        )) : (
          <p className="py-6 text-center text-xs text-neutral-muted">Chưa có dữ liệu.</p>
        )}
      </div>
      <Link to="/quan-tri/users" className="mt-4 text-xs font-bold text-primary hover:underline">Xem tất cả khách hàng →</Link>
    </div>
  );
}
