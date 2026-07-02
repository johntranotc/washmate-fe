import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";

/** Tình trạng lịch hẹn (donut). data: [{ name, value, percentage, color }] */
export function BookingStatusDonut({ data = [] }) {
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 font-extrabold text-slate-800">Tình trạng lịch hẹn</h3>
      <div className="flex items-center gap-4">
        <div className="relative h-28 w-28 shrink-0">
          {data.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data} cx="50%" cy="50%" innerRadius="74%" outerRadius="92%" paddingAngle={2} dataKey="value" stroke="none">
                    {data.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-black text-slate-800">{total}</span>
                <span className="text-center text-[9px] font-semibold leading-none text-slate-500">Tổng<br />lịch hẹn</span>
              </div>
            </>
          ) : (
            <div className="grid h-full place-items-center rounded-full border-4 border-slate-100 text-xs text-slate-400">Trống</div>
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          {data.length > 0 ? data.map((d, i) => (
            <div key={i} className="flex items-center justify-between gap-1 text-[11px]">
              <span className="flex min-w-0 items-center gap-1.5">
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="truncate font-bold text-slate-600">{d.name}</span>
              </span>
              <span className="shrink-0 font-bold text-slate-800">{d.value} <span className="font-normal text-slate-400">({d.percentage}%)</span></span>
            </div>
          )) : (
            <p className="text-center text-xs text-slate-400">Chưa có dữ liệu.</p>
          )}
        </div>
      </div>
    </div>
  );
}
