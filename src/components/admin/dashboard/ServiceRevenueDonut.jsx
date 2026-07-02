import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import { formatMoney, formatMoneyCompact } from "@/lib/format";

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EF4444", "#64748B"];

/** Doanh thu theo dịch vụ (donut). data: [{ name, value }] */
export function ServiceRevenueDonut({ data = [] }) {
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 font-extrabold text-slate-800">Doanh thu theo dịch vụ</h3>
      <div className="flex flex-1 flex-col items-center gap-5">
        <div className="relative h-40 w-40 shrink-0">
          {data.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data} cx="50%" cy="50%" innerRadius="65%" outerRadius="88%" paddingAngle={2} dataKey="value" stroke="none">
                    {data.map((e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <RechartsTooltip formatter={(v) => formatMoney(v)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-black text-slate-800">{formatMoneyCompact(total)}</span>
                <span className="mt-0.5 text-[10px] font-semibold text-slate-500">Tổng doanh thu</span>
              </div>
            </>
          ) : (
            <div className="grid h-full place-items-center rounded-full border-4 border-slate-100 text-xs text-slate-400">Trống</div>
          )}
        </div>
        <div className="w-full flex-1 space-y-2.5">
          {data.length > 0 ? data.map((d, i) => (
            <div key={i} className="flex items-center justify-between text-xs">
              <span className="flex min-w-0 items-center gap-2">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="truncate font-semibold text-slate-600">{d.name}</span>
              </span>
              <span className="shrink-0 font-bold text-slate-800">
                {formatMoneyCompact(d.value)}
                <span className="ml-1 font-normal text-slate-400">({total ? Math.round((d.value / total) * 100) : 0}%)</span>
              </span>
            </div>
          )) : (
            <p className="text-center text-xs text-slate-400">Chưa có dữ liệu.</p>
          )}
        </div>
      </div>
    </div>
  );
}
