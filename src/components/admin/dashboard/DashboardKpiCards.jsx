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
      icon: <CircleDollarSign size={20} className="text-primary" />, color: "bg-primary-container", ring: "ring-primary/15",
    },
    { key: "bookings", title: "Tổng lịch hẹn", value: formatNumber(bookings), icon: <CalendarDays size={20} className="text-accent-indigo" />, color: "bg-accent-indigo/10", ring: "ring-accent-indigo/15" },
    { key: "completed", title: "Đã hoàn thành", value: formatNumber(completed), icon: <CheckCircle2 size={20} className="text-success" />, color: "bg-success-container", ring: "ring-success/15" },
    { key: "processing", title: "Đang xử lý", value: formatNumber(processing), icon: <Clock size={20} className="text-warning" />, color: "bg-warning-container", ring: "ring-warning/15" },
    { key: "cancelled", title: "Đã hủy / No-show", value: formatNumber(cancelled), icon: <XOctagon size={20} className="text-critical" />, color: "bg-critical-container", ring: "ring-critical/15" },
    { key: "newCustomers", title: "Khách hàng mới", value: formatNumber(newCustomers), icon: <UserPlus size={20} className="text-accent-cyan" />, color: "bg-accent-cyan/10", ring: "ring-accent-cyan/15" },
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
          <div key={kpi.key} className="flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:shadow-card">
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs font-bold text-muted-foreground">{kpi.title}</p>
              <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ring-4 ${kpi.color} ${kpi.ring}`}>
                {kpi.icon}
              </div>
            </div>
            <div className="mt-1 min-w-0">
              <h3 className="text-2xl font-extrabold leading-tight tracking-tight text-foreground" title={kpi.subtitle || undefined}>
                {kpi.value}
              </h3>
              {kpi.subtitle && (
                <p className="mt-0.5 text-xs font-semibold text-neutral-muted">{kpi.subtitle}</p>
              )}
            </div>
            {hasChange ? (
              <div className="mt-3 flex items-center gap-1.5">
                <span className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs font-black ${positive ? "bg-success-container text-success" : "bg-critical-container text-critical"}`}>
                  {up ? "↗" : "↘"} {up ? "+" : ""}{change.toFixed(1)}%
                </span>
                <span className="text-xs font-semibold text-neutral-muted">so với kỳ trước</span>
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
