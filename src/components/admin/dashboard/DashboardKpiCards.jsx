import { CircleDollarSign, CalendarDays, CheckCircle2, Clock, XOctagon, UserPlus } from "lucide-react";
import { formatMoney, formatMoneyShort, formatNumber } from "@/lib/format";

/**
 * KPI cards for the owner dashboard.
 *
 * All values are real (derived from booking data by the page).
 * `changes` is an optional map of percent-change vs. the previous period,
 * e.g. { revenue: 12.5, bookings: -3.2 }. When a value is null/undefined the
 * change row is hidden (we never invent a comparison number).
 *
 * The revenue value is NEVER truncated: it renders in adaptive form
 * ("9.980.000 đ" / "125,68 Tr đ") with the exact amount shown underneath.
 */
export function DashboardKpiCards({
  revenue = 0,
  bookings = 0,
  completed = 0,
  processing = 0,
  cancelled = 0,
  newCustomers = 0,
  changes = {},
}) {
  const revenueShort = formatMoneyShort(revenue);
  const revenueFull = formatMoney(revenue);
  const kpis = [
    {
      key: "revenue", title: "Tổng doanh thu", value: revenueShort,
      subtitle: revenueShort !== revenueFull ? revenueFull : null,
      icon: <CircleDollarSign size={22} className="text-blue-600" />, color: "bg-blue-50", ring: "ring-blue-100",
    },
    { key: "bookings", title: "Tổng lịch hẹn", value: formatNumber(bookings), icon: <CalendarDays size={22} className="text-indigo-600" />, color: "bg-indigo-50", ring: "ring-indigo-100" },
    { key: "completed", title: "Đã hoàn thành", value: formatNumber(completed), icon: <CheckCircle2 size={22} className="text-emerald-600" />, color: "bg-emerald-50", ring: "ring-emerald-100" },
    { key: "processing", title: "Đang xử lý", value: formatNumber(processing), icon: <Clock size={22} className="text-amber-600" />, color: "bg-amber-50", ring: "ring-amber-100" },
    { key: "cancelled", title: "Đã hủy / No-show", value: formatNumber(cancelled), icon: <XOctagon size={22} className="text-red-600" />, color: "bg-red-50", ring: "ring-red-100" },
    { key: "newCustomers", title: "Khách hàng mới", value: formatNumber(newCustomers), icon: <UserPlus size={22} className="text-cyan-600" />, color: "bg-cyan-50", ring: "ring-cyan-100" },
  ];

  return (
    <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
      {kpis.map((kpi) => {
        const change = changes?.[kpi.key];
        const hasChange = typeof change === "number" && Number.isFinite(change);
        const up = hasChange && change >= 0;
        // For "cancelled", an increase is bad news — tint accordingly.
        const positive = kpi.key === "cancelled" ? !up : up;
        return (
          <div key={kpi.key} className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs font-bold text-slate-500">{kpi.title}</p>
              <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ring-4 ${kpi.color} ${kpi.ring}`}>
                {kpi.icon}
              </div>
            </div>
            <div className="mt-1 min-w-0">
              <h3 className="text-[22px] font-black leading-tight tracking-tight text-slate-900" title={kpi.subtitle || undefined}>
                {kpi.value}
              </h3>
              {kpi.subtitle && (
                <p className="mt-0.5 text-[11px] font-semibold text-slate-400">{kpi.subtitle}</p>
              )}
            </div>
            {hasChange ? (
              <div className="mt-3 flex items-center gap-1.5">
                <span className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-black ${positive ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}>
                  {up ? "↗" : "↘"} {up ? "+" : ""}{change.toFixed(1)}%
                </span>
                <span className="text-[10px] font-semibold text-slate-400">so với kỳ trước</span>
              </div>
            ) : (
              <div className="mt-3 h-[17px]" />
            )}
          </div>
        );
      })}
    </div>
  );
}
