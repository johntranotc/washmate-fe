import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts";

/**
 * "Trạng thái gara hôm nay" — donut: Đang rửa / Chờ / Hoàn tất.
 * Dữ liệu thật từ booking hôm nay.
 */
export function StaffGarageStatusDonut({ washing = 0, waiting = 0, completed = 0 }) {
  const total = washing + waiting + completed;
  const data = [
    { name: "Đang rửa", value: washing, color: "#3B82F6" },
    { name: "Chờ", value: waiting, color: "#F59E0B" },
    { name: "Hoàn tất", value: completed, color: "#10B981" },
  ];
  const pct = (v) => (total > 0 ? Math.round((v / total) * 100) : 0);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <h2 className="font-extrabold text-slate-800">Trạng thái gara hôm nay</h2>
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
                <span className="text-2xl font-black text-slate-800">{total}</span>
                <span className="text-[10px] font-semibold text-slate-500">Tổng xe</span>
              </div>
            </>
          ) : (
            <div className="grid h-full place-items-center rounded-full border-4 border-slate-100 text-xs text-slate-400">0</div>
          )}
        </div>
        <div className="flex-1 space-y-2.5">
          {data.map((d) => (
            <div key={d.name} className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 font-semibold text-slate-600">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.color }} /> {d.name}
              </span>
              <span className="font-bold text-slate-800">{d.value} <span className="font-normal text-slate-400">({pct(d.value)}%)</span></span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
