import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import { formatMoney, formatMoneyCompact } from "@/lib/format";
import { CHART } from "../../../lib/chart-colors";

const COLORS = [CHART.c1, CHART.c4, CHART.c2, CHART.c3, CHART.critical, CHART.c5];

/** Doanh thu theo dịch vụ (donut). data: [{ name, value }] */
export function ServiceRevenueDonut({ data = [] }) {
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="flex flex-col rounded-2xl border border-border bg-card p-5 shadow-sm">
      <h3 className="mb-4 text-lg font-bold text-foreground">Doanh thu theo dịch vụ</h3>
      <div className="flex flex-1 flex-col items-center gap-5">
        <div className="relative h-44 w-44 shrink-0">
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
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
                <span className="text-lg font-semibold leading-tight text-foreground">{formatMoneyCompact(total)}</span>
                <span className="mt-0.5 text-xs font-semibold leading-4 text-muted-foreground">
                  Tổng doanh thu
                </span>
              </div>
            </>
          ) : (
            <div className="grid h-full place-items-center rounded-full border-4 border-border text-xs text-neutral-muted">Trống</div>
          )}
        </div>
        <div className="w-full flex-1 space-y-2.5">
          {data.length > 0 ? data.map((d, i) => (
            <div key={i} className="flex items-center justify-between text-xs">
              <span className="flex min-w-0 items-center gap-2">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="truncate font-semibold text-muted-foreground">{d.name}</span>
              </span>
              <span className="shrink-0 font-bold text-foreground">
                {formatMoneyCompact(d.value)}
                <span className="ml-1 font-normal text-neutral-muted">({total ? Math.round((d.value / total) * 100) : 0}%)</span>
              </span>
            </div>
          )) : (
            <p className="text-center text-xs text-neutral-muted">Chưa có dữ liệu.</p>
          )}
        </div>
      </div>
    </div>
  );
}
