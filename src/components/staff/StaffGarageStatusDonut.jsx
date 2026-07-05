import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts";
import { CHART } from "../../lib/chart-colors";

/**
 * "Trạng thái gara hôm nay" — donut: Đang rửa / Chờ / Hoàn tất.
 * Dữ liệu thật từ booking hôm nay.
 */
export function StaffGarageStatusDonut({ washing = 0, waiting = 0, completed = 0 }) {
  const total = washing + waiting + completed;
  const data = [
    { name: "Đang rửa", value: washing, color: CHART.c1 },
    { name: "Chờ", value: waiting, color: CHART.c2 },
    { name: "Hoàn tất", value: completed, color: CHART.c4 },
  ];
  const pct = (v) => (total > 0 ? Math.round((v / total) * 100) : 0);

  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <h2 className="font-extrabold text-foreground">Trạng thái gara hôm nay</h2>
      <div className="mt-4 flex items-center gap-5">
        <div className="relative h-28 w-28 shrink-0">
          {total > 0 ? (
            <>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data.filter((d) => d.value > 0)} cx="50%" cy="50%" innerRadius="72%" outerRadius="92%" paddingAngle={2} dataKey="value" stroke="none">
                    {data.filter((d) => d.value > 0).map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-foreground">{total}</span>
                <span className="text-xs font-semibold text-muted-foreground">Tổng xe</span>
              </div>
            </>
          ) : (
            <div className="grid h-full place-items-center rounded-full border-4 border-border text-xs text-neutral-muted">0</div>
          )}
        </div>
        <div className="flex-1 space-y-2.5">
          {data.map((d) => (
            <div key={d.name} className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 font-semibold text-muted-foreground">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.color }} /> {d.name}
              </span>
              <span className="font-bold text-foreground">{d.value} <span className="font-normal text-neutral-muted">({pct(d.value)}%)</span></span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
