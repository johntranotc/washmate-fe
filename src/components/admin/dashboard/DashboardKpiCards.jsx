import { CircleDollarSign, CalendarDays, CheckCircle2, Clock, XOctagon, UserPlus } from "lucide-react";
import { formatMoney } from "@/lib/format";

/**
 * KPI cards for the owner dashboard.
 *
 * All values are real (derived from booking data by the page).
 * `changes` is an optional map of percent-change vs. the previous period,
 * e.g. { revenue: 12.5, bookings: -3.2 }. When a value is null/undefined the
 * change row is hidden (we never invent a comparison number).
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
  const kpis = [
    { key: "revenue", title: "Tổng doanh thu", value: formatMoney(revenue), icon: <CircleDollarSign size={24} className="text-blue-600" />, color: "bg-blue-50" },
    { key: "bookings", title: "Tổng lịch hẹn", value: bookings, icon: <CalendarDays size={24} className="text-emerald-600" />, color: "bg-emerald-50" },
    { key: "completed", title: "Đã hoàn thành", value: completed, icon: <CheckCircle2 size={24} className="text-indigo-600" />, color: "bg-indigo-50" },
    { key: "processing", title: "Đang xử lý", value: processing, icon: <Clock size={24} className="text-orange-600" />, color: "bg-orange-50" },
    { key: "cancelled", title: "Đã hủy / No-show", value: cancelled, icon: <XOctagon size={24} className="text-red-600" />, color: "bg-red-50" },
    { key: "newCustomers", title: "Khách hàng mới", value: newCustomers, icon: <UserPlus size={24} className="text-blue-600" />, color: "bg-blue-50" },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 mb-6">
      {kpis.map((kpi) => {
        const change = changes?.[kpi.key];
        const hasChange = typeof change === "number" && Number.isFinite(change);
        const up = hasChange && change >= 0;
        return (
          <div key={kpi.key} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between">
            <div className="flex items-center gap-3 xl:gap-4">
              <div className={`flex h-12 w-12 xl:h-14 xl:w-14 shrink-0 items-center justify-center rounded-2xl ${kpi.color}`}>
                {kpi.icon}
              </div>
              <div className="min-w-0">
                <p className="text-[11px] xl:text-xs font-bold text-slate-500 mb-0.5">{kpi.title}</p>
                <h3 className="text-lg xl:text-2xl font-black text-slate-800 tracking-tight truncate">{kpi.value}</h3>
              </div>
            </div>
            {hasChange ? (
              <div className="mt-3 xl:mt-4 flex items-center gap-1.5">
                <span className={`text-[10px] xl:text-xs font-black ${up ? "text-emerald-500" : "text-red-500"}`}>
                  {up ? "↗" : "↘"} {up ? "+" : ""}{change.toFixed(1)}%
                </span>
                <span className="text-[10px] text-slate-400 font-semibold">so với kỳ trước</span>
              </div>
            ) : (
              <div className="mt-3 xl:mt-4 h-4" />
            )}
          </div>
        );
      })}
    </div>
  );
}
