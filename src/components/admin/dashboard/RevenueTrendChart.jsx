import { useMemo, useState } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend,
} from "recharts";
import { cn } from "@/lib/utils";
import { formatMoney, formatMoneyCompact, formatMoneyShort } from "@/lib/format";
import { CHART } from "../../../lib/chart-colors";

/** Grouping granularity for the chart (independent from the page's period filter). */
const GROUPS = [
  { key: "day", label: "Ngày" },
  { key: "week", label: "Tuần" },
  { key: "month", label: "Tháng" },
];

function isoWeekLabel(dateISO) {
  // Bucket by Monday of the week, label "Tuần dd/MM".
  const d = new Date(dateISO + "T00:00:00");
  const day = (d.getDay() + 6) % 7; // 0 = Monday
  d.setDate(d.getDate() - day);
  return `Tuần ${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function labelFor(dateISO, group) {
  if (group === "month") {
    const [y, m] = dateISO.split("-");
    return `${m}/${y}`;
  }
  if (group === "week") return isoWeekLabel(dateISO);
  const [, m, d] = dateISO.split("-");
  return `${d}/${m}`;
}

/**
 * Doanh thu theo thời gian (area chart).
 *
 * data: daily points [{ dateISO: "yyyy-MM-dd", revenue, previousRevenue }] — real data only.
 * The Ngày/Tuần/Tháng toggle re-groups the SAME real data (no interpolation, no fake points).
 * A summary strip (tổng kỳ, TB/ngày, ngày cao nhất) gives the chart business meaning.
 */
export function RevenueTrendChart({ data = [], showPrevious = false }) {
  const [group, setGroup] = useState("day");

  const grouped = useMemo(() => {
    if (group === "day") {
      return data.map((d) => ({ label: labelFor(d.dateISO, "day"), revenue: d.revenue, previousRevenue: d.previousRevenue }));
    }
    const buckets = new Map();
    data.forEach((d) => {
      const key = labelFor(d.dateISO, group);
      const cur = buckets.get(key) || { label: key, revenue: 0, previousRevenue: 0 };
      cur.revenue += d.revenue || 0;
      cur.previousRevenue += d.previousRevenue || 0;
      buckets.set(key, cur);
    });
    return Array.from(buckets.values());
  }, [data, group]);

  const stats = useMemo(() => {
    const total = data.reduce((s, d) => s + (d.revenue || 0), 0);
    const days = data.length || 1;
    let peak = null;
    data.forEach((d) => { if (d.revenue > 0 && (!peak || d.revenue > peak.revenue)) peak = d; });
    return { total, avg: total / days, peak };
  }, [data]);

  const hasRevenue = stats.total > 0;
  const fewPoints = grouped.length <= 14;

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-foreground">Doanh thu theo thời gian</h3>
          <p className="mt-0.5 text-xs font-semibold text-neutral-muted">Chỉ tính lịch hẹn đã hoàn thành trong kỳ đã chọn</p>
        </div>
        <div className="flex gap-1 rounded-lg bg-muted p-1">
          {GROUPS.map((g) => (
            <button
              key={g.key}
              type="button"
              onClick={() => setGroup(g.key)}
              className={cn(
                "rounded-md px-3 py-1 text-xs font-bold transition",
                group === g.key ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary strip — real numbers so the chart has business context */}
      <div className="mb-4 grid grid-cols-3 gap-3 rounded-xl bg-surface p-3">
        <div>
          <p className="text-xs font-semibold text-neutral-muted">Tổng doanh thu kỳ</p>
          <p className="mt-0.5 text-sm font-semibold text-foreground">{formatMoneyShort(stats.total)}</p>
        </div>
        <div className="border-l border-border pl-3">
          <p className="text-xs font-semibold text-neutral-muted">Trung bình / ngày</p>
          <p className="mt-0.5 text-sm font-semibold text-foreground">{formatMoneyShort(stats.avg)}</p>
        </div>
        <div className="border-l border-border pl-3">
          <p className="text-xs font-semibold text-neutral-muted">Cao nhất</p>
          <p className="mt-0.5 text-sm font-semibold text-foreground">
            {stats.peak ? formatMoneyShort(stats.peak.revenue) : "—"}
            {stats.peak && <span className="ml-1 text-xs font-semibold text-neutral-muted">({labelFor(stats.peak.dateISO, "day")})</span>}
          </p>
        </div>
      </div>

      <div className="h-[280px] w-full">
        {grouped.length > 0 && hasRevenue ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={grouped} margin={{ top: 5, right: 8, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={CHART.c1} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={CHART.c1} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={CHART.grid} />
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: CHART.axis }} dy={10} interval="preserveStartEnd" minTickGap={24} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: CHART.axis }} tickFormatter={formatMoneyCompact} width={52} />
              <RechartsTooltip
                formatter={(v, name) => [formatMoney(v), name === "revenue" ? "Doanh thu" : "Kỳ trước"]}
                labelStyle={{ fontWeight: 700, color: CHART.ink }}
                contentStyle={{ borderRadius: 12, border: `1px solid ${CHART.grid}`, fontSize: 12 }}
              />
              <Legend
                verticalAlign="top"
                height={28}
                formatter={(value) => (
                  <span className="text-xs font-semibold text-muted-foreground">{value === "revenue" ? "Doanh thu (đ)" : "Kỳ trước (đ)"}</span>
                )}
              />
              {showPrevious && (
                <Area type="monotone" dataKey="previousRevenue" stroke={CHART.compare} strokeWidth={2} strokeDasharray="5 5" fill="none" dot={false} />
              )}
              <Area
                type="monotone"
                dataKey="revenue"
                stroke={CHART.c1}
                strokeWidth={3}
                fill="url(#revFill)"
                dot={fewPoints ? { r: 4, fill: CHART.c1, strokeWidth: 2, stroke: CHART.contrast } : false}
                activeDot={{ r: 6 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-1 text-center">
            <p className="text-sm font-bold text-muted-foreground">Chưa có doanh thu trong kỳ đã chọn</p>
            <p className="text-xs text-neutral-muted">Doanh thu được ghi nhận khi lịch hẹn chuyển sang trạng thái Hoàn thành.</p>
          </div>
        )}
      </div>
    </div>
  );
}
