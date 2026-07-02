import { Link } from "react-router-dom";
import { formatMoney } from "@/lib/format";

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EF4444", "#64748B"];

/** Doanh thu theo chi nhánh. data: [{ name, revenue, bookings, percentage }] */
export function BranchRevenueTable({ data = [] }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 font-extrabold text-slate-800">Doanh thu theo chi nhánh</h3>
      {data.length > 0 ? (
        <div className="space-y-3">
          {data.map((b, i) => (
            <div key={i} className="text-xs">
              <div className="flex items-center justify-between">
                <span className="truncate font-bold text-slate-700">{b.name}</span>
                <span className="shrink-0 font-black text-slate-800">{formatMoney(b.revenue)}</span>
              </div>
              <div className="mt-1.5 flex items-center gap-2">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full" style={{ width: `${b.percentage}%`, backgroundColor: COLORS[i % COLORS.length] }} />
                </div>
                <span className="w-16 shrink-0 text-right text-[11px] font-semibold text-slate-500">{b.bookings} lịch · {b.percentage}%</span>
              </div>
            </div>
          ))}
          <Link to="/quan-tri/reports" className="mt-1 block text-xs font-bold text-blue-600 hover:underline">
            Xem chi tiết doanh thu theo chi nhánh →
          </Link>
        </div>
      ) : (
        <p className="py-8 text-center text-sm text-slate-400">Chưa có doanh thu theo chi nhánh.</p>
      )}
    </div>
  );
}
