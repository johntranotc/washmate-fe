import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
} from "recharts";
import { cn } from "@/lib/utils";
import { formatMoney, formatMoneyCompact } from "@/lib/format";

const RANGES = [
  { key: "today", label: "Ngày" },
  { key: "week", label: "Tuần" },
  { key: "month", label: "Tháng" },
];

/**
 * Doanh thu theo thời gian (line). Toggle Ngày/Tuần/Tháng điều khiển bộ lọc kỳ ở trang.
 * Đường "kỳ trước" chỉ hiện khi có dữ liệu thật.
 */
export function RevenueTrendChart({ data = [], showPrevious = false, range = "month", onRangeChange }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-extrabold text-slate-800">Doanh thu theo thời gian</h3>
        <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
          {RANGES.map((r) => (
            <button
              key={r.key}
              type="button"
              onClick={() => onRangeChange?.(r.key)}
              className={cn(
                "rounded-md px-3 py-1 text-xs font-bold transition",
                range === r.key ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-800",
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4 flex items-center gap-4">
        <span className="flex items-center gap-1.5"><span className="h-1 w-4 rounded-full bg-blue-500" /><span className="text-xs font-semibold text-slate-500">Doanh thu (đ)</span></span>
        {showPrevious && (
          <span className="flex items-center gap-1.5"><span className="h-0 w-4 border-t-2 border-dashed border-slate-400" /><span className="text-xs font-semibold text-slate-500">Kỳ trước (đ)</span></span>
        )}
      </div>

      <div className="h-[280px] w-full">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 8, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#64748B" }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#64748B" }} tickFormatter={formatMoneyCompact} />
              <RechartsTooltip formatter={(v) => formatMoney(v)} />
              <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
              {showPrevious && <Line type="monotone" dataKey="previousRevenue" stroke="#94A3B8" strokeWidth={2} strokeDasharray="5 5" dot={false} />}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">Chưa có dữ liệu doanh thu trong kỳ đã chọn.</div>
        )}
      </div>
    </div>
  );
}
