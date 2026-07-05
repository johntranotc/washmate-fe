import { Link } from "react-router-dom";
import { formatMoney } from "@/lib/format";
import { CHART } from "../../../lib/chart-colors";

const COLORS = [CHART.c1, CHART.c4, CHART.c2, CHART.c3, CHART.critical, CHART.c5];

/** Doanh thu theo chi nhánh. data: [{ name, revenue, bookings, percentage }] */
export function BranchRevenueTable({ data = [] }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <h3 className="mb-4 font-extrabold text-foreground">Doanh thu theo chi nhánh</h3>
      {data.length > 0 ? (
        <div className="space-y-3">
          {data.map((b, i) => (
            <div key={i} className="text-xs">
              <div className="flex items-center justify-between">
                <span className="truncate font-bold text-ink-soft">{b.name}</span>
                <span className="shrink-0 font-black text-foreground">{formatMoney(b.revenue)}</span>
              </div>
              <div className="mt-1.5 flex items-center gap-2">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full" style={{ width: `${b.percentage}%`, backgroundColor: COLORS[i % COLORS.length] }} />
                </div>
                <span className="w-16 shrink-0 text-right text-xs font-semibold text-muted-foreground">{b.bookings} lịch · {b.percentage}%</span>
              </div>
            </div>
          ))}
          <Link to="/quan-tri/reports" className="mt-1 block text-xs font-bold text-primary hover:underline">
            Xem chi tiết doanh thu theo chi nhánh →
          </Link>
        </div>
      ) : (
        <p className="py-8 text-center text-sm text-neutral-muted">Chưa có doanh thu theo chi nhánh.</p>
      )}
    </div>
  );
}
