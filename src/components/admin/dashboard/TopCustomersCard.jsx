import { Link } from "react-router-dom";
import { formatMoneyCompact } from "@/lib/format";

/** Top khách hàng thân thiết. data: [{ name, bookings, spend }] */
export function TopCustomersCard({ data = [] }) {
  return (
    <div className="flex flex-col rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-extrabold text-foreground">Top khách hàng thân thiết</h3>
      </div>
      <div className="mb-2 flex justify-between text-xs font-semibold text-neutral-muted">
        <span>Khách hàng</span>
        <div className="flex gap-4">
          <span className="w-12 text-right">Lần rửa</span>
          <span className="w-20 text-right">Chi tiêu</span>
        </div>
      </div>
      <div className="flex-1 space-y-3">
        {data.length > 0 ? data.map((c, i) => (
          <div key={i} className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-2">
              <span className="w-3 font-black text-neutral-muted">{i + 1}</span>
              <span className="max-w-[110px] truncate font-bold text-ink-soft">{c.name}</span>
            </span>
            <div className="flex gap-4">
              <span className="w-12 text-right font-black text-foreground">{c.bookings}</span>
              <span className="w-20 text-right font-bold text-primary">{formatMoneyCompact(c.spend)}</span>
            </div>
          </div>
        )) : (
          <p className="py-6 text-center text-xs text-neutral-muted">Chưa có dữ liệu.</p>
        )}
      </div>
      <Link to="/quan-tri/users" className="mt-4 text-xs font-bold text-primary hover:underline">Xem tất cả khách hàng →</Link>
    </div>
  );
}
